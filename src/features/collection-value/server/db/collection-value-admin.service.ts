import { http } from "@/lib/ky";
import {
    CreateCollectionValueBody,
    ResponseCollectionValuesAll,
    ResponseSpeciesAll,
} from "@/features/collection-value/domain/collection-value.domain";

export function getCollectionValuesAdminService(): Promise<ResponseCollectionValuesAll> {
    return http.get("v1/1.0.0/collection-values/all").json();
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
