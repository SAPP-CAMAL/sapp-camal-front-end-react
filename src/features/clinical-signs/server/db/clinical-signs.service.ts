import { http } from "@/lib/ky";
import {
    CreateClinicalSignBody,
    ResponseClinicalSignsPaginated,
    ResponseClinicalSignsService,
    SearchParamsClinicalSign,
} from "@/features/clinical-signs/domain/clinical-signs.domain";

export function createClinicalSignService(body: CreateClinicalSignBody) {
    return http.post("v1/1.0.0/clinical-signs", { json: body }).json()
}

export function getClinicalSignsService(): Promise<ResponseClinicalSignsService> {
    return http.get("v1/1.0.0/clinical-signs/all").json()
}

export function getClinicalSignsPaginatedService(searchParams: SearchParamsClinicalSign): Promise<ResponseClinicalSignsPaginated> {
    return http.get("v1/1.0.0/clinical-signs/list", { searchParams }).json()
}

export function updateClinicalSignService(id: number, body: Partial<CreateClinicalSignBody>) {
    return http.patch(`v1/1.0.0/clinical-signs/${id}`, { json: body }).json()
}

export function deleteClinicalSignService(id: number) {
    return http.delete(`v1/1.0.0/clinical-signs/${id}`).json()
}
