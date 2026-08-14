import { http } from "@/lib/ky";
import {
    CreateCleaningMethodBody,
    ResponseCleaningMethodsAdminAll,
    ResponseCleaningMethodsPaginated,
    SearchParamsCleaningMethod,
} from "@/features/cleaning-method/domain/cleaning-method-admin.domain";

export function getCleaningMethodsAdminService(): Promise<ResponseCleaningMethodsAdminAll> {
    return http.get("v1/1.0.0/cleaning-method/all").json();
}

export function getCleaningMethodsPaginatedService(searchParams: SearchParamsCleaningMethod): Promise<ResponseCleaningMethodsPaginated> {
    return http.get("v1/1.0.0/cleaning-method/list", { searchParams }).json();
}

export function createCleaningMethodService(body: CreateCleaningMethodBody) {
    return http.post("v1/1.0.0/cleaning-method", { json: body }).json();
}

export function updateCleaningMethodService(id: number, body: Partial<CreateCleaningMethodBody>) {
    return http.patch(`v1/1.0.0/cleaning-method/${id}`, { json: body }).json();
}

export function deleteCleaningMethodService(id: number) {
    return http.delete(`v1/1.0.0/cleaning-method/${id}`).json();
}

export function deleteCleaningMethodPermanentlyService(id: number) {
    return http.delete(`v1/1.0.0/cleaning-method/${id}/permanent`).json();
}
