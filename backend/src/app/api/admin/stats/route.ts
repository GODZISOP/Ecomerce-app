import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const menuFilePath = path.join(process.cwd(), 'src', 'lib', 'menu.json');
const ordersFilePath = path.join(process.cwd(), 'src', 'lib', 'orders.json');

async function readMenu() {
  try {
    const data = await fs.readFile(menuFilePath, 'utf8');
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
}

async function readOrders() {
  try {
    const data = await fs.readFile(ordersFilePath, 'utf8');
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
}

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    if (authHeader !== 'Bearer medimart_session_token_2026_verified') {
      return NextResponse.json({ error: 'Unauthorized access' }, { status: 401 });
    }
    
    const orders = await readOrders();
    const medicines = await readMenu();
    
    const safeOrders = orders || [];
    const safeMedicines = medicines || [];
    
    // Basic Counters
    const totalOrders = safeOrders.length;
    const pendingOrders = safeOrders.filter((o: any) => o.status === 'Pending').length;
    const dispatchedOrders = safeOrders.filter((o: any) => o.status === 'Dispatched').length;
    const deliveredOrders = safeOrders.filter((o: any) => o.status === 'Delivered').length;
    const cancelledOrders = safeOrders.filter((o: any) => o.status === 'Cancelled').length;
    
    // Total Delivered Revenue
    const totalRevenue = safeOrders
      .filter((o: any) => o.status === 'Delivered')
      .reduce((sum: number, o: any) => sum + (o.grand_total || 0), 0);
      
    // Rx Pending Orders
    const rxPendingOrders = safeOrders
      .filter((o: any) => o.status === 'Pending' && o.items && Array.isArray(o.items) && o.items.some((i: any) => i.requires_prescription))
      .length;
      
    // City breakdown
    const cityBreakdown: Record<string, number> = {};
    safeOrders.forEach((o: any) => {
      if (o.city) {
        cityBreakdown[o.city] = (cityBreakdown[o.city] || 0) + 1;
      }
    });
    
    // Category sales breakdown (based on items sold in Delivered orders)
    const categorySales: Record<string, number> = {};
    const medicineCategoryMap: Record<string, string> = {};
    
    safeMedicines.forEach((m: any) => {
      medicineCategoryMap[m.name.toLowerCase()] = m.category;
    });
    
    safeOrders
      .filter((o: any) => o.status === 'Delivered')
      .forEach((o: any) => {
        if (o.items && Array.isArray(o.items)) {
          o.items.forEach((item: any) => {
            const cat = item.category || medicineCategoryMap[item.name.toLowerCase()] || 'Pizza';
            const value = (item.price_pkr || 0) * (item.quantity || 1);
            categorySales[cat] = (categorySales[cat] || 0) + value;
          });
        }
      });
      
    // Daily order volume for last 7 days
    const dailyVolumes: Record<string, { count: number, revenue: number }> = {};
    
    // Initialize last 7 days
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString('en-PK', { month: 'short', day: 'numeric' });
      dailyVolumes[dateStr] = { count: 0, revenue: 0 };
    }
    
    safeOrders.forEach((o: any) => {
      const date = new Date(o.created_at);
      const dateStr = date.toLocaleDateString('en-PK', { month: 'short', day: 'numeric' });
      if (dailyVolumes[dateStr]) {
        dailyVolumes[dateStr].count += 1;
        if (o.status === 'Delivered') {
          dailyVolumes[dateStr].revenue += (o.grand_total || 0);
        }
      }
    });
    
    // Total medicines inventory value
    const totalInventoryValue = safeMedicines.reduce((sum: number, m: any) => sum + ((m.price_pkr || 0) * (m.stock || 0)), 0);
    const totalInventoryCount = safeMedicines.reduce((sum: number, m: any) => sum + (m.stock || 0), 0);
    const lowStockMedicines = safeMedicines.filter((m: any) => (m.stock || 0) < 15).length;
    
    return NextResponse.json({
      success: true,
      stats: {
        counters: {
          totalOrders,
          pendingOrders,
          dispatchedOrders,
          deliveredOrders,
          cancelledOrders,
          totalRevenue,
          rxPendingOrders,
          totalInventoryValue,
          totalInventoryCount,
          lowStockMedicines
        },
        cityBreakdown: Object.entries(cityBreakdown).map(([name, value]) => ({ name, value })),
        categorySales: Object.entries(categorySales).map(([name, value]) => ({ name, value })),
        dailyVolumes: Object.entries(dailyVolumes).map(([date, data]) => ({ date, count: data.count, revenue: data.revenue }))
      }
    });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
