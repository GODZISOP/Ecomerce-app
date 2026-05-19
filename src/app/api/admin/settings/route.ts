import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const settingsFilePath = path.join(process.cwd(), 'src', 'lib', 'settings.json');

// GET: Read settings
export async function GET() {
  try {
    const data = await fs.readFile(settingsFilePath, 'utf8');
    const settings = JSON.parse(data);
    return NextResponse.json({ success: true, settings });
  } catch (e: any) {
    // If file doesn't exist, return default fallback
    const defaults = {
      shippingFee: 150,
      supportPhone: "0300-1234567",
      storeAddress: "Plot 12-C, Badar Commercial Area, Phase 5, DHA, Karachi, Pakistan",
      activeNotice: "⚠️ NOTICE: Deliveries might be slightly delayed due to rain in Karachi. Please cooperate with our riders.",
      emergencyAnnouncement: "⚡ MediMart Pakistan AI Symptom Consultation has successfully served over 5,000+ orders this month!",
      isStoreOpen: true
    };
    return NextResponse.json({ success: true, settings: defaults });
  }
}

// POST: Save settings
export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    if (authHeader !== 'Bearer medimart_session_token_2026_verified') {
      return NextResponse.json({ error: 'Unauthorized access' }, { status: 401 });
    }
    
    const body = await req.json();
    const { shippingFee, supportPhone, storeAddress, activeNotice, emergencyAnnouncement, isStoreOpen } = body;
    
    const updatedSettings = {
      shippingFee: Number(shippingFee) || 150,
      supportPhone: supportPhone || "0300-1234567",
      storeAddress: storeAddress || "",
      activeNotice: activeNotice || "",
      emergencyAnnouncement: emergencyAnnouncement || "",
      isStoreOpen: isStoreOpen !== undefined ? !!isStoreOpen : true
    };
    
    await fs.writeFile(settingsFilePath, JSON.stringify(updatedSettings, null, 2), 'utf8');
    
    return NextResponse.json({ success: true, settings: updatedSettings });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
