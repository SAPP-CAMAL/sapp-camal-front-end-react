import { http } from "@/lib/ky";
import {
    CreateBiosecurityLineBody,
    CreateSettingEquipmentLineBody,
    ResponseBiosecurityLinesPaginated,
    ResponseBiosecurityLinesService,
    ResponseSettingEquipmentLinesService,
    SearchParamsBiosecurityLines,
    UpdateBiosecurityLineBody,
} from "@/features/biosecurity-lines/domain/biosecurity-lines.domain";

export function getBiosecurityLinesService(): Promise<ResponseBiosecurityLinesService> {
    return http.get("v1/1.0.0/biosecurity-lines/all").json()
}

export function getBiosecurityLinesPaginatedService(searchParams: SearchParamsBiosecurityLines): Promise<ResponseBiosecurityLinesPaginated> {
    return http.get("v1/1.0.0/biosecurity-lines/list", { searchParams }).json()
}

export function createBiosecurityLineService(body: CreateBiosecurityLineBody) {
    return http.post("v1/1.0.0/biosecurity-lines", { json: body }).json()
}

export function updateBiosecurityLineService(id: number, body: UpdateBiosecurityLineBody) {
    return http.patch(`v1/1.0.0/biosecurity-lines/${id}`, { json: body }).json()
}

export function deleteBiosecurityLineService(id: number) {
    return http.delete(`v1/1.0.0/biosecurity-lines/${id}`).json()
}

export function deleteBiosecurityLinePermanentlyService(id: number) {
    return http.delete(`v1/1.0.0/biosecurity-lines/${id}/permanent`).json()
}

export function getSettingEquipmentLinesByBiosecurityLineService(idBiosecurityLine: number): Promise<ResponseSettingEquipmentLinesService> {
    const searchParams = new URLSearchParams();
    searchParams.append("idBiosecurityLine", idBiosecurityLine.toString());

    return http.get("v1/1.0.0/setting-equipment-lines/by-biosecurity-line", { searchParams }).json()
}

export function createSettingEquipmentLineService(body: CreateSettingEquipmentLineBody) {
    return http.post("v1/1.0.0/setting-equipment-lines", { json: body }).json()
}

export function deleteSettingEquipmentLineService(id: number) {
    return http.delete(`v1/1.0.0/setting-equipment-lines/${id}`).json()
}

export function deleteSettingEquipmentLinePermanentlyService(id: number) {
    return http.delete(`v1/1.0.0/setting-equipment-lines/${id}/permanent`).json()
}
