import { CommonHttpResponse } from "@/features/people/domain";

export type CompanyType = {
    id: number;
    name: string;
    description: string | null;
    status: boolean;
}

export type CreateCompanyTypeBody = {
    name: string;
    description?: string;
}

export type ResponseCompanyTypeService = CommonHttpResponse<CompanyType>
