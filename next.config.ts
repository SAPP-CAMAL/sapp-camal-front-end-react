import type { NextConfig } from "next";
import path from "path";
import { PHASE_PRODUCTION_SERVER } from "next/constants";

export default function nextConfig(phase: string): NextConfig {
  const nextPublicApiUrl = process.env.NEXT_PUBLIC_API_URL;
  const localFallbackApiUrl = process.env.API_URL_LOCAL_FALLBACK;
  const isProductionRuntime = phase === PHASE_PRODUCTION_SERVER;

  if (!nextPublicApiUrl && !localFallbackApiUrl) {
    if (isProductionRuntime) {
      throw new Error(
        "NEXT_PUBLIC_API_URL o API_URL_LOCAL_FALLBACK no estan configurados para runtime de produccion."
      );
    }

    console.warn(
      "[next.config] NEXT_PUBLIC_API_URL no esta configurado; se usa fallback http://localhost:3000 solo para build/CI."
    );
  }

  const apiUrl = nextPublicApiUrl ?? localFallbackApiUrl ?? "http://localhost:3000";
  const normalizedApiUrl = apiUrl.replace(/\/+$/, "");

  return {
    /* config options here */
    outputFileTracingRoot: path.join(__dirname, "./"),
    eslint: {
      ignoreDuringBuilds: true,
    },
    async rewrites() {
      return [
        {
          source: '/api/proxy/:path*',
          destination: `${normalizedApiUrl}/:path*`,
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
      optimizePackageImports: ['lucide-react', '@radix-ui/react-icons', 'nuqs'],
    },
    transpilePackages: ['nuqs'],
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
    // Configuración para servir correctamente los chunks en producción
    headers: async () => {
      return [
        {
          source: '/_next/static/:path*',
          headers: [
            {
              key: 'Cache-Control',
              value: 'public, max-age=31536000, immutable',
            },
          ],
        },
        {
          source: '/_next/image',
          headers: [
            {
              key: 'Cache-Control',
              value: 'public, max-age=60, must-revalidate',
            },
          ],
        },
      ];
    },
  };
}