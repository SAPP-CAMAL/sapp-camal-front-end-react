import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import React from "react";
import { getAdministrationMenusService } from "@/features/modules/server/db/modules.queries";
import { isPathAllowedByMenus } from "@/features/modules/utils/menu-access";
import { logoutAction } from "@/features/security/server/actions/security.actions";
import { AccessDenied } from "@/components/access-denied";
import { DashboardLayoutClient } from "./dashboard-layout-client";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookiesStore = await cookies();

  const user = cookiesStore.get("user");
  const accessToken = cookiesStore.get("accessToken");

  // Si no hay usuario o token, redirigir al login
  if (!user || !accessToken?.value) {
    redirect("/auth/login");
  }

  let menus;
  try {
    menus = await getAdministrationMenusService();
  } catch (error) {
    console.error("Error loading menus:", error);
    // Proporcionar un valor por defecto si falla
    menus = { data: [] };
  }

  // El token existe en la cookie pero el backend lo rechazó (vencido/inválido/revocado):
  // limpiar las cookies de sesión y mandar al login en vez de mostrar un dashboard vacío.
  if ((menus as { code?: number }).code === 401) {
    await logoutAction();
    redirect("/auth/login");
  }

  const userData = JSON.parse(user.value);

  // Autorización por menú: bloquear el acceso a rutas que el usuario no tiene asignadas
  // en su rol, aunque las escriba manualmente en la URL (el sidebar solo las oculta,
  // no impedía navegar a ellas directamente).
  const pathname = (await headers()).get("x-pathname") ?? "/dashboard";
  const allowed = isPathAllowedByMenus(menus.data, pathname);

  return (
    <DashboardLayoutClient menus={menus.data} user={userData}>
      {allowed ? children : <AccessDenied />}
    </DashboardLayoutClient>
  );
}
