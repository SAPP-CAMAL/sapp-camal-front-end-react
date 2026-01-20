"use client";
import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCcw, Home } from "lucide-react";
import Link from "next/link";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function DashboardError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Loguear el error para monitoreo
    console.error("Dashboard Error Boundary:", error);
  }, [error]);

  const isVersionMismatch = 
    error.message.includes("UnrecognizedActionError") || 
    error.message.includes("ChunkLoadError") ||
    error.message.includes("Failed to fetch dynamically imported module");

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
          ? "Se ha realizado una actualización en el sistema. Para continuar, es necesario recargar la aplicación y obtener la última versión."
          : "Lo sentimos, ha ocurrido un error inesperado al cargar esta sección. Por favor, intenta recargar o volver al inicio."}
      </p>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button 
          onClick={() => {
            // Si es error de versión, forzamos recarga dura para limpiar caché de Next.js
            if (isVersionMismatch) {
              window.location.reload();
            } else {
              reset();
            }
          }} 
          size="lg"
          className="gap-2"
        >
          <RefreshCcw size={18} />
          {isVersionMismatch ? "Recargar Aplicación" : "Intentar de nuevo"}
        </Button>
        
        <Link href="/dashboard">
          <Button variant="outline" size="lg" className="gap-2 w-full sm:w-auto">
            <Home size={18} />
            Volver al Inicio
          </Button>
        </Link>
      </div>

      {process.env.NODE_ENV === 'development' && (
        <div className="mt-12 w-full max-w-2xl overflow-hidden rounded-lg border bg-muted p-4 text-left">
          <p className="mb-2 text-sm font-semibold opacity-70 uppercase tracking-wider">Detalles del Error (Solo Desarrollo):</p>
          <code className="text-xs break-all block max-h-40 overflow-auto whitespace-pre-wrap">
            {error.message}
            {error.stack && `\n\n${error.stack}`}
          </code>
        </div>
      )}
    </div>
  );
}
