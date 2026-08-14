import { http } from "@/lib/ky";
import {
    CreateCompanyTypeBody,
    ResponseCompanyTypePaginated,
    ResponseCompanyTypeService,
    SearchParamsCompanyType,
} from "@/features/company-type/domain/company-type.domain";

export function createCompanyTypeService(body: CreateCompanyTypeBody) {
    return http.post("v1/1.0.0/company-type", { json: body }).json()
}

export function getCompanyTypesService(): Promise<ResponseCompanyTypeService> {
    return http.get("v1/1.0.0/company-type/all").json()
}

export function getCompanyTypesPaginatedService(searchParams: SearchParamsCompanyType): Promise<ResponseCompanyTypePaginated> {
    return http.get("v1/1.0.0/company-type/list", { searchParams }).json()
}

export function getActiveCompanyTypesService(): Promise<ResponseCompanyTypeService> {
    return http.get("v1/1.0.0/company-type/all-active").json()
}

export function updateCompanyTypeService(id: number, body: Partial<CreateCompanyTypeBody>) {
    return http.patch(`v1/1.0.0/company-type/${id}`, { json: body }).json()
}

export function deleteCompanyTypeService(id: number) {
    return http.delete(`v1/1.0.0/company-type/${id}`).json()
}

export function deleteCompanyTypePermanentlyService(id: number) {
    return http.delete(`v1/1.0.0/company-type/${id}/permanent`).json()
}
