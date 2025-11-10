import { http } from "@/lib/ky";
import type { GetProductAnatomicalLocationsResponse } from "../../domain/product-anatomical-locations.types";

/**
 * Obtiene las ubicaciones anatómicas de un producto desde la API
 * @param idProduct - ID del producto
 * @returns Promise con las ubicaciones anatómicas del producto
 */
export async function getProductAnatomicalLocationsService(
  idProduct: number
): Promise<GetProductAnatomicalLocationsResponse> {
  try {
    const response = await http
      .get(`v1/1.0.0/product/product-anatomical-locations/${idProduct}`, {
        next: {
          tags: ["postmortem", "product-anatomical-locations"],
        },
      })
      .json<GetProductAnatomicalLocationsResponse>();

    return response;
  } catch (error) {
    console.error("Error al obtener ubicaciones anatómicas:", error);
    throw error;
  }
}
