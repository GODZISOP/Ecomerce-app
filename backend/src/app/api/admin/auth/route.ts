import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { passcode } = await req.json();
    
    // Check passcode against environment variable or fallback to secure default
    const expectedPasscode = process.env.ADMIN_PASSCODE || 'MediMartAdmin2026';
    
    if (passcode === expectedPasscode) {
      return NextResponse.json({ success: true, token: 'medimart_session_token_2026_verified' });
    }
    
    return NextResponse.json({ success: false, error: 'Ghalat passcode! Dobara koshish karein.' }, { status: 401 });
  } catch (e: any) {
    return NextResponse.json({ error: 'Auth server error: ' + e.message }, { status: 500 });
  }
}
