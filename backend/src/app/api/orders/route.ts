import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// GET: Fetch all orders
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const trackingCode = searchParams.get('tracking_code');

    let query = supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (trackingCode) {
      query = query.eq('tracking_code', trackingCode);
    }

    const { data, error } = await query;

    if (error) throw new Error(error.message);

    return NextResponse.json({ success: true, orders: data || [] });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

// POST: Place a new order
export async function POST(req: Request) {
  try {
    const order = await req.json();

    // Remove custom id so Supabase auto-generates a valid UUID
    const { id: _unused, ...orderWithoutId } = order;
    const newOrder = {
      ...orderWithoutId,
      created_at: order.created_at || new Date().toISOString(),
      status: order.status || 'Pending',
    };

    const { data, error } = await supabase
      .from('orders')
      .insert([newOrder])
      .select()
      .single();

    if (error) throw new Error(error.message);

    return NextResponse.json({ success: true, order: data });
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

    const { data, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);

    return NextResponse.json({ success: true, order: data });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
