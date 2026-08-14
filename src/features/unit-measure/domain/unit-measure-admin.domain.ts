import { CommonHttpResponsePagination, CommonHttpResponseSingle } from "@/features/people/domain";

export type UnitMeasureAdmin = {
    id: number;
    code: string;
    name: string;
    symbol: string;
    description?: string;
    status: boolean;
}

export type CreateUnitMeasureBody = {
    code: string;
    name: string;
    symbol: string;
    description?: string;
    status?: boolean;
}

export type SearchParamsUnitMeasure = {
    page?: number;
    limit?: number;
    name?: string;
    status?: boolean;
}

export type ResponseUnitMeasuresAdminAll = CommonHttpResponseSingle<UnitMeasureAdmin[]>
export type ResponseUnitMeasuresPaginated = CommonHttpResponsePagination<UnitMeasureAdmin>
