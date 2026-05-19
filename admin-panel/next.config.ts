import type { NextConfig } from "next";

const rawBackendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
const cleanedBackendUrl = rawBackendUrl.endsWith('/') ? rawBackendUrl.slice(0, -1) : rawBackendUrl;

const nextConfig: NextConfig = {
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
