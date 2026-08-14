import { http } from "@/lib/ky";
import {
    CreateVisitorCompanyBody,
    ResponseVisitorCompanyPaginated,
    ResponseVisitorCompanyService,
    SearchParamsVisitorCompany,
} from "@/features/visitor-company/domain/visitor-company.domain";

export function createVisitorCompanyService(body: CreateVisitorCompanyBody) {
    return http.post("v1/1.0.0/visitor-company", { json: body }).json()
}

export function getVisitorCompaniesService(): Promise<ResponseVisitorCompanyService> {
    return http.get("v1/1.0.0/visitor-company/all").json()
}

export function getVisitorCompaniesPaginatedService(searchParams: SearchParamsVisitorCompany): Promise<ResponseVisitorCompanyPaginated> {
    return http.get("v1/1.0.0/visitor-company/list", { searchParams }).json()
}

export function updateVisitorCompanyService(id: number, body: Partial<CreateVisitorCompanyBody>) {
    return http.patch(`v1/1.0.0/visitor-company/${id}`, { json: body }).json()
}

export function deleteVisitorCompanyService(id: number) {
    return http.delete(`v1/1.0.0/visitor-company/${id}`).json()
}

export function deleteVisitorCompanyPermanentlyService(id: number) {
    return http.delete(`v1/1.0.0/visitor-company/${id}/permanent`).json()
}
