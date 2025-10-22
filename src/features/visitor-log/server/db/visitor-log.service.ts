import { CommonHttpResponse, CommonHttpResponsePagination, CommonHttpResponseSingle } from "@/features/people/domain";
import { CreateVisitorLogBody, VisitorCompany, VisitorLogFilterBody, VisitorLogFilterResponse } from "../../domain";
import { http } from "@/lib/ky";

export function getVisitorLogByFilterService(body: VisitorLogFilterBody) {
    return http
        .post("v1/1.0.0/visitor-log/by-filters", {
            json: body
        })
        .json<CommonHttpResponsePagination<VisitorLogFilterResponse>>();
}


export function getAllVisitorCompanies() {
    return http
        .get("v1/1.0.0/visitor-company/all-active")
        .json<CommonHttpResponse<VisitorCompany>>();
}


export function createVisitorLogService(body: CreateVisitorLogBody) {
    return http
        .post("v1/1.0.0/visitor-log", {
            json: body
        })
        .json<CommonHttpResponseSingle<VisitorLogFilterResponse>>();
}