"use client";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="mx-auto mt-12 max-w-xl rounded-lg border bg-white p-6 text-center shadow-sm">
      <h2 className="text-lg font-semibold">Ocurrió un error al cargar esta sección</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Tu sesión se mantiene activa. Intenta recargar esta vista.
      </p>
      <div className="mt-4 flex items-center justify-center gap-2">
        <Button type="button" onClick={() => reset()}>
          Reintentar
        </Button>
        <Button type="button" variant="outline" onClick={() => window.location.replace("/dashboard") }>
          Ir al inicio
        </Button>
      </div>
    </div>
  );
}
