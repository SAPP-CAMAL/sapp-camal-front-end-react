import { http } from "@/lib/ky";
import { CorralType } from "@/features/corral/domain";
import { CommonHttpResponseSingle } from "@/features/people/domain";

export type CreateCorralTypeBody = {
    description: string;
    code: string;
    status?: boolean;
}

export type ResponseCorralTypesAll = CommonHttpResponseSingle<CorralType[]>

export function getCorralTypesAdminService(): Promise<ResponseCorralTypesAll> {
    return http.get("v1/1.0.0/corral-type/all").json();
}

export function createCorralTypeService(body: CreateCorralTypeBody) {
    return http.post("v1/1.0.0/corral-type", { json: body }).json();
}

export function updateCorralTypeService(id: number, body: Partial<CreateCorralTypeBody>) {
    return http.patch(`v1/1.0.0/corral-type/${id}`, { json: body }).json();
}

export function deleteCorralTypeService(id: number) {
    return http.delete(`v1/1.0.0/corral-type/${id}`).json();
}
