import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'standalone',
  experimental: {
    // Fixed serverActions configuration for Next.js 15
    serverActions: {
      bodySizeLimit: '2mb',
      allowedOrigins: ['localhost:3000', '127.0.0.1:3000']
    },
  },
  // Environment variables that should be available on client side
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  },
  images: {
    domains: ['localhost', 'images.unsplash.com', 'www.worldofbooks.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'www.worldofbooks.com',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.BACKEND_URL || 'http://localhost:3001/api'}/:path*`,
      },
    ]
  },
}

export default nextConfig
