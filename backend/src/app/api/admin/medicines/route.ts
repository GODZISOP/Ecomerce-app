import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

function checkAuth(req: Request) {
  const authHeader = req.headers.get('authorization');
  return authHeader === 'Bearer medimart_session_token_2026_verified';
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
    
    // We will do search filtering in memory if needed, or using ilike
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
  if (!checkAuth(req)) {
    return NextResponse.json({ error: 'Unauthorized access' }, { status: 401 });
  }
  try {
    const body = await req.json();
    
    // Auto-generate an ID manually because Supabase medicines table "id" is not set to auto-increment (SERIAL)
    const { data: allIds } = await supabase
      .from('medicines')
      .select('id')
      .order('id', { ascending: false })
      .limit(1);
      
    const nextId = (allIds && allIds.length > 0) ? (allIds[0].id + 1) : 1;
    
    const { id, ...medicineData } = body;

    const { data, error } = await supabase
      .from('medicines')
      .insert([{ id: nextId, ...medicineData }])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, medicine: data });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: 'Unauthorized access' }, { status: 401 });
  }
  try {
    const body = await req.json();
    const { id, ...medicineData } = body;

    if (!id) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('medicines')
      .update(medicineData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, medicine: data });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: 'Unauthorized access' }, { status: 401 });
  }
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Medicine ID is required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('medicines')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true, message: 'Medicine deleted successfully' });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
