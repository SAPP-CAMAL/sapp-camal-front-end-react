import { http } from "@/lib/ky";
import { CreateSpeciesDiseaseBody, ResponseSpeciesDiseaseService } from "@/features/species-disease/domain/species-disease.domain";

export function createSpeciesDiseaseService(body: CreateSpeciesDiseaseBody) {
    return http.post("v1/1.0.0/species-disease", { json: body }).json()
}

export function getSpeciesDiseasesService(): Promise<ResponseSpeciesDiseaseService> {
    return http.get("v1/1.0.0/species-disease/all").json()
}

export function updateSpeciesDiseaseService(id: number, body: Partial<CreateSpeciesDiseaseBody>) {
    return http.patch(`v1/1.0.0/species-disease/${id}`, { json: body }).json()
}

export function deleteSpeciesDiseaseService(id: number) {
    return http.delete(`v1/1.0.0/species-disease/${id}`).json()
}
