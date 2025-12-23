import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  /* config options here */
  outputFileTracingRoot: path.join(__dirname, "./"),
  eslint: {
    ignoreDuringBuilds: true,
  },
  async rewrites() {
    return [
      {
        source: '/api/proxy/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL}/:path*`,
      },
    ];
  },
  productionBrowserSourceMaps: false,
  allowedDevOrigins: [
    "192.168.100.12",
    "localhost",
    "127.0.0.1",
    "*.local",
  ],
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'camal-riobamba.b-cdn.net',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.b-cdn.net',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
