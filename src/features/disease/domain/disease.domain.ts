import { CommonHttpResponse } from "@/features/people/domain";

export type Disease = {
    id: number;
    names: string;
    code: string;
    description: string | null;
    status: boolean;
}

export type CreateDiseaseBody = {
    names: string;
    code: string;
    description?: string;
}

export type ResponseDiseaseService = CommonHttpResponse<Disease>
