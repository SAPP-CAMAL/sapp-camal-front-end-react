import { CommonHttpResponseSingle } from "@/features/people/domain";

export type CleaningMethodAdmin = {
    id: number;
    name: string;
    description?: string;
    status: boolean;
}

export type CreateCleaningMethodBody = {
    name: string;
    description?: string;
    status?: boolean;
}

export type ResponseCleaningMethodsAdminAll = CommonHttpResponseSingle<CleaningMethodAdmin[]>
