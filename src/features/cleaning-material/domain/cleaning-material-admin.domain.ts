import { CommonHttpResponsePagination, CommonHttpResponseSingle } from "@/features/people/domain";

export type CleaningMaterialAdmin = {
    id: number;
    name: string;
    description?: string;
    status: boolean;
}

export type CreateCleaningMaterialBody = {
    name: string;
    description?: string;
    status?: boolean;
}

export type SearchParamsCleaningMaterial = {
    page?: number;
    limit?: number;
    name?: string;
    status?: boolean;
}

export type ResponseCleaningMaterialsAdminAll = CommonHttpResponseSingle<CleaningMaterialAdmin[]>
export type ResponseCleaningMaterialsPaginated = CommonHttpResponsePagination<CleaningMaterialAdmin>
