import { http } from "@/lib/ky";
import {
    CreateCollectionValueBody,
    ResponseCollectionValuesPaginated,
    ResponseSpeciesAll,
    SearchParamsCollectionValue,
} from "@/features/collection-value/domain/collection-value.domain";

export function getCollectionValuesAdminService(searchParams: SearchParamsCollectionValue): Promise<ResponseCollectionValuesPaginated> {
    return http.get("v1/1.0.0/collection-values/list", { searchParams }).json();
}

export function createCollectionValueService(body: CreateCollectionValueBody) {
    return http.post("v1/1.0.0/collection-values", { json: body }).json();
}

export function updateCollectionValueService(id: number, body: Partial<CreateCollectionValueBody>) {
    return http.patch(`v1/1.0.0/collection-values/${id}`, { json: body }).json();
}

export function deleteCollectionValueService(id: number) {
    return http.delete(`v1/1.0.0/collection-values/${id}`).json();
}

export function deleteCollectionValuePermanentlyService(id: number) {
    return http.delete(`v1/1.0.0/collection-values/${id}/permanent`).json();
}

export function getSpeciesAllService(): Promise<ResponseSpeciesAll> {
    return http.get("v1/1.0.0/specie/all").json();
}
