import { http } from "@/lib/ky";
import type {
  GetSpeciesDiseaseResponse,
  GroupedColumn,
} from "../../domain/species-disease.types";

/**
 * Obtiene las enfermedades por especie desde la API
 * @param idSpecie - ID de la especie
 * @returns Promise con las enfermedades de la especie
 */
export const getSpeciesDiseaseService = async (
  idSpecie: number
): Promise<GetSpeciesDiseaseResponse> => {
  try {
    const response = await http
      .get("v1/1.0.0/species-disease/by-specie", {
        searchParams: {
          idSpecie: idSpecie.toString(),
        },
        next: {
          tags: ["postmortem", "species-disease"],
        },
      })
      .json<GetSpeciesDiseaseResponse>();

    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Agrupa las enfermedades por producto para renderizar la tabla
 * @param data - Array de SpeciesDisease
 * @returns Array de columnas agrupadas por producto
 */
export const groupDiseasesByProduct = (
  data: GetSpeciesDiseaseResponse["data"]
): GroupedColumn[] => {
  const productMap = new Map<string, GroupedColumn>();

  data.forEach((item) => {
    const productName = item.productDisease.product.description;
    const diseaseName = item.productDisease.disease.names;
    const speciesDiseaseId = item.id; // ID de SpeciesDisease (el correcto para guardar)
    const productDiseaseId = item.productDisease.id;

    if (!productMap.has(productName)) {
      productMap.set(productName, {
        product: productName,
        diseases: [],
      });
    }

    productMap.get(productName)!.diseases.push({
      id: speciesDiseaseId, // Usar el ID de SpeciesDisease
      name: diseaseName,
      productDiseaseId,
    });
  });

  return Array.from(productMap.values());
};
