import { CommonHttpResponsePagination } from "@/features/people/domain";

export type Province = {
    id: number;
    code: string;
    name: string;
    status: boolean;
}

export type Canton = {
    id: number;
    code: string;
    name: string;
    status: boolean;
    province?: { id: number; name: string };
}

export type Parish = {
    id: number;
    code: string;
    name: string;
    status: boolean;
    canton?: { id: number; name: string };
}

export type CreateProvinceBody = {
    code: string;
    name: string;
    status?: boolean;
}

export type CreateCantonBody = {
    provinceId: number;
    code: string;
    name: string;
    status?: boolean;
}

export type CreateParishBody = {
    cantonId: number;
    code: string;
    name: string;
    status?: boolean;
}

export type SearchParamsLocation = {
    page?: number;
    limit?: number;
    name?: string;
    status?: string;
}

export type SearchParamsCanton = SearchParamsLocation & { provinceId?: number }
export type SearchParamsParish = SearchParamsLocation & { cantonId?: number }

export type ResponseProvincesAdmin = CommonHttpResponsePagination<Province>
export type ResponseCantonsAdmin = CommonHttpResponsePagination<Canton>
export type ResponseParishesAdmin = CommonHttpResponsePagination<Parish>
