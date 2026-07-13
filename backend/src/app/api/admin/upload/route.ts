import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

// Images will be saved to backend/public/uploads/
const uploadDir = path.join(process.cwd(), 'public', 'uploads');

function checkAuth(req: Request) {
  const authHeader = req.headers.get('authorization');
  return authHeader === 'Bearer medimart_session_token_2026_verified';
}

export async function POST(req: Request) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Ensure upload directory exists
    await fs.mkdir(uploadDir, { recursive: true });

    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Only JPEG, PNG, WebP and GIF images allowed' }, { status: 400 });
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size must be under 5MB' }, { status: 400 });
    }

    // Generate unique filename
    const ext = file.name.split('.').pop() || 'jpg';
    const filename = `product_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;
    const filePath = path.join(uploadDir, filename);

    // Save file
    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(filePath, buffer);

    // Return the public URL - this will be served from the backend's public folder
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000';
    const imageUrl = `${backendUrl}/uploads/${filename}`;

    return NextResponse.json({ success: true, url: imageUrl, filename });
  } catch (e: any) {
    console.error('Image upload error:', e);
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
