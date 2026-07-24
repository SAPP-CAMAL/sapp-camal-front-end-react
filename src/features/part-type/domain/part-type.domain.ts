import { CommonHttpResponse } from "@/features/people/domain";

export type PartType = {
    id: number;
    description: string;
    status: boolean;
}

export type CreatePartTypeBody = {
    description: string;
}

export type ResponsePartTypeService = CommonHttpResponse<PartType>
