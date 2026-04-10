"use client";

import { useEffect, useState } from "react";
import { SimpleCarousel } from "@/components/simple-carousel";
import { fixUtf8 } from "@/lib/utils";

interface DashboardClientProps {
  images: { src: string; alt: string }[];
  userName?: string;
  userRole?: string;
  slaughterhouseLogo: string | null;
}

export function DashboardClient({
  images,
  userName,
  userRole: serverUserRole,
  slaughterhouseLogo,
}: DashboardClientProps) {
  const [displayRole, setDisplayRole] = useState(fixUtf8(serverUserRole));

  useEffect(() => {
    // Leer el rol activo desde la cookie user del cliente
    // Esto asegura que se muestre el rol correcto después de un cambio de rol
    try {
      const userCookie = document.cookie
        .split(";")
        .find((c) => c.trim().startsWith("user="));

      if (userCookie) {
        const userValue = decodeURIComponent(userCookie.split("=")[1]);
        const userData = JSON.parse(userValue);
        // La cookie user contiene LoginResponse con activeRole
        const activeRoleName = userData?.activeRole?.name;
        if (activeRoleName) {
          setDisplayRole(fixUtf8(activeRoleName));
        }
      }
    } catch {
      // Si hay algún error, mantener el rol del servidor como fallback
    }
  }, []);

  return (
    <div className="h-full w-full bg-gradient-to-br from-slate-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-7xl">
        <SimpleCarousel
          images={images}
          autoplayInterval={4000}
          userName={userName}
          userRole={displayRole}
          slaughterhouseLogo={slaughterhouseLogo}
        />
      </div>
    </div>
  );
}
