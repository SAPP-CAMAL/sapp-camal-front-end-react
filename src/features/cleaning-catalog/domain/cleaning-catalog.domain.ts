import { CommonHttpResponse, CommonHttpResponsePagination } from "@/features/people/domain";

export const CLEANING_CATALOG_TYPES = [
    "ESTRUCTURA",
    "EQUIPO",
    "UTENSILIO",
    "MATERIAL",
] as const;

export type CleaningCatalogType = (typeof CLEANING_CATALOG_TYPES)[number];

export type CleaningCatalog = {
    id: number;
    name: string;
    description?: string | null;
    type?: CleaningCatalogType | string | null;
    status: boolean;
}

export type CreateCleaningCatalogBody = {
    name: string;
    description?: string | null;
    type?: string | null;
}

export type SearchParamsCleaningCatalog = {
    page?: number;
    limit?: number;
    name?: string;
    type?: string;
    status?: boolean;
}

export type ResponseCleaningCatalogService = CommonHttpResponse<CleaningCatalog>
export type ResponseCleaningCatalogPaginated = CommonHttpResponsePagination<CleaningCatalog>
