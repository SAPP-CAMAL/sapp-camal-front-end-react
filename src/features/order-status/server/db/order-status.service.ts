import { http } from "@/lib/ky";
import {
    CreateOrderStatusBody,
    ResponseOrderStatusAll,
} from "@/features/order-status/domain/order-status.domain";

export function getOrderStatusAllService(): Promise<ResponseOrderStatusAll> {
    return http.get("v1/1.0.0/order-status/all").json();
}

export function createOrderStatusService(body: CreateOrderStatusBody) {
    return http.post("v1/1.0.0/order-status", { json: body }).json();
}

export function updateOrderStatusService(id: number, body: Partial<CreateOrderStatusBody>) {
    return http.patch(`v1/1.0.0/order-status/${id}`, { json: body }).json();
}

export function deleteOrderStatusService(id: number) {
    return http.delete(`v1/1.0.0/order-status/${id}`).json();
}
