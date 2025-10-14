import { CommonHttpResponse } from "@/features/people/domain";
import { http } from "@/lib/ky";
import { ResponseProvinces } from "./provinces.service";

export function getParishesByCantonIdService(id: number) {
    return http.get(`v1/1.0.0/parishes/canton/${id}`)
    .json<CommonHttpResponse<ResponseProvinces>>()
}