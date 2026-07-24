import { CommonHttpResponseSingle } from "@/features/people/domain";

export type ObservationAdmin = {
    id: number;
    name: string;
    status: boolean;
}

export type CreateObservationBody = {
    name: string;
    status?: boolean;
}

export type ResponseObservationsAdminAll = CommonHttpResponseSingle<ObservationAdmin[]>
