import { CommonHttpResponse, CommonHttpResponsePagination } from "@/features/people/domain";

export type Disease = {
    id: number;
    names: string;
    code: string;
    description: string | null;
    status: boolean;
}

export type CreateDiseaseBody = {
    names: string;
    code: string;
    description?: string;
}

export type SearchParamsDisease = {
    page?: number;
    limit?: number;
    name?: string;
    status?: boolean;
}

export type ResponseDiseaseService = CommonHttpResponse<Disease>
export type ResponseDiseasePaginated = CommonHttpResponsePagination<Disease>
