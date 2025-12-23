import type { NextConfig } from "next";
import path from "path";

/**
 * Variable usada para rewrites (build-time, Node.js).
 * - API_PROXY_TARGET: recomendada para CI / producción
 * - NEXT_PUBLIC_API_URL: fallback para desarrollo
 */
const API_PROXY_TARGET =
  process.env.API_PROXY_TARGET ||
  process.env.NEXT_PUBLIC_API_URL;

const nextConfig: NextConfig = {
  /* config options here */
  outputFileTracingRoot: path.join(__dirname, "./"),

  eslint: {
    ignoreDuringBuilds: true,
  },

  async rewrites() {
    // Si la variable no existe, NO definimos rewrites
    // (evita que el build falle en CI/CD)
    if (!API_PROXY_TARGET) {
      console.warn(
        "⚠️ API proxy desactivado: API_PROXY_TARGET / NEXT_PUBLIC_API_URL no definido"
      );
      return [];
    }

    return [
      {
        source: "/api/proxy/:path*",
        destination: `${API_PROXY_TARGET}/:path*`,
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
    optimizePackageImports: ["lucide-react", "@radix-ui/react-icons"],
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "camal-riobamba.b-cdn.net",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.b-cdn.net",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
