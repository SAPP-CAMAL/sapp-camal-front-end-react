import { CommonHttpResponse } from "@/features/people/domain";

export type ConfigSectionChannel = {
    id: number;
    sectionCode: string;
    orderNumber: number;
    idChannelType: number | null;
    description: string | null;
    status: boolean;
}

export type CreateConfigSectionChannelBody = {
    sectionCode: string;
    orderNumber: number;
    idChannelType: number;
    description?: string;
}

export type ResponseConfigSectionChannelService = CommonHttpResponse<ConfigSectionChannel>
