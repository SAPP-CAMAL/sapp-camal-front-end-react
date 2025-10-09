import { http } from "@/lib/ky";
import { CreateShippingRequest, FilterCarriers, ResponseCarrierByFilter, ResponseCreateShipping } from "../domain";

export function getCarriersByFilterService(filters: FilterCarriers = {}): Promise<ResponseCarrierByFilter> {
    return http.post("v1/1.0.0/shipping/shipping-by-filter", {
        next: {
            tags: ["shipping"],
        },
        json: filters
    }).json<ResponseCarrierByFilter>()
}

export function createShippingService(body: Omit<CreateShippingRequest[], "id" | "status">): Promise<ResponseCreateShipping> {
    return http.post("v1/1.0.0/shipping", {
        json: body
    }).json<ResponseCreateShipping>()
}

export function updateShippingService(shippingId: number, status: boolean): Promise<ResponseCreateShipping> {
  return http
    .patch(`v1/1.0.0/shipping/${shippingId}?status=${status}`)
    .json();
}