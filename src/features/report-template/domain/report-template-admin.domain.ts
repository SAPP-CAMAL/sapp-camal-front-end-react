import { CommonHttpResponseSingle } from "@/features/people/domain";

export const REPORT_TYPES = ["EXCEL", "PDF"] as const;
export type ReportType = (typeof REPORT_TYPES)[number];

export const REPORT_ELEMENT_TYPES = [
    "IMAGE",
    "TITLE",
    "SUBTITLE",
    "CODE",
    "LINK",
    "DATE",
    "DAY",
    "RESPONSIBLE",
    "TABLE_HEADER",
    "TABLE_HEADER_GROUP",
] as const;
export type ReportElementType = (typeof REPORT_ELEMENT_TYPES)[number];

export type ReportCodeOption = {
    id: number;
    code: string;
    status: boolean;
}

export type ReportTemplateAdmin = {
    id: number;
    idCode: number;
    name: string;
    description?: string;
    type: ReportType;
    status: boolean;
    code?: { id: number; code: string };
}

export type CreateReportTemplateBody = {
    idCode: number;
    name: string;
    description?: string;
    type?: ReportType;
    status?: boolean;
}

export type ReportSectionAdmin = {
    id: number;
    idTemplate: number;
    sectionName: string;
    orderIndex: number;
    status: boolean;
}

export type CreateReportSectionBody = {
    idTemplate: number;
    sectionName: string;
    orderIndex?: number;
    status?: boolean;
}

export type ReportElementAdmin = {
    id: number;
    idSection: number;
    elementType: ReportElementType;
    key?: string | null;
    label?: string | null;
    width?: number | null;
    height?: number | null;
    url?: string | null;
    positionConfig?: Record<string, unknown> | null;
    styles?: Record<string, unknown> | null;
    orderIndex: number;
    status: boolean;
}

export type CreateReportElementBody = {
    idSection: number;
    elementType: ReportElementType;
    key?: string | null;
    label?: string | null;
    width?: number | null;
    height?: number | null;
    url?: string | null;
    positionConfig?: Record<string, unknown> | null;
    styles?: Record<string, unknown> | null;
    orderIndex?: number;
    status?: boolean;
}

export type ResponseReportTemplatesAll = CommonHttpResponseSingle<ReportTemplateAdmin[]>
export type ResponseReportSectionsAll = CommonHttpResponseSingle<ReportSectionAdmin[]>
export type ResponseReportElementsAll = CommonHttpResponseSingle<ReportElementAdmin[]>
export type ResponseReportCodesAll = CommonHttpResponseSingle<ReportCodeOption[]>
