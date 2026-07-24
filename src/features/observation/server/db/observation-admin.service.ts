import { http } from "@/lib/ky";
import {
    CreateObservationBody,
    ResponseObservationsAdminAll,
} from "@/features/observation/domain/observation-admin.domain";

export function getObservationsAdminService(): Promise<ResponseObservationsAdminAll> {
    return http.get("v1/1.0.0/observations/admin").json();
}

export function createObservationService(body: CreateObservationBody) {
    return http.post("v1/1.0.0/observations", { json: body }).json();
}

export function updateObservationService(id: number, body: Partial<CreateObservationBody>) {
    return http.patch(`v1/1.0.0/observations/${id}`, { json: body }).json();
}

export function deleteObservationService(id: number) {
    return http.delete(`v1/1.0.0/observations/${id}`).json();
}
