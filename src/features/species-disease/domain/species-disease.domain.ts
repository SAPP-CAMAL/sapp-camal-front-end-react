import { CommonHttpResponse } from "@/features/people/domain";

export type SpeciesDisease = {
    id: number;
    status: boolean;
    productDisease?: {
        id: number;
    };
    specie?: {
        id: number;
        name: string;
    };
}

export type CreateSpeciesDiseaseBody = {
    idProductDisease: number;
    idSpecie: number;
}

export type ResponseSpeciesDiseaseService = CommonHttpResponse<SpeciesDisease>
