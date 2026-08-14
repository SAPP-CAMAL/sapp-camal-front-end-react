import { http } from "@/lib/ky";
import {
    CreateDiseaseGroupBody,
    ResponseDiseaseGroupPaginated,
    ResponseDiseaseGroupService,
    SearchParamsDiseaseGroup,
} from "@/features/disease-group/domain/disease-group.domain";

export function createDiseaseGroupService(body: CreateDiseaseGroupBody) {
    return http.post("v1/1.0.0/disease-group", { json: body }).json()
}

export function getDiseaseGroupsService(): Promise<ResponseDiseaseGroupService> {
    return http.get("v1/1.0.0/disease-group/all").json()
}

export function getDiseaseGroupsPaginatedService(searchParams: SearchParamsDiseaseGroup): Promise<ResponseDiseaseGroupPaginated> {
    return http.get("v1/1.0.0/disease-group/list", { searchParams }).json()
}

export function updateDiseaseGroupService(id: number, body: Partial<CreateDiseaseGroupBody>) {
    return http.patch(`v1/1.0.0/disease-group/${id}`, { json: body }).json()
}

export function deleteDiseaseGroupService(id: number) {
    return http.delete(`v1/1.0.0/disease-group/${id}`).json()
}
