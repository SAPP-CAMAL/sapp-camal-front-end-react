"use client";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCcw, Home } from "lucide-react";
import Link from "next/link";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/** Clave usada en sessionStorage para evitar recargas infinitas */
const RELOAD_ATTEMPT_KEY = "__camal_reload_attempt";

/**
 * Fuerza una recarga dura (equivalente a Ctrl+Shift+R), limpiando el caché
 * de los chunks de Next.js. Usa sessionStorage para no entrar en bucle.
 */
function forceHardReload() {
  const attempts = parseInt(sessionStorage.getItem(RELOAD_ATTEMPT_KEY) ?? "0", 10);
  if (attempts < 2) {
    sessionStorage.setItem(RELOAD_ATTEMPT_KEY, String(attempts + 1));
    // Agrega un query param con timestamp para invalidar la URL en caché
    const url = new URL(window.location.href);
    url.searchParams.set("_cb", Date.now().toString());
    window.location.replace(url.toString());
  }
}

export default function DashboardError({ error, reset }: ErrorProps) {
  const [countdown, setCountdown] = useState<number | null>(null);

  /**
   * Detecta errores relacionados con versiones desactualizadas en caché:
   * - ChunkLoadError: Next.js no puede cargar un chunk antiguo
   * - Failed to fetch dynamically imported module: ESM chunk faltante
   * - Element type is invalid / got: object: import incorrecto por caché stale
   * - Loading chunk failed: Webpack chunk no encontrado
   */
  const isVersionMismatch =
    error.message.includes("ChunkLoadError") ||
    error.message.includes("Failed to fetch dynamically imported module") ||
    error.message.includes("Loading chunk") ||
    error.message.includes("UnrecognizedActionError") ||
    error.message.includes("expected a string") ||
    error.message.includes("got: object") ||
    error.name === "ChunkLoadError";

  useEffect(() => {
    console.error("Dashboard Error Boundary:", error);

    // Si el error es de caché/versión, intentar recarga automática
    if (isVersionMismatch) {
      const attempts = parseInt(
        sessionStorage.getItem(RELOAD_ATTEMPT_KEY) ?? "0",
        10
      );

      if (attempts < 2) {
        // Cuenta regresiva de 3 segundos antes de recargar
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
      // Resetear el contador de intentos si el error no es de caché
      sessionStorage.removeItem(RELOAD_ATTEMPT_KEY);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center p-6 text-center animate-in fade-in duration-500">
      <div className="mb-6 rounded-full bg-destructive/10 p-4 text-destructive">
        <AlertCircle size={48} />
      </div>

      <h1 className="mb-2 text-2xl font-bold tracking-tight md:text-3xl">
        {isVersionMismatch ? "Nueva versión disponible" : "Algo salió mal"}
      </h1>

      <p className="mb-8 max-w-md text-muted-foreground">
        {isVersionMismatch
          ? countdown !== null
            ? `Se detectó una actualización del sistema. Recargando automáticamente en ${countdown}…`
            : "Se ha realizado una actualización en el sistema. Recarga la aplicación para obtener la última versión."
          : "Lo sentimos, ha ocurrido un error inesperado al cargar esta sección. Por favor, intenta recargar o volver al inicio."}
      </p>

      <div className="flex flex-col gap-3 sm:flex-row">
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
          className="gap-2"
          disabled={countdown !== null}
        >
          <RefreshCcw size={18} className={countdown !== null ? "animate-spin" : ""} />
          {isVersionMismatch
            ? countdown !== null
              ? `Recargando (${countdown})`
              : "Recargar Aplicación"
            : "Intentar de nuevo"}
        </Button>

        <Link href="/dashboard">
          <Button variant="outline" size="lg" className="gap-2 w-full sm:w-auto">
            <Home size={18} />
            Volver al Inicio
          </Button>
        </Link>
      </div>

      {process.env.NODE_ENV === "development" && (
        <div className="mt-12 w-full max-w-2xl overflow-hidden rounded-lg border bg-muted p-4 text-left">
          <p className="mb-2 text-sm font-semibold opacity-70 uppercase tracking-wider">
            Detalles del Error (Solo Desarrollo):
          </p>
          <code className="text-xs break-all block max-h-40 overflow-auto whitespace-pre-wrap">
            {error.message}
            {error.stack && `\n\n${error.stack}`}
          </code>
        </div>
      )}
    </div>
  );
}
