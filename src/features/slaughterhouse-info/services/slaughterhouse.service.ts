import type { SlaughterhouseInfo, SlaughterhouseInfoApiResponse } from "../types/slaughterhouse.types";

/**
 * Obtiene la URL base de la API según el entorno
 */
function getApiBaseUrl(): string {
  const configured = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (configured) return configured;

  throw new Error("NEXT_PUBLIC_API_URL no esta configurado. Define esta variable en .env.local.");
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
