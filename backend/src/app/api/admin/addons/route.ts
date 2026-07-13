import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

// Get all addons
export async function GET(request: Request) {
  try {
    const { data, error } = await supabase.from('addons').select('*').order('name');
    if (error) {
      console.error('Error fetching addons:', error);
      // Fallback for when the table doesn't exist yet
      if (error.code === '42P01') {
        return NextResponse.json([]);
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(data);
  } catch (err: any) {
    console.error('API Error /api/admin/addons:', err);
    return NextResponse.json({ error: 'Failed to fetch addons' }, { status: 500 });
  }
}

// Add a new addon
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, price_pkr } = body;
    
    if (!name || price_pkr === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('addons')
      .insert([{ name, price_pkr: Number(price_pkr) }])
      .select()
      .single();

    if (error) {
      console.error('Error creating addon:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (err: any) {
    console.error('API Error /api/admin/addons:', err);
    return NextResponse.json({ error: 'Failed to create addon' }, { status: 500 });
  }
}

// Delete an addon
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Addon ID required' }, { status: 400 });
    }

    const { error } = await supabase.from('addons').delete().eq('id', id);

    if (error) {
      console.error('Error deleting addon:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('API Error /api/admin/addons:', err);
    return NextResponse.json({ error: 'Failed to delete addon' }, { status: 500 });
  }
}

// Update an addon
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, name, price_pkr } = body;

    if (!id || !name || price_pkr === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('addons')
      .update({ name, price_pkr: Number(price_pkr) })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating addon:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err: any) {
    console.error('API Error /api/admin/addons:', err);
    return NextResponse.json({ error: 'Failed to update addon' }, { status: 500 });
  }
}
