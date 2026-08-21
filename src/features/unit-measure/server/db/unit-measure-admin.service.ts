import { http } from "@/lib/ky";
import {
    CreateUnitMeasureBody,
    ResponseUnitMeasuresAdminAll,
    ResponseUnitMeasuresPaginated,
    SearchParamsUnitMeasure,
} from "@/features/unit-measure/domain/unit-measure-admin.domain";

export function getUnitMeasuresAdminService(): Promise<ResponseUnitMeasuresAdminAll> {
    return http.get("v1/1.0.0/unit-measure/all").json();
}

export function getUnitMeasuresPaginatedService(searchParams: SearchParamsUnitMeasure): Promise<ResponseUnitMeasuresPaginated> {
    return http.get("v1/1.0.0/unit-measure/list", { searchParams }).json();
}

export function createUnitMeasureService(body: CreateUnitMeasureBody) {
    return http.post("v1/1.0.0/unit-measure", { json: body }).json();
}

export function updateUnitMeasureService(id: number, body: Partial<CreateUnitMeasureBody>) {
    return http.patch(`v1/1.0.0/unit-measure/${id}`, { json: body }).json();
}

export function deleteUnitMeasureService(id: number) {
    return http.delete(`v1/1.0.0/unit-measure/${id}`).json();
}

export function deleteUnitMeasurePermanentlyService(id: number) {
    return http.delete(`v1/1.0.0/unit-measure/${id}/permanent`).json();
}
