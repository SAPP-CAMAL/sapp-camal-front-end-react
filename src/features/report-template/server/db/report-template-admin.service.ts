import { http } from "@/lib/ky";
import {
    CreateReportElementBody,
    CreateReportSectionBody,
    CreateReportTemplateBody,
    ResponseReportCodesAll,
    ResponseReportElementsAll,
    ResponseReportSectionsAll,
    ResponseReportTemplatesAll,
    ResponseReportTemplatesPaginated,
    SearchParamsReportTemplate,
} from "@/features/report-template/domain/report-template-admin.domain";

export function getReportTemplatesAdminService(): Promise<ResponseReportTemplatesAll> {
    return http.get("v1/1.0.0/report-template/all").json();
}

export function getReportTemplatesPaginatedService(searchParams: SearchParamsReportTemplate): Promise<ResponseReportTemplatesPaginated> {
    return http.get("v1/1.0.0/report-template/list", { searchParams }).json();
}

export function createReportTemplateService(body: CreateReportTemplateBody) {
    return http.post("v1/1.0.0/report-template", { json: body }).json();
}

export function updateReportTemplateService(id: number, body: Partial<CreateReportTemplateBody>) {
    return http.patch(`v1/1.0.0/report-template/${id}`, { json: body }).json();
}

export function deleteReportTemplateService(id: number) {
    return http.delete(`v1/1.0.0/report-template/${id}`).json();
}

export function deleteReportTemplatePermanentlyService(id: number) {
    return http.delete(`v1/1.0.0/report-template/${id}/permanent`).json();
}

export function getReportCodesAllActiveService(): Promise<ResponseReportCodesAll> {
    return http.get("v1/1.0.0/report-codes/all-active").json();
}

export function getReportSectionsByTemplateService(idTemplate: number): Promise<ResponseReportSectionsAll> {
    return http.get(`v1/1.0.0/report-section/by-template/${idTemplate}`).json();
}

export function createReportSectionService(body: CreateReportSectionBody) {
    return http.post("v1/1.0.0/report-section", { json: body }).json();
}

export function updateReportSectionService(id: number, body: Partial<CreateReportSectionBody>) {
    return http.patch(`v1/1.0.0/report-section/${id}`, { json: body }).json();
}

export function deleteReportSectionService(id: number) {
    return http.delete(`v1/1.0.0/report-section/${id}`).json();
}

export function deleteReportSectionPermanentlyService(id: number) {
    return http.delete(`v1/1.0.0/report-section/${id}/permanent`).json();
}

export function getReportElementsBySectionService(idSection: number): Promise<ResponseReportElementsAll> {
    return http.get(`v1/1.0.0/report-element/by-section/${idSection}`).json();
}

export function createReportElementService(body: CreateReportElementBody) {
    return http.post("v1/1.0.0/report-element", { json: body }).json();
}

export function updateReportElementService(id: number, body: Partial<CreateReportElementBody>) {
    return http.patch(`v1/1.0.0/report-element/${id}`, { json: body }).json();
}

export function deleteReportElementService(id: number) {
    return http.delete(`v1/1.0.0/report-element/${id}`).json();
}

export function deleteReportElementPermanentlyService(id: number) {
    return http.delete(`v1/1.0.0/report-element/${id}/permanent`).json();
}
