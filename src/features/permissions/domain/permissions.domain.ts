import { CommonHttpResponseSingle } from "@/features/people/domain";

export type RolePermissionMenuItem = {
    menuId: number;
    menuName: string;
    url: string | null;
    icon: string | null;
    assigned: boolean;
}

export type RolePermissionModule = {
    moduleId: number;
    moduleName: string;
    menus: RolePermissionMenuItem[];
}

export type TogglePermissionBody = {
    roleId: number;
    menuId: number;
    assigned: boolean;
}

export type ResponseRolePermissions = CommonHttpResponseSingle<RolePermissionModule[]>
