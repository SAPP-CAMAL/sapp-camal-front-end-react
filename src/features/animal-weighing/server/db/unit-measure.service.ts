import { http } from "@/lib/ky";
import type { GetUnitMeasureResponse } from "../../domain";

/**
 * Servicio para obtener la unidad de medida de trabajo
 */
export async function getUnitMeasureService(): Promise<GetUnitMeasureResponse> {
  const response = await http
    .get("v1/1.0.0/unit-measure/unit-work")
    .json<GetUnitMeasureResponse>();

  return response;
}
