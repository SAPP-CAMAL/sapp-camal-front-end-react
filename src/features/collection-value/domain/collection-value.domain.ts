import { CommonHttpResponsePagination, CommonHttpResponseSingle } from "@/features/people/domain";

export type CollectionValueAdmin = {
    id: number;
    idSpecie: number;
    name: string;
    price: number;
    code: string;
    status: boolean;
    specie?: { id: number; name: string; status: boolean };
}

export type CreateCollectionValueBody = {
    idSpecie: number;
    name: string;
    price: number;
    code: string;
    status?: boolean;
}

export type SearchParamsCollectionValue = {
    page?: number;
    limit?: number;
    name?: string;
    idSpecie?: number;
}

export type ResponseCollectionValuesPaginated = CommonHttpResponsePagination<CollectionValueAdmin>
export type ResponseSpeciesAll = CommonHttpResponseSingle<{ id: number; name: string; status: boolean }[]>
