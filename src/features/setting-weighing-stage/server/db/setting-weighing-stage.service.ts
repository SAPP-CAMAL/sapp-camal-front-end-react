import { http } from "@/lib/ky";
import {
    CreateSettingWeighingStageBody,
    ResponseSettingWeighingStagesService,
} from "@/features/setting-weighing-stage/domain/setting-weighing-stage.domain";

export function createSettingWeighingStageService(body: CreateSettingWeighingStageBody) {
    return http.post("v1/1.0.0/setting-weighing-stage", { json: body }).json()
}

export function getSettingWeighingStagesService(): Promise<ResponseSettingWeighingStagesService> {
    return http.get("v1/1.0.0/setting-weighing-stage/all").json()
}

export function updateSettingWeighingStageService(id: number, body: Partial<CreateSettingWeighingStageBody> & { status?: boolean }) {
    return http.patch(`v1/1.0.0/setting-weighing-stage/${id}`, { json: body }).json()
}

export function deleteSettingWeighingStageService(id: number) {
    return http.delete(`v1/1.0.0/setting-weighing-stage/${id}`).json()
}
