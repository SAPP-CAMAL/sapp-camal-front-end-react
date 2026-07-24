import { CommonHttpResponse } from "@/features/people/domain";

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
}

export type ResponseDiseaseGroupService = CommonHttpResponse<DiseaseGroup>
