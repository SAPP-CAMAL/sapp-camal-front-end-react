import { http } from "@/lib/ky";
import {
    CreateCorralGroupBody,
    CreateCorralGroupDetailBody,
    ResponseCorralGroupDetailsAll,
    ResponseCorralGroupsAll,
    ResponseCorralsAll,
    ResponseFinishTypesAll,
    ResponseLinesAll,
} from "@/features/corral-group/domain/corral-group-admin.domain";

export function getCorralGroupsAdminService(): Promise<ResponseCorralGroupsAll> {
    return http.get("v1/1.0.0/corral-group/all").json();
}

export function createCorralGroupService(body: CreateCorralGroupBody) {
    return http.post("v1/1.0.0/corral-group", { json: body }).json();
}

export function updateCorralGroupService(id: number, body: Partial<CreateCorralGroupBody>) {
    return http.patch(`v1/1.0.0/corral-group/${id}`, { json: body }).json();
}

export function deleteCorralGroupService(id: number) {
    return http.delete(`v1/1.0.0/corral-group/${id}`).json();
}

export function getCorralGroupDetailsAdminService(): Promise<ResponseCorralGroupDetailsAll> {
    return http.get("v1/1.0.0/corral-group-detail/all").json();
}

export function createCorralGroupDetailService(body: CreateCorralGroupDetailBody) {
    return http.post("v1/1.0.0/corral-group-detail", { json: body }).json();
}

export function deleteCorralGroupDetailService(id: number) {
    return http.delete(`v1/1.0.0/corral-group-detail/${id}`).json();
}

export function getCorralsAllService(): Promise<ResponseCorralsAll> {
    return http.get("v1/1.0.0/corral/all").json();
}

export function getLinesAllService(): Promise<ResponseLinesAll> {
    return http.get("v1/1.0.0/line/all").json();
}

export function getFinishTypesAllService(): Promise<ResponseFinishTypesAll> {
    return http.get("v1/1.0.0/finish-type/all").json();
}
