import { http } from "@/lib/ky";
import {
    CreateCatalogueTypeBody,
    CreateCatalogueValueBody,
    ResponseCatalogueTypesAll,
    ResponseCatalogueTypesPaginated,
    ResponseCatalogueValues,
    SearchParamsCatalogueType,
    SearchParamsCatalogueValue,
} from "@/features/catalogues/domain/catalogue-management.domain";

export function getCatalogueTypesService(): Promise<ResponseCatalogueTypesAll> {
    return http.get("v1/1.0.0/catalogues/catalogue-type").json();
}

export function getCatalogueTypesPaginatedService(searchParams: SearchParamsCatalogueType): Promise<ResponseCatalogueTypesPaginated> {
    return http.get("v1/1.0.0/catalogues/catalogue-type/list", { searchParams }).json();
}

export function createCatalogueTypeService(body: CreateCatalogueTypeBody) {
    return http.post("v1/1.0.0/catalogues/catalogue-type", { json: body }).json();
}

export function updateCatalogueTypeService(catalogueTypeId: number, body: Partial<CreateCatalogueTypeBody>) {
    return http.patch(`v1/1.0.0/catalogues/catalogue-type/${catalogueTypeId}`, { json: body }).json();
}

export function deleteCatalogueTypeService(catalogueTypeId: number) {
    return http.delete(`v1/1.0.0/catalogues/catalogue-type/${catalogueTypeId}`).json();
}

export function deleteCatalogueTypePermanentlyService(catalogueTypeId: number) {
    return http.delete(`v1/1.0.0/catalogues/catalogue-type/${catalogueTypeId}/permanent`).json();
}

export function getCatalogueValuesService(searchParams: SearchParamsCatalogueValue): Promise<ResponseCatalogueValues> {
    return http.get("v1/1.0.0/catalogues/catalogue", { searchParams }).json();
}

export function createCatalogueValueService(body: CreateCatalogueValueBody) {
    return http.post("v1/1.0.0/catalogues/catalogue", { json: body }).json();
}

export function updateCatalogueValueService(catalogueId: number, body: Partial<CreateCatalogueValueBody>) {
    return http.patch(`v1/1.0.0/catalogues/catalogue/${catalogueId}`, { json: body }).json();
}

export function deleteCatalogueValueService(catalogueId: number) {
    return http.delete(`v1/1.0.0/catalogues/catalogue/${catalogueId}`).json();
}

export function deleteCatalogueValuePermanentlyService(catalogueId: number) {
    return http.delete(`v1/1.0.0/catalogues/catalogue/${catalogueId}/permanent`).json();
}
