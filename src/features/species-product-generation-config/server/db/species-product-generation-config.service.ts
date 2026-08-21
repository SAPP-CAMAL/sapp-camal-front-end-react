import { http } from "@/lib/ky";
import {
  ResponseSpeciesProductGenerationConfigPaginated,
  SearchParamsSpeciesProductGenerationConfig,
  UpdateSpeciesProductGenerationConfigBody,
} from "@/features/species-product-generation-config/domain";

export function getSpeciesProductGenerationConfigPaginatedService(
  searchParams: SearchParamsSpeciesProductGenerationConfig
): Promise<ResponseSpeciesProductGenerationConfigPaginated> {
  return http
    .get("v1/1.0.0/species-product-generation-config/list", { searchParams })
    .json();
}

export function updateSpeciesProductGenerationConfigService(
  id: number,
  body: UpdateSpeciesProductGenerationConfigBody
) {
  return http
    .patch(`v1/1.0.0/species-product-generation-config/${id}`, { json: body })
    .json();
}
