import { http } from "@/lib/ky";
import { CreateHookTypeBody, ResponseHookTypeService } from "@/features/hook-type/domain/hook-type.domain";

export function createHookTypeService(body: CreateHookTypeBody) {
    return http.post("v1/1.0.0/hook-type", { json: body }).json()
}

export function getHookTypesService(): Promise<ResponseHookTypeService> {
    return http.get("v1/1.0.0/hook-type/all").json()
}

export function updateHookTypeService(id: number, body: Partial<CreateHookTypeBody>) {
    return http.patch(`v1/1.0.0/hook-type/${id}`, { json: body }).json()
}

export function deleteHookTypeService(id: number) {
    return http.delete(`v1/1.0.0/hook-type/${id}`).json()
}
