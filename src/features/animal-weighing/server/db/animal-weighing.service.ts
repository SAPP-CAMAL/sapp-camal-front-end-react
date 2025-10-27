import type {
  SaveAnimalWeighingRequest,
  GetAnimalWeighingRequest,
  AnimalWeighingData,
} from "../../domain";

/**
 * Servicio para guardar el pesaje de animales
 */
export async function saveAnimalWeighing(
  data: SaveAnimalWeighingRequest
): Promise<{ data: AnimalWeighingData }> {
  // TODO: Implementar llamada a la API
  console.log("Guardando pesaje:", data);
  console.log("Etapa de pesaje:", data.weighingStage);
  
  return {
    data: {
      id: 1,
      ...data,
      marca: "ER-002",
      productiveStageName: "Vaca",
    },
  };
}

/**
 * Servicio para obtener pesajes por filtros
 */
export async function getAnimalWeighingByFilters(
  request: GetAnimalWeighingRequest
): Promise<{ data: AnimalWeighingData[] }> {
  // TODO: Implementar llamada a la API
  console.log("Obteniendo pesajes:", request);
  
  return {
    data: [],
  };
}
