import { http } from "@/lib/ky";
import {
    CreateSettingHygieneBody,
    ResponseEquipmentAll,
    ResponseSettingHygieneAdminAll,
} from "@/features/setting-hygiene/domain/setting-hygiene-admin.domain";

export function getSettingHygieneAdminService(): Promise<ResponseSettingHygieneAdminAll> {
    return http.get("v1/1.0.0/setting-hygiene/all").json();
}

export function createSettingHygieneService(body: CreateSettingHygieneBody) {
    return http.post("v1/1.0.0/setting-hygiene", { json: body }).json();
}

export function updateSettingHygieneService(id: number, body: Partial<CreateSettingHygieneBody>) {
    return http.patch(`v1/1.0.0/setting-hygiene/${id}`, { json: body }).json();
}

export function deleteSettingHygieneService(id: number) {
    return http.delete(`v1/1.0.0/setting-hygiene/${id}`).json();
}

export function getEquipmentAllService(): Promise<ResponseEquipmentAll> {
    return http.get("v1/1.0.0/equipment/all").json();
}
