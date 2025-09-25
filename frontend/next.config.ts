import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  
  // ✅ FIXED: Consistent environment variable names
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
  },
  
  images: {
    domains: ['localhost', 'images.unsplash.com', 'www.worldofbooks.com', 'product-explorer-backend-eaj3.onrender.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'www.worldofbooks.com',
      },
      {
        protocol: 'https',
        hostname: 'product-explorer-backend-eaj3.onrender.com',
      },
    ],
  },
  
  // ✅ FIXED: Use consistent NEXT_PUBLIC_API_URL instead of BACKEND_URL
  async rewrites() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
    const backendUrl = apiUrl.replace('/api', '');
    
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
