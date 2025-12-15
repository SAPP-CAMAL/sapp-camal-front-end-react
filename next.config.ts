import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    ignoreDuringBuilds: true,
  },
  productionBrowserSourceMaps: false,
  allowedDevOrigins: [
    "Mauro_Muñoz",
    "mauro_muñoz",
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
