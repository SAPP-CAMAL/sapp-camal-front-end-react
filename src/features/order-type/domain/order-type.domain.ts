import { CommonHttpResponse } from "@/features/people/domain";

export type OrderType = {
    id: number;
    idRol: number;
    status: boolean;
}

export type CreateOrderTypeBody = {
    idRol: number;
}

export type ResponseOrderTypesService = CommonHttpResponse<OrderType>
