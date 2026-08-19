import { http } from "@/lib/ky";
import {
    CreateFinishTypeBody,
    ResponseFinishTypesPaginated,
    ResponseSpeciesAll,
    SearchParamsFinishType,
} from "@/features/finish-type/domain";

export function getFinishTypesAdminService(searchParams: SearchParamsFinishType): Promise<ResponseFinishTypesPaginated> {
    return http.get("v1/1.0.0/finish-type/list", { searchParams }).json();
}

export function createFinishTypeService(body: CreateFinishTypeBody) {
    return http.post("v1/1.0.0/finish-type", { json: body }).json();
}

export function updateFinishTypeService(id: number, body: Partial<CreateFinishTypeBody>) {
    return http.patch(`v1/1.0.0/finish-type/${id}`, { json: body }).json();
}

export function deleteFinishTypeService(id: number) {
    return http.delete(`v1/1.0.0/finish-type/${id}`).json();
}

export function deleteFinishTypePermanentlyService(id: number) {
    return http.delete(`v1/1.0.0/finish-type/${id}/permanent`).json();
}

export function getSpeciesAllService(): Promise<ResponseSpeciesAll> {
    return http.get("v1/1.0.0/specie/all").json();
}
