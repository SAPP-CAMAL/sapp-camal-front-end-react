import { logoutAction } from "@/features/security/server/actions/security.actions";

/**
 * Cierra sesión: notifica al servidor (limpia cookies server-side) y limpia
 * localStorage/cookies del cliente. No redirige — el caller decide a dónde.
 */
export async function performClientLogout() {
  try {
    await logoutAction();
  } catch (error) {
    console.error("Logout error:", error);
  }

  if (typeof window !== "undefined") {
    window.localStorage.removeItem("accessToken");
    window.localStorage.removeItem("refreshToken");
    window.localStorage.removeItem("user");
    window.localStorage.removeItem("activeRoleId");
    window.localStorage.removeItem("activeRoleName");
    window.dispatchEvent(new CustomEvent("active-role-changed", { detail: { id: null, name: null } }));

    document.cookie = "accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    document.cookie = "refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    document.cookie = "user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
  }
}
