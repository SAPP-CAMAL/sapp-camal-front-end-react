import { CommonHttpResponsePagination } from "@/features/people/domain"

export type CreateRoleBody = {
    name: string
    description: string
}

export type SearchParamsRole = Partial<CreateRoleBody> & {
    page?: number
    limit?: number
    status?: boolean,
    isLogin?: boolean
}

export type Role = {
    id: number,
    name: string,
    description: string | null,
    isLogin: boolean,
    isStaff: boolean,
    status: boolean
}


export type ResponseRolesService = CommonHttpResponsePagination<Role>