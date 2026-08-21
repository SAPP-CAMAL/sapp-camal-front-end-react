import { http } from "@/lib/ky";
import { ResponseRolePermissions, TogglePermissionBody } from "@/features/permissions/domain/permissions.domain";

export function getRolePermissionsService(roleId: number): Promise<ResponseRolePermissions> {
    return http.get(`v1/1.0.0/administration/security/permissions/role/${roleId}`).json()
}

export function togglePermissionService(body: TogglePermissionBody) {
    return http.post("v1/1.0.0/administration/security/permissions/toggle", { json: body }).json()
}
