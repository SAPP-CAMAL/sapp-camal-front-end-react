import { http } from "@/lib/ky";
import { CreateOrderTypeBody, ResponseOrderTypesService } from "@/features/order-type/domain/order-type.domain";

export function createOrderTypeService(body: CreateOrderTypeBody) {
    return http.post("v1/1.0.0/order-types", { json: body }).json()
}

export function getOrderTypesService(): Promise<ResponseOrderTypesService> {
    return http.get("v1/1.0.0/order-types/all").json()
}

export function deleteOrderTypeService(id: number) {
    return http.delete(`v1/1.0.0/order-types/${id}`).json()
}

export function deleteOrderTypePermanentlyService(id: number) {
    return http.delete(`v1/1.0.0/order-types/${id}/permanent`).json()
}
