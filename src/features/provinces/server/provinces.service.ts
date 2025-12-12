import { CommonHttpResponse } from "@/features/people/domain";
import { http } from "@/lib/ky";

export interface ResponseProvinces {
    id:     number;
    code:   string;
    name:   string;
    status: boolean;
}

export function getProvinces() {
    return http.get("v1/1.0.0/provinces").json<CommonHttpResponse<ResponseProvinces>>()
}