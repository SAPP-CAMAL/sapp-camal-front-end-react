import { CommonHttpResponse } from "@/features/people/domain";
import { http } from "@/lib/ky";
import { ResponseProvinces } from "./provinces.service";

export function getCantonsByProvinceIdService(id: number) {
  return http
    .get(`v1/1.0.0/cantons/province/${id}`)
    .json<CommonHttpResponse<ResponseProvinces>>()
}