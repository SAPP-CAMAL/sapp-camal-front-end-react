import { http } from "@/lib/ky";
import type { GetAvgOrgansSpeciesResponse } from "../../domain/avg-organs-species.types";

/**
 * Obtiene el peso promedio de órganos por especie y producto desde la API
 * @param idSpecie - ID de la especie
 * @param idProduct - ID del producto
 * @returns Promise con el peso promedio del órgano
 */
export async function getAvgOrgansSpeciesService(
  idSpecie: number,
  idProduct: number
): Promise<GetAvgOrgansSpeciesResponse> {
  try {
    const response = await http
      .get("v1/1.0.0/avg-organs-species/by-specie-product", {
        searchParams: {
          idSpecie: idSpecie.toString(),
          idProduct: idProduct.toString(),
        },
        next: {
          tags: ["postmortem", "avg-organs-species"],
        },
      })
      .json<GetAvgOrgansSpeciesResponse>();

    return response;
  } catch (error) {
    console.error("Error al obtener peso promedio de órganos:", error);
    throw error;
  }
}
