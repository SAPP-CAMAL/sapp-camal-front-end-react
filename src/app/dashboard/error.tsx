"use client";
import { useEffect } from "react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

async function clearAuthAndRedirect() {
  try {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    sessionStorage.clear();
    const cookiesToClear = ["accessToken", "refreshToken", "user"];
    cookiesToClear.forEach((name) => {
      document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Lax`;
      document.cookie = `${name}=; path=/dashboard; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Lax`;
    });
    // Limpiar Cache API (Service Worker / Next.js runtime cache)
    if (typeof caches !== "undefined") {
      const keys = await caches.keys();
      await Promise.all(keys.map((key) => caches.delete(key)));
    }
  } catch {
    // ignore
  }
  window.location.replace(`/auth/login?_cb=${Date.now()}`);
}

export default function DashboardError({ error }: ErrorProps) {
  useEffect(() => {
    console.error("[DashboardError]", error.message, error.digest ?? "");
    clearAuthAndRedirect();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
