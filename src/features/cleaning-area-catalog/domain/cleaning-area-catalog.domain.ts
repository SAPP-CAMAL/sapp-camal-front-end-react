import { CommonHttpResponse, CommonHttpResponsePagination } from "@/features/people/domain";

export type CleaningAreaCatalog = {
    id: number;
    name: string;
    description?: string | null;
    orderIndex?: number | null;
    status: boolean;
}

export type CreateCleaningAreaCatalogBody = {
    name: string;
    description?: string | null;
    orderIndex?: number | null;
    status?: boolean;
}

export type SearchParamsCleaningAreaCatalog = {
    page?: number;
    limit?: number;
    name?: string;
    status?: boolean;
}

export type ResponseCleaningAreaCatalogService = CommonHttpResponse<CleaningAreaCatalog>
export type ResponseCleaningAreaCatalogPaginated = CommonHttpResponsePagination<CleaningAreaCatalog>
