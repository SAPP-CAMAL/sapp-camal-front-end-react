import { CommonHttpResponse } from "@/features/people/domain";

export type BodyParts = {
    id: number;
    idPartType: number;
    code: string;
    description: string;
    status: boolean;
}

export type CreateBodyPartsBody = {
    idPartType: number;
    code: string;
    description: string;
}

export type ResponseBodyPartsService = CommonHttpResponse<BodyParts>
