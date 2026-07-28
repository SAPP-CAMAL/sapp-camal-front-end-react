import { http } from "@/lib/ky";
import { CreateLineBody, ResponseLinesAdmin } from "@/features/line/domain";

export function getLinesAdminService(): Promise<ResponseLinesAdmin> {
    return http.get("v1/1.0.0/line/admin").json();
}

export function createLineService(body: CreateLineBody) {
    return http.post("v1/1.0.0/line", { json: body }).json();
}

export function updateLineService(id: number, body: Partial<CreateLineBody>) {
    return http.patch(`v1/1.0.0/line/${id}`, { json: body }).json();
}

export function deleteLineService(id: number) {
    return http.delete(`v1/1.0.0/line/${id}`).json();
}

export function deleteLinePermanentlyService(id: number) {
    return http.delete(`v1/1.0.0/line/${id}/permanent`).json();
}
