import { CommonHttpResponse } from "@/features/people/domain";

export type Opinion = {
    id: number;
    name: string;
    code: string;
    status: boolean;
}

export type CreateOpinionBody = {
    name: string;
    code: string;
}

export type ResponseOpinionService = CommonHttpResponse<Opinion>
