import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const offersPath = path.join(process.cwd(), 'src', 'lib', 'offers.json');

function checkAuth(req: Request) {
  const authHeader = req.headers.get('authorization');
  return authHeader === 'Bearer medimart_session_token_2026_verified';
}

async function readOffers() {
  try {
    const data = await fs.readFile(offersPath, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function writeOffers(offers: any[]) {
  await fs.writeFile(offersPath, JSON.stringify(offers, null, 2), 'utf-8');
}

export async function GET() {
  try {
    const offers = await readOffers();
    return NextResponse.json({ success: true, offers });
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
    const offers = await readOffers();
    const newOffer = {
      id: Date.now(),
      title: body.title || '',
      description: body.description || '',
      discount_text: body.discount_text || '',
      badge: body.badge || 'OFFER',
      image_url: body.image_url || '',
      valid_until: body.valid_until || '',
      is_active: body.is_active !== false,
      created_at: new Date().toISOString()
    };
    offers.push(newOffer);
    await writeOffers(offers);
    return NextResponse.json({ success: true, offer: newOffer });
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
    const offers = await readOffers();
    const idx = offers.findIndex((o: any) => o.id === body.id);
    if (idx === -1) return NextResponse.json({ error: 'Offer not found' }, { status: 404 });
    offers[idx] = { ...offers[idx], ...body };
    await writeOffers(offers);
    return NextResponse.json({ success: true, offer: offers[idx] });
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
    const id = Number(searchParams.get('id'));
    let offers = await readOffers();
    offers = offers.filter((o: any) => o.id !== id);
    await writeOffers(offers);
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
