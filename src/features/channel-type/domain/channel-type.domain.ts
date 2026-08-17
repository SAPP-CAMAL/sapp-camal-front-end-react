import { CommonHttpResponse, CommonHttpResponsePagination } from "@/features/people/domain";

export type ChannelType = {
    id: number;
    code: string;
    name: string;
    description: string | null;
    hooksQuantity: number;
    status: boolean;
}

export type CreateChannelTypeBody = {
    code: string;
    name: string;
    description?: string;
    hooksQuantity: number;
    status?: boolean;
}

export type SearchParamsChannelType = {
    page?: number;
    limit?: number;
    name?: string;
    status?: boolean;
}

export type ResponseChannelTypeService = CommonHttpResponse<ChannelType>
export type ResponseChannelTypePaginated = CommonHttpResponsePagination<ChannelType>
