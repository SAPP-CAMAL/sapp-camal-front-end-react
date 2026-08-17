import { CommonHttpResponse, CommonHttpResponsePagination } from "@/features/people/domain";

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
    status?: boolean;
}

export type SearchParamsWeighingStage = {
    page?: number;
    limit?: number;
    name?: string;
    status?: boolean;
}

export type ResponseWeighingStageService = CommonHttpResponse<WeighingStage>
export type ResponseWeighingStagePaginated = CommonHttpResponsePagination<WeighingStage>
