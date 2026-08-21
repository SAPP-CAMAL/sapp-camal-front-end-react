import { CommonHttpResponsePagination, CommonHttpResponseSingle } from "@/features/people/domain";

export type DisinfectantCatalog = {
    id: number;
    name: string;
    description?: string | null;
    status: boolean;
};

export type CreateDisinfectantCatalogBody = {
    name: string;
    description?: string;
    status?: boolean;
};

export type SearchParamsDisinfectantCatalog = {
    page?: number;
    limit?: number;
    name?: string;
    status?: boolean;
};

export type ResponseDisinfectantCatalogAll = CommonHttpResponseSingle<DisinfectantCatalog[]>;
export type ResponseDisinfectantCatalogPaginated = CommonHttpResponsePagination<DisinfectantCatalog>;
