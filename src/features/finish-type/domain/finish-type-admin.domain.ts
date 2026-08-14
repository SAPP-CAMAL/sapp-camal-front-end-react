import { CommonHttpResponsePagination, CommonHttpResponseSingle } from "@/features/people/domain";

export type FinishTypeAdmin = {
    id: number;
    idSpecie: number;
    name: string;
    code: string;
    status: boolean;
    specie?: { id: number; name: string; status: boolean };
}

export type CreateFinishTypeBody = {
    idSpecie: number;
    name: string;
    code: string;
    status?: boolean;
}

export type SearchParamsFinishType = {
    page?: number;
    limit?: number;
    name?: string;
    idSpecie?: number;
}

export type ResponseFinishTypesPaginated = CommonHttpResponsePagination<FinishTypeAdmin>
export type ResponseSpeciesAll = CommonHttpResponseSingle<{ id: number; name: string; status: boolean }[]>
