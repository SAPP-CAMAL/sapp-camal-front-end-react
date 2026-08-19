import { http } from "@/lib/ky";
import {
    CreateCleaningMaterialBody,
    ResponseCleaningMaterialsAdminAll,
    ResponseCleaningMaterialsPaginated,
    SearchParamsCleaningMaterial,
} from "@/features/cleaning-material/domain/cleaning-material-admin.domain";

export function getCleaningMaterialsAdminService(): Promise<ResponseCleaningMaterialsAdminAll> {
    return http.get("v1/1.0.0/cleaning-material/all").json();
}

export function getCleaningMaterialsPaginatedService(searchParams: SearchParamsCleaningMaterial): Promise<ResponseCleaningMaterialsPaginated> {
    return http.get("v1/1.0.0/cleaning-material/list", { searchParams }).json();
}

export function createCleaningMaterialService(body: CreateCleaningMaterialBody) {
    return http.post("v1/1.0.0/cleaning-material", { json: body }).json();
}

export function updateCleaningMaterialService(id: number, body: Partial<CreateCleaningMaterialBody>) {
    return http.patch(`v1/1.0.0/cleaning-material/${id}`, { json: body }).json();
}

export function deleteCleaningMaterialService(id: number) {
    return http.delete(`v1/1.0.0/cleaning-material/${id}`).json();
}

export function deleteCleaningMaterialPermanentlyService(id: number) {
    return http.delete(`v1/1.0.0/cleaning-material/${id}/permanent`).json();
}
