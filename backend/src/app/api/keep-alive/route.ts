import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Initialize a direct Supabase client to bypass any mocks
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function GET() {
  try {
    // Perform a lightweight query to keep the database active
    // The "addons" table is used here, but any real table will do
    // To minimize data transfer, we limit to 1 row and only select 'id'
    const { data, error } = await supabase
      .from('addons')
      .select('id')
      .limit(1);

    if (error) {
      console.error('Keep-alive ping failed:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Supabase keep-alive ping successful.',
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    console.error('Keep-alive ping exception:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
