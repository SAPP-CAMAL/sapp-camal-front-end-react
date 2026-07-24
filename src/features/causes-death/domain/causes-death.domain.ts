import { CommonHttpResponse } from "@/features/people/domain";

export type CauseDeath = {
    id: number;
    name: string;
    status: boolean;
}

export type CreateCauseDeathBody = {
    name: string;
}

export type ResponseCausesDeathService = CommonHttpResponse<CauseDeath>
