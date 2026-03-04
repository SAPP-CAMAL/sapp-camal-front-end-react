import { http } from "@/lib/ky";
import type { ApiStructureResponse } from "../../domain";

export async function getCleaningAreaStructureService(lineId?: number) {
  try {
    if (!lineId) {
      return null;
    }

    const searchParams: Record<string, string> = {
      idLine: lineId.toString(),
    };

    const response = await http
      .get("v1/1.0.0/cleaning-area-structure/by-line", {
        searchParams,
      })
      .json<ApiStructureResponse>();

    return response;
  } catch (error) {
    console.error("Error fetching cleaning area structure:", error);
    return null;
  }
}
