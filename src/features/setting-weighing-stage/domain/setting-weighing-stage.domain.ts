import { CommonHttpResponse, CommonHttpResponsePagination } from "@/features/people/domain";
import { WeighingStage } from "@/features/weighing-stage/domain/weighing-stage.domain";

export type SettingWeighingStage = {
    id: number;
    idWeighingStage: number;
    description?: string | null;
    status: boolean;
    weighingStage?: WeighingStage;
}

export type CreateSettingWeighingStageBody = {
    idWeighingStage: number;
    description?: string | null;
}

export type SearchParamsSettingWeighingStage = {
    page?: number;
    limit?: number;
    status?: boolean;
}

export type ResponseSettingWeighingStagesService = CommonHttpResponse<SettingWeighingStage>
export type ResponseSettingWeighingStagesPaginated = CommonHttpResponsePagination<SettingWeighingStage>
