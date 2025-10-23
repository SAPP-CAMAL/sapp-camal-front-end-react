import { http } from "@/lib/ky";
import type { GetAllLinesResponse, LineItem } from "../../domain/line.types";

/**
 * Servicio para obtener todas las líneas disponibles desde la API
 * @returns Promise con la respuesta completa de la API
 */
export const getAllLinesService = async (): Promise<GetAllLinesResponse> => {
  try {
    const response = await http
      .get("v1/1.0.0/line/all", {
        next: {
          tags: ["postmortem", "lines"],
        },
      })
      .json<GetAllLinesResponse>();

    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Obtiene solo las líneas activas
 * @returns Array de líneas activas
 */
export const getActiveLinesService = async (): Promise<LineItem[]> => {
  try {
    const response = await getAllLinesService();

    if (response.code !== 200 || !response.data) {
      return [];
    }

    // Filtrar líneas activas
    return response.data.filter((line) => line.status === true);
  } catch (error) {
    return [];
  }
};
