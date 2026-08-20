import { http } from "@/lib/ky";
import {
    CreateDetailDistributionBody,
    CreateDistributionProductBody,
    ResponseDetailDistributionsService,
    ResponseDistributionProductsPaginated,
    ResponseDistributionProductsService,
    ResponseProductsService,
    SearchParamsDistributionProduct,
} from "@/features/distribution-product/domain/distribution-product.domain";

export function createDistributionProductService(body: CreateDistributionProductBody) {
    return http.post("v1/1.0.0/distribution-product", { json: body }).json()
}

export function getDistributionProductsService(): Promise<ResponseDistributionProductsService> {
    return http.get("v1/1.0.0/distribution-product/all").json()
}

export function getDistributionProductsPaginatedService(searchParams: SearchParamsDistributionProduct): Promise<ResponseDistributionProductsPaginated> {
    return http.get("v1/1.0.0/distribution-product/list", { searchParams }).json()
}

export function updateDistributionProductService(id: number, body: Partial<CreateDistributionProductBody>) {
    return http.patch(`v1/1.0.0/distribution-product/${id}`, { json: body }).json()
}

export function deleteDistributionProductService(id: number) {
    return http.delete(`v1/1.0.0/distribution-product/${id}`).json()
}

export function deleteDistributionProductPermanentlyService(id: number) {
    return http.delete(`v1/1.0.0/distribution-product/${id}/permanent`).json()
}

export function createDetailDistributionService(body: CreateDetailDistributionBody) {
    return http.post("v1/1.0.0/detail-distribution", { json: body }).json()
}

export function getDetailDistributionsService(): Promise<ResponseDetailDistributionsService> {
    return http.get("v1/1.0.0/detail-distribution/all").json()
}

export function deleteDetailDistributionService(id: number) {
    return http.delete(`v1/1.0.0/detail-distribution/${id}`).json()
}

export function deleteDetailDistributionPermanentlyService(id: number) {
    return http.delete(`v1/1.0.0/detail-distribution/${id}/permanent`).json()
}

export function getActiveProductsService(): Promise<ResponseProductsService> {
    return http.get("v1/1.0.0/product/all").json()
}
