import { CommonHttpResponse, CommonHttpResponsePagination } from "@/features/people/domain";

export type CauseDeath = {
    id: number;
    name: string;
    status: boolean;
}

export type CreateCauseDeathBody = {
    name: string;
    status?: boolean;
}

export type SearchParamsCauseDeath = {
    page?: number;
    limit?: number;
    name?: string;
    status?: boolean;
}

export type ResponseCausesDeathService = CommonHttpResponse<CauseDeath>
export type ResponseCausesDeathPaginated = CommonHttpResponsePagination<CauseDeath>
