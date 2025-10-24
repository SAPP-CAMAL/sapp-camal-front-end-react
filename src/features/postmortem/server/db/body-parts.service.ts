import { http } from "@/lib/ky";
import type { GetBodyPartsResponse } from "../../domain/body-parts.types";

/**
 * Obtiene todas las partes del cuerpo desde la API
 */
export const getBodyPartsService = async (): Promise<GetBodyPartsResponse> => {
  try {
    const response = await http
      .get("v1/1.0.0/body-parts/all", {
        next: {
          tags: ["postmortem", "body-parts"],
        },
      })
      .json<GetBodyPartsResponse>();

    return response;
  } catch (error) {
    throw error;
  }
};
