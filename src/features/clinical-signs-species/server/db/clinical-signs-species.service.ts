import { http } from "@/lib/ky";
import { CreateClinicalSignsSpeciesBody, ResponseClinicalSignsSpeciesService } from "@/features/clinical-signs-species/domain/clinical-signs-species.domain";

export function createClinicalSignsSpeciesService(body: CreateClinicalSignsSpeciesBody) {
    return http.post("v1/1.0.0/clinical-signs-species", { json: body }).json()
}

export function getClinicalSignsSpeciesService(): Promise<ResponseClinicalSignsSpeciesService> {
    return http.get("v1/1.0.0/clinical-signs-species/all").json()
}

export function updateClinicalSignsSpeciesService(id: number, body: Partial<CreateClinicalSignsSpeciesBody>) {
    return http.patch(`v1/1.0.0/clinical-signs-species/${id}`, { json: body }).json()
}

export function deleteClinicalSignsSpeciesService(id: number) {
    return http.delete(`v1/1.0.0/clinical-signs-species/${id}`).json()
}
