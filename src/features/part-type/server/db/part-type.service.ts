import { http } from "@/lib/ky";
import { CreatePartTypeBody, ResponsePartTypeService } from "@/features/part-type/domain/part-type.domain";

export function createPartTypeService(body: CreatePartTypeBody) {
    return http.post("v1/1.0.0/part-type", { json: body }).json()
}

export function getPartTypesService(): Promise<ResponsePartTypeService> {
    return http.get("v1/1.0.0/part-type/all").json()
}

export function updatePartTypeService(id: number, body: Partial<CreatePartTypeBody>) {
    return http.patch(`v1/1.0.0/part-type/${id}`, { json: body }).json()
}

export function deletePartTypeService(id: number) {
    return http.delete(`v1/1.0.0/part-type/${id}`).json()
}

export function deletePartTypePermanentlyService(id: number) {
    return http.delete(`v1/1.0.0/part-type/${id}/permanent`).json()
}
