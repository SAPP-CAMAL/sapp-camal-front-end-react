import { http } from "@/lib/ky";
import { CreateRoleBody, ResponseRolesService, SearchParamsRole } from "@/features/roles/domain/roles.domain";

export function createRoleService(body: CreateRoleBody) {
    return http.post("v1/1.0.0/roles", { json: body }).json()
}

export function getRolesService(searchParams: SearchParamsRole): Promise<ResponseRolesService> {
    return http.get("v1/1.0.0/roles", { searchParams }).json()
}

export function updateRoleService(roleId: number, body: Partial<CreateRoleBody>) {
    return http.patch(`v1/1.0.0/roles/${roleId}`, { json: body }).json()
}

export function deleteRoleService(roleId: number) {
    return http.delete(`v1/1.0.0/roles/${roleId}`).json()
}