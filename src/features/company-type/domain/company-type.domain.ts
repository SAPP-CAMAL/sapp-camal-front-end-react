import { CommonHttpResponse, CommonHttpResponsePagination } from "@/features/people/domain";

export type CompanyType = {
    id: number;
    name: string;
    description: string | null;
    status: boolean;
}

export type CreateCompanyTypeBody = {
    name: string;
    description?: string;
}

export type SearchParamsCompanyType = {
    page?: number;
    limit?: number;
    name?: string;
    status?: boolean;
}

export type ResponseCompanyTypeService = CommonHttpResponse<CompanyType>
export type ResponseCompanyTypePaginated = CommonHttpResponsePagination<CompanyType>
