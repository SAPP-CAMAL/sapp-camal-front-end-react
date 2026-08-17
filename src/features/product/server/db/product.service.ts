import { http } from "@/lib/ky";
import { CreateProductBody, ResponseProductPaginated, ResponseProductService, SearchParamsProduct } from "@/features/product/domain/product.domain";

export function createProductService(body: CreateProductBody) {
    return http.post("v1/1.0.0/product", { json: body }).json()
}

export function getProductsService(): Promise<ResponseProductService> {
    return http.get("v1/1.0.0/product/all").json()
}

export function getProductsPaginatedService(searchParams: SearchParamsProduct): Promise<ResponseProductPaginated> {
    return http.get("v1/1.0.0/product/list", { searchParams }).json()
}

export function updateProductService(id: number, body: Partial<CreateProductBody>) {
    return http.patch(`v1/1.0.0/product/${id}`, { json: body }).json()
}

export function deleteProductService(id: number) {
    return http.delete(`v1/1.0.0/product/${id}`).json()
}

export function deleteProductPermanentlyService(id: number) {
    return http.delete(`v1/1.0.0/product/${id}/permanent`).json()
}
