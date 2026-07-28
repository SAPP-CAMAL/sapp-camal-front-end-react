import { http } from "@/lib/ky";
import { CreateCorralBody, ResponseCorralsAdminAll } from "@/features/corral/domain";

export function getCorralsAdminService(): Promise<ResponseCorralsAdminAll> {
    return http.get("v1/1.0.0/corral/all").json();
}

export function createCorralAdminService(body: CreateCorralBody) {
    return http.post("v1/1.0.0/corral", { json: body }).json();
}

export function updateCorralAdminService(id: number, body: Partial<CreateCorralBody>) {
    return http.patch(`v1/1.0.0/corral/${id}`, { json: body }).json();
}

export function deleteCorralAdminService(id: number) {
    return http.delete(`v1/1.0.0/corral/${id}`).json();
}

export function deleteCorralPermanentlyService(id: number) {
    return http.delete(`v1/1.0.0/corral/${id}/permanent`).json();
}
