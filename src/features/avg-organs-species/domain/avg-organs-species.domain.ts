import { CommonHttpResponse, CommonHttpResponsePagination } from "@/features/people/domain";

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
    status?: boolean;
}

export type SearchParamsAvgOrgansSpecies = {
    page?: number;
    limit?: number;
    name?: string;
    status?: boolean;
}

export type ResponseAvgOrgansSpeciesService = CommonHttpResponse<AvgOrgansSpecies>
export type ResponseAvgOrgansSpeciesPaginated = CommonHttpResponsePagination<AvgOrgansSpecies>
