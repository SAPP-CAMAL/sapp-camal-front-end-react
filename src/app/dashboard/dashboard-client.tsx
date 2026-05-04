"use client";

import { useEffect, useState } from "react";
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
  userRole: serverUserRole,
  slaughterhouseLogo,
}: DashboardClientProps) {
  const [displayRole, setDisplayRole] = useState(fixUtf8(serverUserRole));

  useEffect(() => {
    const readRoleFromStorage = () => {
      const savedRoleName = window.localStorage.getItem("activeRoleName");
      if (savedRoleName) {
        setDisplayRole(fixUtf8(savedRoleName));
      }
    };

    const onActiveRoleChanged = (event: Event) => {
      const customEvent = event as CustomEvent<{ id?: number; name?: string }>;
      const roleName = customEvent.detail?.name;
      if (roleName) {
        setDisplayRole(fixUtf8(roleName));
      } else {
        readRoleFromStorage();
      }
    };

    readRoleFromStorage();
    window.addEventListener("active-role-changed", onActiveRoleChanged);

    return () => {
      window.removeEventListener("active-role-changed", onActiveRoleChanged);
    };
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
