import { http } from "@/lib/ky";
import { CreateOpinionBody, ResponseOpinionService } from "@/features/opinion/domain/opinion.domain";

export function createOpinionService(body: CreateOpinionBody) {
    return http.post("v1/1.0.0/opinion", { json: body }).json()
}

export function getOpinionsService(): Promise<ResponseOpinionService> {
    return http.get("v1/1.0.0/opinion/all").json()
}

export function updateOpinionService(id: number, body: Partial<CreateOpinionBody>) {
    return http.patch(`v1/1.0.0/opinion/${id}`, { json: body }).json()
}

export function deleteOpinionService(id: number) {
    return http.delete(`v1/1.0.0/opinion/${id}`).json()
}

export function deleteOpinionPermanentlyService(id: number) {
    return http.delete(`v1/1.0.0/opinion/${id}/permanent`).json()
}
