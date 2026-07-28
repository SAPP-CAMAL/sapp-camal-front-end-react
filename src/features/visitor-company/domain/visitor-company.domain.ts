import { CommonHttpResponse } from "@/features/people/domain";
import { CompanyType } from "@/features/company-type/domain/company-type.domain";

export type VisitorCompany = {
    id: number;
    ruc: string;
    name: string;
    idCompanyType: number;
    phone: string | null;
    email: string | null;
    address: string | null;
    status: boolean;
    companyType?: CompanyType;
}

export type CreateVisitorCompanyBody = {
    ruc: string;
    name: string;
    idCompanyType: number;
    phone?: string;
    email?: string;
    address?: string;
}

export type ResponseVisitorCompanyService = CommonHttpResponse<VisitorCompany>
