import type { NextConfig } from "next";
import path from "path";

const isDev = process.env.NODE_ENV === 'development';
// Use provided env var, otherwise fallback to localhost for dev and vercel for prod
const rawBackendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || (isDev ? 'http://localhost:3000' : 'https://ecomerce-app-woi1.vercel.app');
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
