import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { HttpProvider } from "@/features/security/components/http.context";
import { Providers } from "@/features/providers";
import { Toaster } from "@/components/ui/sonner";
import { NuqsAdapter } from "nuqs/adapters/next/app";

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
  description: "CAMAL MUNICIPAL DE RIOBAMBA",
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
  return (
    <Providers>
      <NuqsAdapter>
        <HttpProvider>
          <html lang="en">
            <body
              className={`${geistSans.variable} ${geistMono.variable} antialiased`}
            >
              {children}
              <Toaster />
            </body>
          </html>
        </HttpProvider>
      </NuqsAdapter>
    </Providers>
  );
}
