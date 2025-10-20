import { http } from "@/lib/ky";
import { CreateRoleBody, ResponseRolesService, ResponseRolesServiceAll, SearchParamsRole } from "@/features/roles/domain/roles.domain";

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

export function getAllRolesService(): Promise<ResponseRolesServiceAll> {
    return http.get("v1/1.0.0/roles/all").json()
}

export function getUserRolesService(): Promise<ResponseRolesServiceAll> {
    return http.get("v1/1.0.0/roles/users").json()
}