import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

// Helper to check for authorization
function checkAuth(req: Request) {
  const authHeader = req.headers.get('authorization');
  if (authHeader !== 'Bearer medimart_session_token_2026_verified') {
    return false;
  }
  return true;
}

// GET: Fetch all medicines
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
    
    // Order by ID ascending
    query = query.order('id', { ascending: true });
    
    const { data, error } = await query;
    
    if (error) throw error;
    return NextResponse.json({ success: true, medicines: data || [] });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

// POST: Add new medicine
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
    
    // Get the maximum current ID to increment it
    const { data: maxIdData, error: maxIdError } = await supabase
      .from('medicines')
      .select('id')
      .order('id', { ascending: false })
      .limit(1);
      
    if (maxIdError) throw maxIdError;
    const nextId = maxIdData && maxIdData.length > 0 ? maxIdData[0].id + 1 : 1;
    
    const { data, error } = await supabase
      .from('medicines')
      .insert([
        {
          id: nextId,
          name,
          generic_name,
          category,
          price_pkr: Number(price_pkr),
          stock: Number(stock),
          dosage: dosage || '',
          description: description || '',
          manufacturer: manufacturer || 'MediMart Health',
          requires_prescription: !!requires_prescription,
          image_url: image_url || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&q=80'
        }
      ])
      .select();
      
    if (error) throw error;
    return NextResponse.json({ success: true, medicine: data?.[0] });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

// PUT: Update existing medicine
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
    
    const { data, error } = await supabase
      .from('medicines')
      .update({
        name,
        generic_name,
        category,
        price_pkr: Number(price_pkr),
        stock: Number(stock),
        dosage: dosage || '',
        description: description || '',
        manufacturer: manufacturer || 'MediMart Health',
        requires_prescription: !!requires_prescription,
        image_url: image_url || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&q=80'
      })
      .eq('id', id)
      .select();
      
    if (error) throw error;
    return NextResponse.json({ success: true, medicine: data?.[0] });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

// DELETE: Remove a medicine
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
