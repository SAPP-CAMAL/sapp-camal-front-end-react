import { CommonHttpResponseSingle } from "@/features/people/domain";

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

export type ResponseFinishTypesAdminAll = CommonHttpResponseSingle<FinishTypeAdmin[]>
export type ResponseSpeciesAll = CommonHttpResponseSingle<{ id: number; name: string; status: boolean }[]>
