import { CommonHttpResponse } from "@/features/people/domain";

export type WeighingStage = {
    id: number;
    code: string;
    name: string;
    description: string | null;
    status: boolean;
}

export type CreateWeighingStageBody = {
    code: string;
    name: string;
    description?: string;
}

export type ResponseWeighingStageService = CommonHttpResponse<WeighingStage>
