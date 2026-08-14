import { CommonHttpResponse, CommonHttpResponsePagination } from "@/features/people/domain";

export type DistributionProduct = {
    id: number;
    idShipping: number;
    idIntroducer: number;
    idOrigin: number;
    startTime: string;
    endTime?: string | null;
    withLoad: boolean;
    detailLoad?: string | null;
    commentary?: string | null;
    status: boolean;
    shipping?: {
        id: number;
        vehicleId: number;
        personId: number;
        status: boolean;
    };
    introducer?: {
        id: number;
        userId: number;
        status: boolean;
    };
    origin?: {
        id: number;
        name: string;
        status: boolean;
    };
}

export type DetailDistribution = {
    id: number;
    idDistributionProduct: number;
    idProduct: number;
    quantity: number;
    adressee?: string | null;
    status: boolean;
}

export type Product = {
    id: number;
    description: string;
    status: boolean;
    parentId?: number | null;
}

export type CreateDistributionProductBody = {
    idShipping: number;
    idIntroducer: number;
    idOrigin: number;
    startTime: string;
    endTime?: string | null;
    withLoad: boolean;
    detailLoad?: string | null;
    commentary?: string | null;
}

export type CreateDetailDistributionBody = {
    idDistributionProduct: number;
    idProduct: number;
    quantity: number;
    adressee?: string | null;
}

export type SearchParamsDistributionProduct = {
    page?: number;
    limit?: number;
    status?: boolean;
}

export type ResponseDistributionProductsService = CommonHttpResponse<DistributionProduct>
export type ResponseDistributionProductsPaginated = CommonHttpResponsePagination<DistributionProduct>
export type ResponseDetailDistributionsService = CommonHttpResponse<DetailDistribution>
export type ResponseProductsService = CommonHttpResponse<Product>
