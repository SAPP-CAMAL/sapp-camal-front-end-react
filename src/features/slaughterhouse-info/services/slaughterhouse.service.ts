import { http } from "@/lib/ky";
import type { SlaughterhouseInfo, SlaughterhouseInfoApiResponse } from "../types/slaughterhouse.types";

/**
 * Obtiene la información del camal desde el backend
 */
export async function getSlaughterhouseInfo(): Promise<SlaughterhouseInfo> {
  const response = await http.get("v1/1.0.0/environment-variables/find-camal-info").json<SlaughterhouseInfoApiResponse>();
  
  // Transformar la respuesta del backend al formato interno
  return {
    camalName: response.data.nameCamal,
    companyName: response.data.companyName,
    location: {
      province: response.data.reportProvince,
      canton: response.data.reportCanton,
      parish: response.data.reportParroquia,
    },
    gadUrl: response.data.gadUrl,
  };
}
