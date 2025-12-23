import { CommonHttpResponse, CommonHttpResponsePagination, CommonHttpResponseSingle } from "@/features/people/domain";
import { CreateCompanyBody, CreateVisitorLogBody, RCompanyType, UpdateVisitorLogBody, VisitorCompany, VisitorLogFilterBody, VisitorLogFilterResponse } from "../../domain";
import { http } from "@/lib/ky";

export function getVisitorLogByFilterService(body: VisitorLogFilterBody) {
    return http
        .post("v1/1.0.0/visitor-log/by-filters", {
            json: body
        })
        .json<CommonHttpResponsePagination<VisitorLogFilterResponse>>();
}


export function getAllVisitorCompanies() {
    return http
        .get("v1/1.0.0/visitor-company/all-active")
        .json<CommonHttpResponse<VisitorCompany>>();
}


export function createVisitorLogService(body: CreateVisitorLogBody) {
    return http
        .post("v1/1.0.0/visitor-log", {
            json: body
        })
        .json<CommonHttpResponseSingle<VisitorLogFilterResponse>>();
}

export function deleteVisitorLogService(id: number) {
    return http
        .delete(`v1/1.0.0/visitor-log/${id}`)
        .json();
}

export function upateVisitorLogService(id: number, body: UpdateVisitorLogBody) {
    return http
        .patch(`v1/1.0.0/visitor-log/${id}`, {
            json: body
        })
        .json();
}


export function getCompanyTypes() {
    return http
        .get("v1/1.0.0/company-type/all")
        .json<CommonHttpResponse<RCompanyType>>();
}

export function createVisitorCompanyService(body: CreateCompanyBody) {
    return http
        .post("v1/1.0.0/visitor-company", { json: body })
        .json()
}

export interface VisitorLogReportBody {
    page: number;
    limit: number;
    registerDate: string;
    identification?: string;
    fullName?: string;
    idCompany?: number;
}

export async function downloadVisitorLogReport(
    typeReport: "EXCEL" | "PDF",
    body: VisitorLogReportBody
): Promise<{ blob: Blob; filename: string }> {
    const response = await http
        .post(`v1/1.0.0/visitor-log/by-filters-report?typeReport=${typeReport}`, {
            json: body,
        })
        .blob();

    const extension = typeReport === "EXCEL" ? "xlsx" : "pdf";
    const filename = `reporte-visitas-${body.registerDate}.${extension}`;

    return { blob: response, filename };
}