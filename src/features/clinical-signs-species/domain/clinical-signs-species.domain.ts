import { CommonHttpResponse } from "@/features/people/domain";

export type ClinicalSignsSpecies = {
    id: number;
    idClinicalSigns: number;
    idSpecies: number;
    details: string | null;
    status: boolean;
    species?: {
        id: number;
        name: string;
    };
}

export type CreateClinicalSignsSpeciesBody = {
    idClinicalSigns: number;
    idSpecies: number;
    details?: string;
}

export type ResponseClinicalSignsSpeciesService = CommonHttpResponse<ClinicalSignsSpecies>
