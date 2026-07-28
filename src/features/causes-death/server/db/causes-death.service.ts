import { http } from "@/lib/ky";
import { CreateCauseDeathBody, ResponseCausesDeathService } from "@/features/causes-death/domain/causes-death.domain";

export function createCauseDeathService(body: CreateCauseDeathBody) {
    return http.post("v1/1.0.0/causes-death", { json: body }).json()
}

export function getCausesDeathService(): Promise<ResponseCausesDeathService> {
    return http.get("v1/1.0.0/causes-death/all").json()
}

export function updateCauseDeathService(id: number, body: Partial<CreateCauseDeathBody>) {
    return http.patch(`v1/1.0.0/causes-death/${id}`, { json: body }).json()
}

export function deleteCauseDeathService(id: number) {
    return http.delete(`v1/1.0.0/causes-death/${id}`).json()
}

export function deleteCauseDeathPermanentlyService(id: number) {
    return http.delete(`v1/1.0.0/causes-death/${id}/permanent`).json()
}
