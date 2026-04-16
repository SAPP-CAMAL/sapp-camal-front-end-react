import { http } from "@/lib/ky";
import { HTTPError } from "ky";
import type { ApiStructureResponse } from "../../domain";

export async function getCleaningAreaStructureService(lineId?: number) {
  try {
    if (!lineId) {
      return null;
    }

    const lineIdAsString = lineId.toString();
    const searchParams: Record<string, string> = {
      // Algunos backends esperan lineId y otros idLine; enviamos ambos por compatibilidad.
      lineId: lineIdAsString,
      idLine: lineIdAsString,
    };

    const response = await http
      .get("v1/1.0.0/cleaning-area-structure/by-line", {
        searchParams,
      })
      .json<ApiStructureResponse>();

    return response;
  } catch (error) {
    if (error instanceof HTTPError && error.response.status === 404) {
      // 404 puede representar que no existe estructura configurada para la linea.
      return null;
    }
    console.error("Error fetching cleaning area structure:", error);
    return null;
  }
}
