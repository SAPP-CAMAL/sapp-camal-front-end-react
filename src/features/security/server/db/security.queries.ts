import { http } from "@/lib/ky";
import { BodyIntroducersSearch, CreateBrandsRequest, FilterUserPerson, ResetPasswordRequest, ResponseCreateIntroducerBrandService, ResponseIntroducersSearchService, ResponseSpecieSearchService, ResponseUserPersonSearchService, UpdateBrandRequest, UpdateUserRequest, UserResponse, UserSetRoleResponse } from "../../domain";
import { Role } from "@/features/roles/domain/roles.domain";
import { CommonHttpResponse, CommonHttpResponseSingle } from "@/features/people/domain";

export function getIntroducersService(body: Partial<BodyIntroducersSearch>): Promise<ResponseIntroducersSearchService> {
    return http.post("v1/1.0.0/introducers/search", { json: body }).json()
}

export function getAllSpecie(): Promise<ResponseSpecieSearchService> {
    return http.get("v1/1.0.0/specie/all", {
    }).json<ResponseSpecieSearchService>()
}

export function createBrandService(body: Omit<CreateBrandsRequest, "id" | "status">): Promise<ResponseCreateIntroducerBrandService> {
    return http.post("v1/1.0.0/brands", {
        json: body
    }).json<ResponseCreateIntroducerBrandService>()
}


export function getUserPersonByFilterService(filters: FilterUserPerson = {}): Promise<ResponseUserPersonSearchService> {
    return http.post("v1/1.0.0/users/find-user-person", {
        json: filters
    }).json<ResponseUserPersonSearchService>()
}

export function updateUserService(userId: number, body: Partial<UpdateUserRequest>): Promise<UserResponse> {
    return http.patch(`v1/1.0.0/users/${userId}`,
        { json: body }
    ).json()
}

export function updateBrandService(brandId: number, body: Partial<UpdateBrandRequest>): Promise<ResponseCreateIntroducerBrandService> {
    return http.patch(`v1/1.0.0/brands/${brandId}`,
        { json: body }
    ).json<ResponseCreateIntroducerBrandService>()
}

export function getUserRolesService(): Promise<CommonHttpResponse<Role>> {
    return http.get("v1/1.0.0/users/roles").json()
}


export function setUserRoleService(roleId: number): Promise<CommonHttpResponseSingle<UserSetRoleResponse>> {
    return http.get(`v1/1.0.0/users/set-role/${roleId}`).json()
}

export function forgotPasswordService(email: string) {
    return http.post("v1/1.0.0/users/forgot-password", {
        json: {
            email
        }
    })
}

export function resetPasswordService(body: ResetPasswordRequest) {
    return http.post("v1/1.0.0/users/reset-password", {
        json: body
    })
}