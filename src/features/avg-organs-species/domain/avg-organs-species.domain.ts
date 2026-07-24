import { CommonHttpResponse } from "@/features/people/domain";

export type AvgOrgansSpecies = {
    id: number;
    avgWeight: number | null;
    status: boolean;
    specie?: {
        id: number;
        name: string;
    };
    product?: {
        id: number;
        description: string;
    };
}

export type CreateAvgOrgansSpeciesBody = {
    idSpecie: number;
    idProduct: number;
    avgWeight?: number;
}

export type ResponseAvgOrgansSpeciesService = CommonHttpResponse<AvgOrgansSpecies>
