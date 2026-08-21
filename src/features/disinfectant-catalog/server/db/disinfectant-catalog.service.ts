import { http } from "@/lib/ky";
import {
    CreateDisinfectantCatalogBody,
    ResponseDisinfectantCatalogAll,
    ResponseDisinfectantCatalogPaginated,
    SearchParamsDisinfectantCatalog,
} from "@/features/disinfectant-catalog/domain/disinfectant-catalog.domain";

export function getDisinfectantsCatalogService(): Promise<ResponseDisinfectantCatalogAll> {
    return http.get("v1/1.0.0/disinfectant/all").json();
}

export function getDisinfectantsCatalogPaginatedService(searchParams: SearchParamsDisinfectantCatalog): Promise<ResponseDisinfectantCatalogPaginated> {
    return http.get("v1/1.0.0/disinfectant/list", { searchParams }).json();
}

export function createDisinfectantCatalogService(body: CreateDisinfectantCatalogBody) {
    return http.post("v1/1.0.0/disinfectant", { json: body }).json();
}

export function updateDisinfectantCatalogService(id: number, body: Partial<CreateDisinfectantCatalogBody>) {
    return http.patch(`v1/1.0.0/disinfectant/${id}`, { json: body }).json();
}

export function deleteDisinfectantCatalogService(id: number) {
    return http.delete(`v1/1.0.0/disinfectant/${id}`).json();
}

export function deleteDisinfectantCatalogPermanentlyService(id: number) {
    return http.delete(`v1/1.0.0/disinfectant/${id}/permanent`).json();
}
