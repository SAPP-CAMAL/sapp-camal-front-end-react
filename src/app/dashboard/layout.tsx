import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import React from "react";
import { getAdministrationMenusService } from "@/features/modules/server/db/modules.queries";
import { DashboardLayoutClient } from "./dashboard-layout-client";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookiesStore = await cookies();

  const user = cookiesStore.get("user");

  if (!user) {
    redirect("/auth/login");
  }

  let menus;
  try {
    menus = await getAdministrationMenusService();
  } catch {
    // Proporcionar un valor por defecto si falla
    menus = { data: [] };
  }

  const userData = JSON.parse(user.value);

  return (
    <DashboardLayoutClient menus={menus.data} user={userData}>
      {children}
    </DashboardLayoutClient>
  );
}
