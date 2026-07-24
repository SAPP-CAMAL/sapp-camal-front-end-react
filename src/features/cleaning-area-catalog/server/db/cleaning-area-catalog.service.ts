import { http } from "@/lib/ky";
import { CreateCleaningAreaCatalogBody, ResponseCleaningAreaCatalogService } from "@/features/cleaning-area-catalog/domain/cleaning-area-catalog.domain";

export function createCleaningAreaCatalogService(body: CreateCleaningAreaCatalogBody) {
    return http.post("v1/1.0.0/cleaning-area-catalog", { json: body }).json()
}

export function getCleaningAreaCatalogService(): Promise<ResponseCleaningAreaCatalogService> {
    return http.get("v1/1.0.0/cleaning-area-catalog/all").json()
}

export function updateCleaningAreaCatalogService(id: number, body: Partial<CreateCleaningAreaCatalogBody>) {
    return http.patch(`v1/1.0.0/cleaning-area-catalog/${id}`, { json: body }).json()
}

export function deleteCleaningAreaCatalogService(id: number) {
    return http.delete(`v1/1.0.0/cleaning-area-catalog/${id}`).json()
}
