import { CommonHttpResponse, CommonHttpResponsePagination } from "@/features/people/domain";
import { VisitorCompany, VisitorLogFilterBody, VisitorLogFilterResponse } from "../../domain";
import { http } from "@/lib/ky";

export function getVisitorLogByFilterService(body: VisitorLogFilterBody) {
    return http
        .post("v1/1.0.0/visitor-log/shipping-by-filter", {
            json: body
        })
        .json<CommonHttpResponsePagination<VisitorLogFilterResponse>>();
}


export function getAllVisitorCompanies() {
    return http
           .get("v1/1.0.0/visitor-company/all-active")        
           .json<CommonHttpResponse<VisitorCompany>>();
}