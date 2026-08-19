import { CommonHttpResponsePagination, CommonHttpResponseSingle } from "@/features/people/domain";

export type ObservationAdmin = {
    id: number;
    name: string;
    status: boolean;
}

export type CreateObservationBody = {
    name: string;
    status?: boolean;
}

export type SearchParamsObservation = {
    page?: number;
    limit?: number;
    name?: string;
    status?: boolean;
}

export type ResponseObservationsAdminAll = CommonHttpResponseSingle<ObservationAdmin[]>
export type ResponseObservationsPaginated = CommonHttpResponsePagination<ObservationAdmin>
