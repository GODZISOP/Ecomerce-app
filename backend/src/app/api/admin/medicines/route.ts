import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

function checkAuth(req: Request) {
  const authHeader = req.headers.get('authorization');
  if (authHeader !== 'Bearer medimart_session_token_2026_verified') {
    return false;
  }
  return true;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    
    let query = supabase.from('medicines').select('*');
    
    if (category && category !== 'All') {
      query = query.eq('category', category);
    }
    
    if (search) {
      query = query.or(`name.ilike.%${search}%,generic_name.ilike.%${search}%,description.ilike.%${search}%`);
    }
    
    const { data: medicines, error } = await query.order('id', { ascending: true });
    
    if (error) throw error;
    
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
    
    const { data: maxMed, error: maxError } = await supabase
      .from('medicines')
      .select('id')
      .order('id', { ascending: false })
      .limit(1);
      
    if (maxError) throw maxError;
    const nextId = (maxMed && maxMed[0] ? maxMed[0].id : 0) + 1;
    
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
    
    const { data, error } = await supabase
      .from('medicines')
      .insert([newMedicine])
      .select();
      
    if (error) throw error;
    
    return NextResponse.json({ success: true, medicine: data ? data[0] : newMedicine });
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
    
    const updated = {
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
    
    const { data, error } = await supabase
      .from('medicines')
      .update(updated)
      .eq('id', Number(id))
      .select();
      
    if (error) throw error;
    
    if (!data || data.length === 0) {
      return NextResponse.json({ error: 'Medicine not found or not updated' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, medicine: data[0] });
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
    
    const { error } = await supabase
      .from('medicines')
      .delete()
      .eq('id', Number(id));
      
    if (error) throw error;
    
    return NextResponse.json({ success: true, message: 'Medicine deleted successfully' });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
