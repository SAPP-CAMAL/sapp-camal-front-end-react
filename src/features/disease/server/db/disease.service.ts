import { http } from "@/lib/ky";
import { CreateDiseaseBody, ResponseDiseaseService } from "@/features/disease/domain/disease.domain";

export function createDiseaseService(body: CreateDiseaseBody) {
    return http.post("v1/1.0.0/disease", { json: body }).json()
}

export function getDiseasesService(): Promise<ResponseDiseaseService> {
    return http.get("v1/1.0.0/disease/all").json()
}

export function updateDiseaseService(id: number, body: Partial<CreateDiseaseBody>) {
    return http.patch(`v1/1.0.0/disease/${id}`, { json: body }).json()
}

export function deleteDiseaseService(id: number) {
    return http.delete(`v1/1.0.0/disease/${id}`).json()
}
