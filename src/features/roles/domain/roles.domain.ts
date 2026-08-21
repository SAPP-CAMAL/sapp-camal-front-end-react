import { CommonHttpResponsePagination, CommonHttpResponseSingle } from "@/features/people/domain"

export type CreateRoleBody = {
    name: string
    description: string
}

export type UpdateRoleBody = Partial<CreateRoleBody> & {
    status?: boolean
}

export type SearchParamsRole = Partial<CreateRoleBody> & {
    page?: number
    limit?: number
    status?: string,
    isLogin?: string
}

export type Role = {
    id: number,
    name: string,
    code: string,
    description: string | null,
    isLogin: boolean,
    isStaff: boolean,
    status: boolean,
    createdAt?: string
}


export type ResponseRolesService = CommonHttpResponsePagination<Role>
export type ResponseRolesServiceAll = CommonHttpResponseSingle<Role[]>
