import type { NextConfig } from "next";
import path from "path";

const rawBackendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
const cleanedBackendUrl = rawBackendUrl.endsWith('/') ? rawBackendUrl.slice(0, -1) : rawBackendUrl;

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${cleanedBackendUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
