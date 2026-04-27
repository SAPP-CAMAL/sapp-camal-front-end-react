"use client";

import { useQuery } from "@tanstack/react-query";
import { getSlaughterhouseInfo } from "../services/slaughterhouse.service";
import type { SlaughterhouseInfo } from "../types/slaughterhouse.types";

/**
 * Hook para obtener la información del camal desde el backend.
 * La información se cachea y se mantiene actualizada automáticamente.
 *
 */
export function useSlaughterhouseInfo() {
  const query = useQuery({
    queryKey: ["slaughterhouse-info"],
    queryFn: async () => {
      try {
        return await getSlaughterhouseInfo();
      } catch (error) {
        // Silenciar el error y devolver null - se usarán los valores por defecto
        console.info("[SlaughterhouseInfo] Endpoint no disponible, usando valores por defecto", error);
        return null;
      }
    },
    staleTime: 1000 * 60 * 60, // 1 hora - la info del camal no cambia frecuentemente
    gcTime: 1000 * 60 * 60 * 24, // 24 horas en caché
    retry: false, // No reintentar si falla - usaremos valores por defecto
  });

  // Valores por defecto en caso de que no haya datos o esté cargando
  const defaultInfo: SlaughterhouseInfo = {
    camalName: "CAMAL MUNICIPAL...",
    companyName: "EMPRESA PÚBLICA MUNICIPAL DE FAENAMIENTO",
    location: {
      province: "...",
      canton: "...",
      parish: "...",
    },
    gadUrl: "www.gadmriobamba.gob.ec",
  };

  const info = query.data ?? defaultInfo;

  /**
   * Helper para obtener el nombre completo de la empresa con ubicación
   */
  const getFullCompanyName = () =>
    `${info.companyName} DEL CANTÓN ${info.location.canton}`;

  return {
    ...info,
    getFullCompanyName,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
  };
}
