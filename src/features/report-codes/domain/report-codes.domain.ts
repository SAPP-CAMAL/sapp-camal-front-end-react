import { CommonHttpResponse } from "@/features/people/domain";

export type ReportCode = {
    id: number;
    code: string;
    status: boolean;
    version: string | null;
}

export type CreateReportCodeBody = {
    code: string;
    version?: string | null;
}

export type ResponseReportCodesService = CommonHttpResponse<ReportCode>
