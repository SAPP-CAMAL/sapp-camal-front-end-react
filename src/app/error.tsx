"use client";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";

const RELOAD_ATTEMPT_KEY = "__camal_reload_attempt";

function forceHardReload() {
  const attempts = parseInt(sessionStorage.getItem(RELOAD_ATTEMPT_KEY) ?? "0", 10);
  if (attempts < 2) {
    sessionStorage.setItem(RELOAD_ATTEMPT_KEY, String(attempts + 1));
    const url = new URL(window.location.href);
    url.searchParams.set("_cb", Date.now().toString());
    window.location.replace(url.toString());
  }
}

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [countdown, setCountdown] = useState<number | null>(null);

  const isVersionMismatch =
    error.message.includes("ChunkLoadError") ||
    error.message.includes("Failed to fetch dynamically imported module") ||
    error.message.includes("Loading chunk") ||
    error.message.includes("expected a string") ||
    error.message.includes("got: object") ||
    error.name === "ChunkLoadError";

  useEffect(() => {
    console.error("Global Error Boundary:", error);

    if (isVersionMismatch) {
      const attempts = parseInt(
        sessionStorage.getItem(RELOAD_ATTEMPT_KEY) ?? "0",
        10
      );
      if (attempts < 2) {
        setCountdown(3);
        const interval = setInterval(() => {
          setCountdown((prev) => {
            if (prev === null || prev <= 1) {
              clearInterval(interval);
              forceHardReload();
              return null;
            }
            return prev - 1;
          });
        }, 1000);
        return () => clearInterval(interval);
      }
    } else {
      sessionStorage.removeItem(RELOAD_ATTEMPT_KEY);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <html>
      <body className="flex min-h-screen items-center justify-center bg-background p-6">
        <div className="flex flex-col items-center justify-center text-center max-w-lg">
          <div className="mb-6 rounded-full bg-destructive/10 p-4 text-destructive">
            <AlertTriangle size={48} />
          </div>

          <h1 className="mb-2 text-3xl font-bold tracking-tight">
            {isVersionMismatch ? "Nueva versión disponible" : "Error de Aplicación"}
          </h1>

          <p className="mb-8 text-muted-foreground">
            {isVersionMismatch
              ? countdown !== null
                ? `Se detectó una actualización del sistema. Recargando automáticamente en ${countdown}…`
                : "Se ha realizado una actualización del sistema. Recarga la aplicación para continuar."
              : "Ha ocurrido un error crítico que ha detenido la aplicación. Esto puede deberse a un problema temporal de red o una actualización del sistema."}
          </p>

          <Button
            onClick={() => {
              if (isVersionMismatch) {
                forceHardReload();
              } else {
                sessionStorage.removeItem(RELOAD_ATTEMPT_KEY);
                reset();
              }
            }}
            size="lg"
            variant="default"
            className="gap-2"
            disabled={countdown !== null}
          >
            <RefreshCw size={18} className={countdown !== null ? "animate-spin" : ""} />
            {countdown !== null ? `Recargando (${countdown})` : "Recargar Aplicación"}
          </Button>

          {process.env.NODE_ENV === "development" && (
            <div className="mt-8 rounded-md bg-muted p-4 text-left w-full overflow-hidden">
              <pre className="text-xs overflow-auto max-h-40">{error.message}</pre>
            </div>
          )}
        </div>
      </body>
    </html>
  );
}
