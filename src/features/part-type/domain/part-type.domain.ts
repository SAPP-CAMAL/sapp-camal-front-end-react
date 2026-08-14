import { CommonHttpResponse, CommonHttpResponsePagination } from "@/features/people/domain";

export type PartType = {
    id: number;
    description: string;
    status: boolean;
}

export type CreatePartTypeBody = {
    description: string;
}

export type SearchParamsPartType = {
    page?: number;
    limit?: number;
    description?: string;
    status?: boolean;
}

export type ResponsePartTypeService = CommonHttpResponse<PartType>
export type ResponsePartTypePaginated = CommonHttpResponsePagination<PartType>
