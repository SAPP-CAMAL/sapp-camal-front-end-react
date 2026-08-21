import { CommonHttpResponsePagination } from "@/features/people/domain";

export type HookType = {
    id: number;
    name: string;
    weight: number;
    description: string | null;
    idSpecie: number;
    status: boolean;
}

export type CreateHookTypeBody = {
    name: string;
    weight: number;
    description?: string;
    idSpecie: number;
    status?: boolean;
}

export type SearchParamsHookType = {
    page?: number;
    limit?: number;
    name?: string;
    idSpecie?: number;
    status?: string;
}

export type ResponseHookTypePaginated = CommonHttpResponsePagination<HookType>
