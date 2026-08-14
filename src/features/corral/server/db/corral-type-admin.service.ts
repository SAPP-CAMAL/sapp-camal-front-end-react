import { http } from "@/lib/ky";
import { CorralType } from "@/features/corral/domain";
import { CommonHttpResponsePagination, CommonHttpResponseSingle } from "@/features/people/domain";

export type CreateCorralTypeBody = {
    description: string;
    code: string;
    status?: boolean;
}

export type SearchParamsCorralType = {
    page?: number;
    limit?: number;
    description?: string;
    status?: boolean;
}

export type ResponseCorralTypesAll = CommonHttpResponseSingle<CorralType[]>
export type ResponseCorralTypesPaginated = CommonHttpResponsePagination<CorralType>

export function getCorralTypesAdminService(): Promise<ResponseCorralTypesAll> {
    return http.get("v1/1.0.0/corral-type/all").json();
}

export function getCorralTypesPaginatedService(searchParams: SearchParamsCorralType): Promise<ResponseCorralTypesPaginated> {
    return http.get("v1/1.0.0/corral-type/list", { searchParams }).json();
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

export function deleteCorralTypePermanentlyService(id: number) {
    return http.delete(`v1/1.0.0/corral-type/${id}/permanent`).json();
}
