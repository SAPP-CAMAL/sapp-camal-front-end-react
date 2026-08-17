import { CommonHttpResponse, CommonHttpResponsePagination } from "@/features/people/domain";

export type Opinion = {
    id: number;
    name: string;
    code: string;
    status: boolean;
}

export type CreateOpinionBody = {
    name: string;
    code: string;
    status?: boolean;
}

export type SearchParamsOpinion = {
    page?: number;
    limit?: number;
    name?: string;
    status?: boolean;
}

export type ResponseOpinionService = CommonHttpResponse<Opinion>
export type ResponseOpinionPaginated = CommonHttpResponsePagination<Opinion>
