"use client";

import { useEffect } from "react";

const RELOAD_KEY = "__camal_reload_attempt";
const MAX_ATTEMPTS = 2;

/** Mensajes/nombres de error relacionados con chunks o módulos obsoletos en caché */
const CHUNK_ERROR_PATTERNS = [
  "ChunkLoadError",
  "Loading chunk",
  "Failed to fetch dynamically imported module",
  "Importing a module script failed",
  "expected a string (for built-in components)",
  "got: object",
  "Element type is invalid",
];

function isChunkError(message: string, name?: string): boolean {
  if (name === "ChunkLoadError") return true;
  return CHUNK_ERROR_PATTERNS.some((pattern) =>
    message.toLowerCase().includes(pattern.toLowerCase())
  );
}

function attemptReload() {
  const attempts = parseInt(sessionStorage.getItem(RELOAD_KEY) ?? "0", 10);
  if (attempts >= MAX_ATTEMPTS) return;

  sessionStorage.setItem(RELOAD_KEY, String(attempts + 1));

  // Hard reload con cache-busting: equivalente a Ctrl+Shift+R
  const url = new URL(window.location.href);
  url.searchParams.set("_cb", Date.now().toString());
  window.location.replace(url.toString());
}

/**
 * Componente global que intercepta errores de chunks/caché ANTES de que
 * lleguen al error boundary de React. Se monta una sola vez en el layout raíz.
 *
 * Maneja dos canales:
 * - `unhandledrejection`: Promesas rechazadas (dynamic import, fetch de chunks)
 * - `error`: Errores síncronos de carga de scripts
 */
export function ChunkErrorHandler() {
  useEffect(() => {
    // Limpiar el contador si la app cargó correctamente
    const clearAttempts = () => sessionStorage.removeItem(RELOAD_KEY);

    // Esperar 5 segundos: si no hay error, la app cargó bien
    const timer = setTimeout(clearAttempts, 5000);

    // Handler para promesas rechazadas (ChunkLoadError, dynamic import)
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      if (!reason) return;

      const message = reason?.message ?? String(reason);
      const name = reason?.name ?? "";

      if (isChunkError(message, name)) {
        console.warn("[ChunkErrorHandler] Chunk/cache error detectado, recargando…", message);
        event.preventDefault(); // Prevenir que llegue al error boundary
        attemptReload();
      }
    };

    // Handler para errores de carga de scripts (error events en window)
    const handleError = (event: ErrorEvent) => {
      const message = event.message ?? "";
      const filename = event.filename ?? "";
      const name = (event.error as Error)?.name ?? "";

      // Detectar errores en chunks de Next.js (_next/static/chunks/)
      const isNextChunk = filename.includes("/_next/static/chunks/");

      if (isChunkError(message, name) || isNextChunk) {
        console.warn("[ChunkErrorHandler] Script error en chunk, recargando…", message);
        attemptReload();
      }
    };

    window.addEventListener("unhandledrejection", handleUnhandledRejection);
    window.addEventListener("error", handleError);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("unhandledrejection", handleUnhandledRejection);
      window.removeEventListener("error", handleError);
    };
  }, []);

  return null;
}
