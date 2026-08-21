import { http } from "@/lib/ky";
import {
    CreateSettingHygieneBody,
    ResponseEquipmentAll,
    ResponseSettingHygieneAdminAll,
    ResponseSettingHygieneAdminPaginated,
    SearchParamsSettingHygiene,
} from "@/features/setting-hygiene/domain/setting-hygiene-admin.domain";

export function getSettingHygieneAdminService(): Promise<ResponseSettingHygieneAdminAll> {
    return http.get("v1/1.0.0/setting-hygiene/all").json();
}

export function getSettingHygieneAdminPaginatedService(searchParams: SearchParamsSettingHygiene): Promise<ResponseSettingHygieneAdminPaginated> {
    return http.get("v1/1.0.0/setting-hygiene/list", { searchParams }).json();
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

export function deleteSettingHygienePermanentlyService(id: number) {
    return http.delete(`v1/1.0.0/setting-hygiene/${id}/permanent`).json();
}

export function getEquipmentAllService(): Promise<ResponseEquipmentAll> {
    return http.get("v1/1.0.0/equipment/all").json();
}
