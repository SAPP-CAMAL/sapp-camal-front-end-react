import { CommonHttpResponse } from "@/features/people/domain";

export type Veterinarian = {
    id: number;
    code: string;
    idUser: number;
    fullName: string;
    authorizedDistribution: boolean;
    status: boolean;
}

export type UpdateVeterinarianBody = {
    code?: string;
    authorizedDistribution?: boolean;
    status?: boolean;
}

export type ResponseVeterinarianService = CommonHttpResponse<Veterinarian>
