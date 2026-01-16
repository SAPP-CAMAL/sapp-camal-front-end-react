import type { SlaughterhouseInfo, SlaughterhouseInfoApiResponse } from "../types/slaughterhouse.types";

/**
 * Obtiene la URL base de la API según el entorno
 */
function getApiBaseUrl(): string {
  // En el servidor (SSR), no hay window
  if (typeof window === 'undefined') {
    // Usar variable de entorno o fallback a producción
    return process.env.NEXT_PUBLIC_API_URL || 'https://sapp-ruminahui.com';
  }

  // En el cliente, detectar según el hostname
  const hostname = window.location.hostname;
  const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';

  if (isLocalhost) {
    // En desarrollo local, usar localhost
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  }

  // En producción, SIEMPRE usar la URL de producción
  return 'https://sapp-ruminahui.com';
}

/**
 * Obtiene la información del camal desde el backend
 * Este endpoint no requiere autenticación
 */
export async function getSlaughterhouseInfo(): Promise<SlaughterhouseInfo> {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}/v1/1.0.0/environment-variables/find-camal-info`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data: SlaughterhouseInfoApiResponse = await response.json();

  // Transformar la respuesta del backend al formato interno
  return {
    camalName: data.data.nameCamal,
    companyName: data.data.companyName,
    location: {
      province: data.data.reportProvince,
      canton: data.data.reportCanton,
      parish: data.data.reportParroquia,
    },
    gadUrl: data.data.gadUrl,
  };
}
