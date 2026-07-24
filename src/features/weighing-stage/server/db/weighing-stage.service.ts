import { http } from "@/lib/ky";
import { CreateWeighingStageBody, ResponseWeighingStageService } from "@/features/weighing-stage/domain/weighing-stage.domain";

export function createWeighingStageService(body: CreateWeighingStageBody) {
    return http.post("v1/1.0.0/weighing-stage", { json: body }).json()
}

export function getWeighingStagesService(): Promise<ResponseWeighingStageService> {
    return http.get("v1/1.0.0/weighing-stage/all").json()
}

export function updateWeighingStageService(id: number, body: Partial<CreateWeighingStageBody>) {
    return http.patch(`v1/1.0.0/weighing-stage/${id}`, { json: body }).json()
}

export function deleteWeighingStageService(id: number) {
    return http.delete(`v1/1.0.0/weighing-stage/${id}`).json()
}
