import { CommonHttpResponse, CommonHttpResponsePagination } from "@/features/people/domain";

export type Product = {
    id: number;
    description: string;
    parentId: number | null;
    productArray: string[] | null;
    productType: boolean;
    code: string | null;
    status: boolean;
}

export type CreateProductBody = {
    description: string;
    parentId?: number;
    productArray?: string[];
    productType: boolean;
    code?: string;
    status?: boolean;
}

export type SearchParamsProduct = {
    page?: number;
    limit?: number;
    name?: string;
    status?: boolean;
}

export type ResponseProductService = CommonHttpResponse<Product>
export type ResponseProductPaginated = CommonHttpResponsePagination<Product>
