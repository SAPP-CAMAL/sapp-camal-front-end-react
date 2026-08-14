import { CommonHttpResponsePagination, CommonHttpResponseSingle } from "@/features/people/domain";

export type CleaningMethodAdmin = {
    id: number;
    name: string;
    description?: string;
    status: boolean;
}

export type CreateCleaningMethodBody = {
    name: string;
    description?: string;
    status?: boolean;
}

export type SearchParamsCleaningMethod = {
    page?: number;
    limit?: number;
    name?: string;
    status?: boolean;
}

export type ResponseCleaningMethodsAdminAll = CommonHttpResponseSingle<CleaningMethodAdmin[]>
export type ResponseCleaningMethodsPaginated = CommonHttpResponsePagination<CleaningMethodAdmin>
