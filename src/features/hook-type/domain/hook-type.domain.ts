import { CommonHttpResponse } from "@/features/people/domain";

export type HookType = {
    id: number;
    name: string;
    weight: number;
    description: string | null;
    idSpecie: number;
    status: boolean;
}

export type CreateHookTypeBody = {
    name: string;
    weight: number;
    description?: string;
    idSpecie: number;
}

export type ResponseHookTypeService = CommonHttpResponse<HookType>
