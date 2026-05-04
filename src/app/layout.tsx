import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { HttpProvider } from "@/features/security/components/http.context";
import { Providers } from "@/features/providers";
import { Toaster } from "@/components/ui/sonner";
import { NuqsAdapter } from "nuqs/adapters/next/app";

import { DynamicMetadata } from "@/components/dynamic-metadata";
import { ChunkErrorHandler } from "@/components/chunk-error-handler";

const geistSans = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = JetBrains_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SAPP",
  description: "Sistema de Administración de Faenamiento - SAPP",
  icons: {
    icon: [
      { url: "/images/ico.ico", type: "image/ico" },
    ],
    apple: [
      { url: "/images/ico.ico", type: "image/ico" },
    ],
    shortcut: ["/images/ico.ico"],
  }
};
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: '(prefers-color-scheme: light)' },
    { media: '(prefers-color-scheme: dark)' },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const runtimeApiUrl =
    process.env.NEXT_PUBLIC_API_URL ??
    process.env.API_URL_LOCAL_FALLBACK ??
    "";

  return (
    <Providers>
      <NuqsAdapter>
        <HttpProvider>
          <html lang="en">
            <head>
              {/* Inyectar la URL de la API en una variable global antes de que se cargue la app */}
              <script
                dangerouslySetInnerHTML={{
                  __html: `window.__NEXT_PUBLIC_API_URL__ = "${runtimeApiUrl}";`,
                }}
              />
            </head>
            <body
              className={`${geistSans.variable} ${geistMono.variable} antialiased`}
            >
              <ChunkErrorHandler />
              <DynamicMetadata />
              {children}
              <Toaster />
            </body>
          </html>
        </HttpProvider>
      </NuqsAdapter>
    </Providers>
  );
}
