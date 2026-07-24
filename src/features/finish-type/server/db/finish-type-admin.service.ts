import { http } from "@/lib/ky";
import {
    CreateFinishTypeBody,
    ResponseFinishTypesAdminAll,
    ResponseSpeciesAll,
} from "@/features/finish-type/domain";

export function getFinishTypesAdminService(): Promise<ResponseFinishTypesAdminAll> {
    return http.get("v1/1.0.0/finish-type/all").json();
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

export function getSpeciesAllService(): Promise<ResponseSpeciesAll> {
    return http.get("v1/1.0.0/specie/all").json();
}
