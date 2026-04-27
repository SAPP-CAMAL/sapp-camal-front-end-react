import type { SlaughterhouseInfo, SlaughterhouseInfoApiResponse } from "../types/slaughterhouse.types";

const SLAUGHTERHOUSE_INFO_PATH = "v1/1.0.0/environment-variables/find-camal-info";

function normalizeBaseUrl(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  if (!trimmed) return undefined;
  return trimmed.replace(/\/+$/, "");
}

function addCandidate(candidates: string[], value: string | undefined) {
  const normalized = normalizeBaseUrl(value);
  if (!normalized) return;
  if (!candidates.includes(normalized)) {
    candidates.push(normalized);
  }
}

/**
 * Obtiene una lista de URLs base candidatas para consultar el endpoint.
 */
function getApiBaseUrls(): string[] {
  const candidates: string[] = [];

  if (typeof window !== "undefined") {
    addCandidate(candidates, (window as any).__NEXT_PUBLIC_API_URL__);
  }

  addCandidate(candidates, process.env.NEXT_PUBLIC_API_URL);
  addCandidate(candidates, process.env.API_URL_LOCAL_FALLBACK);

  // Fallback por proxy interno de Next (usa rewrites en next.config).
  if (!candidates.includes("/api/proxy")) {
    candidates.push("/api/proxy");
  }

  return candidates;
}

/**
 * Obtiene la información del camal desde el backend
 * Este endpoint no requiere autenticación
 */
export async function getSlaughterhouseInfo(): Promise<SlaughterhouseInfo> {
  const baseUrls = getApiBaseUrls();
  const errors: string[] = [];

  for (const baseUrl of baseUrls) {
    const url = `${baseUrl}/${SLAUGHTERHOUSE_INFO_PATH}`;

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        errors.push(`${url} -> HTTP ${response.status}`);
        continue;
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
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      errors.push(`${url} -> ${message}`);
    }
  }

  throw new Error(`[SlaughterhouseInfo] No se pudo obtener informacion del camal. Intentos: ${errors.join(" | ")}`);
}
