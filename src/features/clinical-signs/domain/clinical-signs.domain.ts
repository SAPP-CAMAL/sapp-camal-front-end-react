import { CommonHttpResponse, CommonHttpResponsePagination } from "@/features/people/domain";

export type ClinicalSign = {
    id: number;
    description: string;
    groupSign: number;
    status: boolean;
}

export type CreateClinicalSignBody = {
    description: string;
    groupSign: number;
}

export type SearchParamsClinicalSign = {
    page?: number;
    limit?: number;
    description?: string;
    status?: boolean;
}

export type ResponseClinicalSignsService = CommonHttpResponse<ClinicalSign>
export type ResponseClinicalSignsPaginated = CommonHttpResponsePagination<ClinicalSign>

export const CLINICAL_SIGNS_GROUP_OPTIONS = [
    { value: 1, label: "Síndrome Nervioso" },
    { value: 2, label: "Síndrome Digestivo" },
    { value: 3, label: "Síndrome Respiratorio" },
    { value: 4, label: "Síndrome Vesicular" },
    { value: 5, label: "Tipo de Secreción" },
    { value: 6, label: "Cojera" },
    { value: 7, label: "Animales No Ambulatorios" },
    { value: 8, label: "Abscesos" },
];
