import { http } from "@/lib/ky";
import {
    CreateAvgOrgansSpeciesBody,
    ResponseAvgOrgansSpeciesPaginated,
    ResponseAvgOrgansSpeciesService,
    SearchParamsAvgOrgansSpecies,
} from "@/features/avg-organs-species/domain/avg-organs-species.domain";

export function createAvgOrgansSpeciesService(body: CreateAvgOrgansSpeciesBody) {
    return http.post("v1/1.0.0/avg-organs-species", { json: body }).json()
}

export function getAvgOrgansSpeciesService(): Promise<ResponseAvgOrgansSpeciesService> {
    return http.get("v1/1.0.0/avg-organs-species/all").json()
}

export function getAvgOrgansSpeciesPaginatedService(searchParams: SearchParamsAvgOrgansSpecies): Promise<ResponseAvgOrgansSpeciesPaginated> {
    return http.get("v1/1.0.0/avg-organs-species/list", { searchParams }).json()
}

export function updateAvgOrgansSpeciesService(id: number, body: Partial<CreateAvgOrgansSpeciesBody>) {
    return http.patch(`v1/1.0.0/avg-organs-species/${id}`, { json: body }).json()
}

export function deleteAvgOrgansSpeciesService(id: number) {
    return http.delete(`v1/1.0.0/avg-organs-species/${id}`).json()
}

export function deleteAvgOrgansSpeciesPermanentlyService(id: number) {
    return http.delete(`v1/1.0.0/avg-organs-species/${id}/permanent`).json()
}
