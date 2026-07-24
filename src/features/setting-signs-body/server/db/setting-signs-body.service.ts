import { http } from "@/lib/ky";
import { CreateSettingSignsBodyBody, ResponseSettingSignsBodyService } from "@/features/setting-signs-body/domain/setting-signs-body.domain";

export function createSettingSignsBodyService(body: CreateSettingSignsBodyBody) {
    return http.post("v1/1.0.0/setting-sign-body", { json: body }).json()
}

export function getSettingSignsBodyService(): Promise<ResponseSettingSignsBodyService> {
    return http.get("v1/1.0.0/setting-sign-body/all").json()
}

export function updateSettingSignsBodyService(id: number, body: Partial<CreateSettingSignsBodyBody>) {
    return http.patch(`v1/1.0.0/setting-sign-body/${id}`, { json: body }).json()
}

export function deleteSettingSignsBodyService(id: number) {
    return http.delete(`v1/1.0.0/setting-sign-body/${id}`).json()
}
