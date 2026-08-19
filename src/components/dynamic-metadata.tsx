"use client";

import { useSlaughterhouseInfo } from "@/features/slaughterhouse-info";
import { useEffect } from "react";

/**
 * Componente que actualiza los metadatos del documento dinámicamente.
 * Se usa para establecer el título de la página con el nombre del camal.
 */
export function DynamicMetadata() {
  const { location } = useSlaughterhouseInfo();

  useEffect(() => {
    // Actualizar el título del documento
    if (location.canton) {
      document.title = `SAPP - EMPRESA PÚBLICA MUNICIPAL DE FAENAMIENTO
DEL CANTÓN  DE ${location.canton}`;
    }
  }, [location.canton]);

  return null; // Este componente no renderiza nada visible
}
