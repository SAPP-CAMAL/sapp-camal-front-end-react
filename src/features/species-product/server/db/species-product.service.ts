import { http } from "@/lib/ky";
import {
  ResponseSpeciesProductPaginated,
  SearchParamsSpeciesProduct,
  SpeciesProduct,
} from "@/features/species-product/domain";
import { CommonHttpResponseSingle } from "@/features/people/domain";

export type ResponseSpeciesProductAll = CommonHttpResponseSingle<SpeciesProduct[]>;

export type CreateSpeciesProductBody = {
  idSpecies: number;
  idProductType: number;
  productName: string;
  productCode: string;
  idAnimalSex?: number | null;
  displayOrder?: number;
  status?: boolean;
};

export type UpdateSpeciesProductBody = Partial<CreateSpeciesProductBody>;

export function getAllSpeciesProductsService(): Promise<ResponseSpeciesProductAll> {
  return http.get("v1/1.0.0/specie-product/all").json();
}

export function getSpeciesProductsPaginatedService(
  searchParams: SearchParamsSpeciesProduct,
): Promise<ResponseSpeciesProductPaginated> {
  return http.get("v1/1.0.0/specie-product/list", { searchParams }).json();
}

export function createSpeciesProductService(body: CreateSpeciesProductBody) {
  return http.post("v1/1.0.0/specie-product", { json: body }).json();
}

export function updateSpeciesProductService(id: number, body: UpdateSpeciesProductBody) {
  return http.patch(`v1/1.0.0/specie-product/${id}`, { json: body }).json();
}

export function deleteSpeciesProductService(id: number) {
  return http.delete(`v1/1.0.0/specie-product/${id}`);
}

export function deleteSpeciesProductPermanentlyService(id: number) {
  return http.delete(`v1/1.0.0/specie-product/${id}/permanent`);
}
