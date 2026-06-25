import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const menuFilePath = path.join(process.cwd(), 'src', 'lib', 'menu.json');

function checkAuth(req: Request) {
  const authHeader = req.headers.get('authorization');
  if (authHeader !== 'Bearer medimart_session_token_2026_verified') {
    return false;
  }
  return true;
}

async function readMenu() {
  try {
    const data = await fs.readFile(menuFilePath, 'utf8');
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
}

async function writeMenu(menu: any) {
  await fs.writeFile(menuFilePath, JSON.stringify(menu, null, 2), 'utf8');
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    
    let medicines = await readMenu();
    
    if (category && category !== 'All') {
      medicines = medicines.filter((m: any) => m.category === category);
    }
    
    if (search) {
      const s = search.toLowerCase();
      medicines = medicines.filter((m: any) => 
        m.name.toLowerCase().includes(s) || 
        m.generic_name.toLowerCase().includes(s) || 
        m.description.toLowerCase().includes(s)
      );
    }
    
    return NextResponse.json({ success: true, medicines });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    if (!checkAuth(req)) {
      return NextResponse.json({ error: 'Unauthorized access' }, { status: 401 });
    }
    
    const body = await req.json();
    const { name, generic_name, category, price_pkr, stock, dosage, description, manufacturer, requires_prescription, image_url } = body;
    
    if (!name || !category || price_pkr === undefined || stock === undefined) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }
    
    const medicines = await readMenu();
    const maxId = medicines.reduce((max: number, m: any) => m.id > max ? m.id : max, 0);
    const nextId = maxId + 1;
    
    const newMedicine = {
      id: nextId,
      name,
      generic_name: generic_name || '',
      category,
      price_pkr: Number(price_pkr),
      stock: Number(stock),
      dosage: dosage || '',
      description: description || '',
      manufacturer: manufacturer || 'Fatpizza Kitchen',
      requires_prescription: !!requires_prescription,
      image_url: image_url || 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop&q=80'
    };
    
    medicines.push(newMedicine);
    await writeMenu(medicines);
    
    return NextResponse.json({ success: true, medicine: newMedicine });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    if (!checkAuth(req)) {
      return NextResponse.json({ error: 'Unauthorized access' }, { status: 401 });
    }
    
    const body = await req.json();
    const { id, name, generic_name, category, price_pkr, stock, dosage, description, manufacturer, requires_prescription, image_url } = body;
    
    if (!id || !name || !category || price_pkr === undefined || stock === undefined) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }
    
    let medicines = await readMenu();
    const index = medicines.findIndex((m: any) => m.id === Number(id));
    if (index === -1) {
      return NextResponse.json({ error: 'Medicine not found' }, { status: 404 });
    }
    
    const updated = {
      id: Number(id),
      name,
      generic_name: generic_name || '',
      category,
      price_pkr: Number(price_pkr),
      stock: Number(stock),
      dosage: dosage || '',
      description: description || '',
      manufacturer: manufacturer || 'Fatpizza Kitchen',
      requires_prescription: !!requires_prescription,
      image_url: image_url || 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop&q=80'
    };
    
    medicines[index] = updated;
    await writeMenu(medicines);
    
    return NextResponse.json({ success: true, medicine: updated });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    if (!checkAuth(req)) {
      return NextResponse.json({ error: 'Unauthorized access' }, { status: 401 });
    }
    
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Medicine ID is required' }, { status: 400 });
    }
    
    let medicines = await readMenu();
    medicines = medicines.filter((m: any) => m.id !== Number(id));
    await writeMenu(medicines);
    
    return NextResponse.json({ success: true, message: 'Medicine deleted successfully' });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
