import { http } from "@/lib/ky";
import {
    CreateCleaningCatalogBody,
    ResponseCleaningCatalogPaginated,
    ResponseCleaningCatalogService,
    SearchParamsCleaningCatalog,
} from "@/features/cleaning-catalog/domain/cleaning-catalog.domain";

export function createCleaningCatalogService(body: CreateCleaningCatalogBody) {
    return http.post("v1/1.0.0/cleaning-catalog", { json: body }).json()
}

export function getCleaningCatalogService(): Promise<ResponseCleaningCatalogService> {
    return http.get("v1/1.0.0/cleaning-catalog/all").json()
}

export function getCleaningCatalogPaginatedService(searchParams: SearchParamsCleaningCatalog): Promise<ResponseCleaningCatalogPaginated> {
    return http.get("v1/1.0.0/cleaning-catalog/list", { searchParams }).json()
}

export function updateCleaningCatalogService(id: number, body: Partial<CreateCleaningCatalogBody>) {
    return http.patch(`v1/1.0.0/cleaning-catalog/${id}`, { json: body }).json()
}

export function deleteCleaningCatalogService(id: number) {
    return http.delete(`v1/1.0.0/cleaning-catalog/${id}`).json()
}

export function deleteCleaningCatalogPermanentlyService(id: number) {
    return http.delete(`v1/1.0.0/cleaning-catalog/${id}/permanent`).json()
}
