import { CommonHttpResponsePagination, CommonHttpResponseSingle } from "@/features/people/domain";

export type OrderStatus = {
    id: number;
    name: string;
    code: string;
    description: string;
    status: boolean;
};

export type CreateOrderStatusBody = {
    name: string;
    code: string;
    description: string;
    status?: boolean;
};

export type SearchParamsOrderStatus = {
    page?: number;
    limit?: number;
    name?: string;
    status?: boolean;
};

export type ResponseOrderStatusAll = CommonHttpResponseSingle<OrderStatus[]>;
export type ResponseOrderStatusPaginated = CommonHttpResponsePagination<OrderStatus>;
