import { CommonHttpResponseSingle } from "@/features/people/domain";

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

export type ResponseCollectionValuesAll = CommonHttpResponseSingle<CollectionValueAdmin[]>
export type ResponseSpeciesAll = CommonHttpResponseSingle<{ id: number; name: string; status: boolean }[]>
