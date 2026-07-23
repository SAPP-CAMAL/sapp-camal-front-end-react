import { CommonHttpResponsePagination, CommonHttpResponseSingle } from "@/features/people/domain";

export type CatalogueType = {
    id: number;
    code: string;
    description: string;
    status: boolean;
}

export type CreateCatalogueTypeBody = {
    code: string;
    description: string;
    status?: boolean;
}

export type CatalogueValue = {
    id: number;
    code: string;
    name: string;
    description: string;
    catalogueTypeId: number;
    parentId: number | null;
    status: boolean;
}

export type CreateCatalogueValueBody = {
    catalogueTypeId: number;
    code: string;
    name: string;
    description: string;
    parentId?: number | null;
    status?: boolean;
}

export type SearchParamsCatalogueValue = {
    page?: number;
    limit?: number;
    name?: string;
    catalogueTypeId?: number;
    status?: string;
}

export type ResponseCatalogueTypesAll = CommonHttpResponseSingle<CatalogueType[]>
export type ResponseCatalogueValues = CommonHttpResponsePagination<CatalogueValue>
