import { http } from "@/lib/ky";
import { CreateReportCodeBody, ResponseReportCodesService } from "@/features/report-codes/domain/report-codes.domain";

export function createReportCodeService(body: CreateReportCodeBody) {
    return http.post("v1/1.0.0/report-codes", { json: body }).json()
}

export function getReportCodesService(): Promise<ResponseReportCodesService> {
    return http.get("v1/1.0.0/report-codes/all").json()
}

export function updateReportCodeService(id: number, body: Partial<CreateReportCodeBody>) {
    return http.patch(`v1/1.0.0/report-codes/${id}`, { json: body }).json()
}

export function deleteReportCodeService(id: number) {
    return http.delete(`v1/1.0.0/report-codes/${id}`).json()
}

export function deleteReportCodePermanentlyService(id: number) {
    return http.delete(`v1/1.0.0/report-codes/${id}/permanent`).json()
}
