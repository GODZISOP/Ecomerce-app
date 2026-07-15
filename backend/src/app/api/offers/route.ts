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

export async function GET() {
  try {
    const { data: offers, error } = await supabase.from('offers').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return NextResponse.json({ success: true, offers: offers || [] });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const body = await req.json();
    const newOffer = {
      title: body.title || '',
      description: body.description || '',
      discount_text: body.discount_text || '',
      badge: body.badge || 'OFFER',
      image_url: body.image_url || '',
      valid_until: body.valid_until || null,
      is_active: body.is_active !== false,
    };
    
    const { data: offer, error } = await supabase.from('offers').insert([newOffer]).select().single();
    if (error) throw error;
    
    return NextResponse.json({ success: true, offer });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const body = await req.json();
    const { id, ...updateData } = body;
    
    if (!id) return NextResponse.json({ error: 'Offer ID is required' }, { status: 400 });

    const { data: offer, error } = await supabase.from('offers').update(updateData).eq('id', id).select().single();
    if (error) throw error;
    
    return NextResponse.json({ success: true, offer });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    
    if (!id) return NextResponse.json({ error: 'Offer ID is required' }, { status: 400 });

    const { error } = await supabase.from('offers').delete().eq('id', id);
    if (error) throw error;
    
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
