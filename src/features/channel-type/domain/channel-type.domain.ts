import { CommonHttpResponse } from "@/features/people/domain";

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
}

export type ResponseChannelTypeService = CommonHttpResponse<ChannelType>
