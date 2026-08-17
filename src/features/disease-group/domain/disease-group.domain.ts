import { CommonHttpResponse, CommonHttpResponsePagination } from "@/features/people/domain";

export type DiseaseGroup = {
    id: number;
    name: string;
    groupNumber: number;
    code: string;
    status: boolean;
}

export type CreateDiseaseGroupBody = {
    name: string;
    groupNumber: number;
    code: string;
    status?: boolean;
}

export type SearchParamsDiseaseGroup = {
    page?: number;
    limit?: number;
    name?: string;
    status?: boolean;
}

export type ResponseDiseaseGroupService = CommonHttpResponse<DiseaseGroup>
export type ResponseDiseaseGroupPaginated = CommonHttpResponsePagination<DiseaseGroup>
