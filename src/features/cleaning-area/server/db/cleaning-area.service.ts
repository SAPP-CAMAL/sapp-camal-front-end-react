import { http } from "@/lib/ky";
import {
    CreateCleaningAreaBody,
    CreateCleaningAreaStructureBody,
    ResponseCleaningAreasByLineService,
} from "@/features/cleaning-area/domain/cleaning-area.domain";

export function getCleaningAreasByLineService(idLine: number): Promise<ResponseCleaningAreasByLineService> {
    const searchParams = new URLSearchParams();
    searchParams.append("idLine", idLine.toString());

    return http.get("v1/1.0.0/cleaning-area-structure/by-line", { searchParams }).json()
}

export function createCleaningAreaService(body: CreateCleaningAreaBody) {
    return http.post("v1/1.0.0/cleaning-area", { json: body }).json()
}

export function deleteCleaningAreaService(id: number) {
    return http.delete(`v1/1.0.0/cleaning-area/${id}`).json()
}

export function createCleaningAreaStructureService(body: CreateCleaningAreaStructureBody) {
    return http.post("v1/1.0.0/cleaning-area-structure", { json: body }).json()
}

export function deleteCleaningAreaStructureService(id: number) {
    return http.delete(`v1/1.0.0/cleaning-area-structure/${id}`).json()
}
