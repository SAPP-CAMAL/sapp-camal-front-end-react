import { CommonHttpResponse, CommonHttpResponsePagination } from "@/features/people/domain";

export type ReportCode = {
    id: number;
    code: string;
    status: boolean;
    version: string | null;
}

export type CreateReportCodeBody = {
    code: string;
    version?: string | null;
    status?: boolean;
}

export type SearchParamsReportCodes = {
    page?: number;
    limit?: number;
    code?: string;
    status?: boolean;
}

export type ResponseReportCodesService = CommonHttpResponse<ReportCode>
export type ResponseReportCodesPaginated = CommonHttpResponsePagination<ReportCode>
