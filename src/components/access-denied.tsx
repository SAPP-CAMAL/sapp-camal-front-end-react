"use client";

import { ShieldAlertIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AccessDenied() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
      <ShieldAlertIcon className="h-14 w-14 text-amber-500" />
      <div className="space-y-1">
        <h1 className="text-xl font-semibold">Acceso denegado</h1>
        <p className="text-sm text-muted-foreground">
          No tenés permiso para acceder a esta sección. Si creés que es un error, contactá al administrador.
        </p>
      </div>
      {/* Navegación completa (no next/link): el chequeo de acceso vive en el layout
          compartido de /dashboard, que Next.js cachea entre navegaciones del lado cliente.
          Un <Link> podía reutilizar esa decisión vieja y volver a mostrar este bloqueo
          aunque el destino sea válido. Forzar un reload evita depender de esa caché. */}
      <Button onClick={() => { window.location.href = "/dashboard"; }}>
        Volver al inicio
      </Button>
    </div>
  );
}
