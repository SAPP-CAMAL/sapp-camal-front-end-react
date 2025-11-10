"use client";

import { SimpleCarousel } from "@/components/simple-carousel";

interface DashboardClientProps {
  images: { src: string; alt: string }[];
  userName?: string;
  userRole?: string;
  slaughterhouseLogo: string | null;
}

export function DashboardClient({
  images,
  userName,
  userRole,
  slaughterhouseLogo,
}: DashboardClientProps) {
  return (
    <div className="h-full w-full bg-gradient-to-br from-slate-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-7xl">
        <SimpleCarousel
          images={images}
          autoplayInterval={4000}
          userName={userName}
          userRole={userRole}
          slaughterhouseLogo={slaughterhouseLogo}
        />
      </div>
    </div>
  );
}
