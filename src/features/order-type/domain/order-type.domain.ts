import { CommonHttpResponse, CommonHttpResponsePagination } from "@/features/people/domain";

export type OrderType = {
    id: number;
    idRol: number;
    status: boolean;
}

export type CreateOrderTypeBody = {
    idRol: number;
}

export type SearchParamsOrderType = {
    page?: number;
    limit?: number;
    idRol?: number;
    status?: boolean;
}

export type ResponseOrderTypesService = CommonHttpResponse<OrderType>
export type ResponseOrderTypesPaginated = CommonHttpResponsePagination<OrderType>
