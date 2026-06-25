import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const ordersFilePath = path.join(process.cwd(), 'src', 'lib', 'orders.json');

async function readOrders() {
  try {
    const data = await fs.readFile(ordersFilePath, 'utf8');
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
}

async function writeOrders(orders: any) {
  await fs.writeFile(ordersFilePath, JSON.stringify(orders, null, 2), 'utf8');
}

// GET: Fetch all orders
export async function GET(req: Request) {
  try {
    const orders = await readOrders();
    return NextResponse.json({ success: true, orders });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

// POST: Place a new order
export async function POST(req: Request) {
  try {
    const order = await req.json();
    const orders = await readOrders();
    
    const newOrder = {
      ...order,
      id: order.id || 'ord-' + Math.random().toString(36).substr(2, 9),
      created_at: order.created_at || new Date().toISOString(),
      status: order.status || 'Pending'
    };
    
    orders.unshift(newOrder); // Add to the top of list
    await writeOrders(orders);
    
    return NextResponse.json({ success: true, order: newOrder });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

// PUT: Update order status
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, status } = body;
    
    if (!id || !status) {
      return NextResponse.json({ error: 'Order ID and status are required' }, { status: 400 });
    }
    
    const orders = await readOrders();
    const index = orders.findIndex((o: any) => o.id === id);
    
    if (index === -1) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    
    orders[index].status = status;
    await writeOrders(orders);
    
    return NextResponse.json({ success: true, order: orders[index] });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
