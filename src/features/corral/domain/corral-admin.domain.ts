import { CommonHttpResponsePagination } from "@/features/people/domain";

export type CorralAdmin = {
    id: number;
    idCorralType: number;
    name: string;
    description?: string;
    minimumQuantity: number;
    maximumQuantity: number;
    status: boolean;
    corralType?: { id: number; description: string; code: string; status: boolean };
}

export type CreateCorralBody = {
    idCorralType: number;
    name: string;
    description?: string;
    minimumQuantity: number;
    maximumQuantity: number;
    status?: boolean;
}

export type SearchParamsCorral = {
    page?: number;
    limit?: number;
    name?: string;
    idCorralType?: number;
}

export type ResponseCorralsAdminPaginated = CommonHttpResponsePagination<CorralAdmin>
