import { http } from "@/lib/ky";
import type {
  SaveAnimalWeighingRequest,
  UpdateAnimalWeighingRequest,
  GetAnimalWeighingRequest,
  GetAnimalWeighingResponse,
} from "../../domain";

/**
 * Servicio para guardar el pesaje de animales
 */
export async function saveAnimalWeighing(
  data: SaveAnimalWeighingRequest
): Promise<{ code: number; message: string; data: any }> {
  const response = await http
    .post("v1/1.0.0/animal-weighing", {
      json: data,
    })
    .json<{ code: number; message: string; data: any }>();

  return response;
}

/**
 * Servicio para actualizar el pesaje de animales
 */
export async function updateAnimalWeighing(
  idAnimalWeighing: number,
  data: UpdateAnimalWeighingRequest
): Promise<{ code: number; message: string; data: any }> {
  const response = await http
    .patch(`v1/1.0.0/animal-weighing/${idAnimalWeighing}`, {
      json: data,
    })
    .json<{ code: number; message: string; data: any }>();

  return response;
}

/**
 * Servicio para eliminar el pesaje de animales
 */
export async function deleteAnimalWeighing(
  idAnimalWeighing: number
): Promise<{ code: number; message: string; data: any }> {
  const response = await http
    .delete(`v1/1.0.0/animal-weighing/${idAnimalWeighing}`)
    .json<{ code: number; message: string; data: any }>();

  return response;
}

/**
 * Servicio para obtener pesajes por filtros
 */
export async function getAnimalWeighingByFilters(
  request: GetAnimalWeighingRequest
): Promise<GetAnimalWeighingResponse> {
  const response = await http
    .get("v1/1.0.0/detail-specie-cert/detail-animal", {
      searchParams: {
        slaughterDate: request.slaughterDate,
        idSpecie: request.idSpecie.toString(),
        idWeighingStage: request.idWeighingStage.toString(),
      },
    })
    .json<GetAnimalWeighingResponse>();

  return response;
}
