import { http } from "@/lib/ky";
import { ResponseDaysSearchAllService, ResponseLineSearchAllService } from "../../domain";

export function getLineService(): Promise<ResponseLineSearchAllService> {
    return http.get("v1/1.0.0/line/all").json()
}

export function getDaysService(): Promise<ResponseDaysSearchAllService> {
    return http.get("v1/1.0.0/days/all").json()
}