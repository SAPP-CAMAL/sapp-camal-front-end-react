import { CommonHttpResponse } from "@/features/people/domain";

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
}

export type ResponseCleaningAreaCatalogService = CommonHttpResponse<CleaningAreaCatalog>
