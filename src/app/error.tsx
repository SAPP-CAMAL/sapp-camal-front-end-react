"use client";
import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global Error Boundary:", error);
  }, [error]);

  return (
    <html>
      <body className="flex min-h-screen items-center justify-center bg-background p-6">
        <div className="flex flex-col items-center justify-center text-center max-w-lg">
          <div className="mb-6 rounded-full bg-destructive/10 p-4 text-destructive">
            <AlertTriangle size={48} />
          </div>
          
          <h1 className="mb-2 text-3xl font-bold tracking-tight">Error de Aplicación</h1>
          
          <p className="mb-8 text-muted-foreground">
            Ha ocurrido un error crítico que ha detenido la aplicación. Esto puede deberse a un problema temporal de red o una actualización del sistema.
          </p>

          <Button 
            onClick={() => window.location.reload()} 
            size="lg"
            variant="default"
            className="gap-2"
          >
            <RefreshCw size={18} />
            Recargar Aplicación
          </Button>
          
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-8 rounded-md bg-muted p-4 text-left w-full overflow-hidden">
               <pre className="text-xs overflow-auto max-h-40">
                {error.message}
               </pre>
            </div>
          )}
        </div>
      </body>
    </html>
  );
}
