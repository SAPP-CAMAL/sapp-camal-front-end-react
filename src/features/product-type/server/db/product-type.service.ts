import { http } from "@/lib/ky";
import { ProductType } from "@/features/product-type/domain";
import { CommonHttpResponseSingle } from "@/features/people/domain";

export type ResponseProductTypeAll = CommonHttpResponseSingle<ProductType[]>;

export type CreateProductTypeBody = {
  typeName: string;
  code: string;
  description?: string;
  status?: boolean;
};

export type UpdateProductTypeBody = Partial<CreateProductTypeBody>;

export function getAllProductTypesService(): Promise<ResponseProductTypeAll> {
  return http.get("v1/1.0.0/product-type/all").json();
}

export function createProductTypeService(body: CreateProductTypeBody) {
  return http.post("v1/1.0.0/product-type", { json: body }).json();
}

export function updateProductTypeService(id: number, body: UpdateProductTypeBody) {
  return http.patch(`v1/1.0.0/product-type/${id}`, { json: body }).json();
}

export function deleteProductTypeService(id: number) {
  return http.delete(`v1/1.0.0/product-type/${id}`);
}
