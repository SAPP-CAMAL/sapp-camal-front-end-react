import { CommonHttpResponse, CommonHttpResponsePagination, CommonHttpResponseSingle, Person } from "@/features/people/domain";

export type LoginBody = {
    identifier: string;
    password: string;
    roleId?: number;
    sessionUuid?: string;
    deviceFingerprint?: string;
}

export type LoginResponse = {
    accessToken: string;
    refreshToken: string;
    tokenType: string;
    expiresIn: number;
    sessionUuid: string;
    user: User;
    activeRole: ActiveRole;
}

export type ResponseLoginService = CommonHttpResponseSingle<LoginResponse>

export type ResponseLogoutService = CommonHttpResponse<{ message: string }>

export type ResponseRefreshTokenService = CommonHttpResponseSingle<{ accessToken: string }>

type ActiveRole = {
    id: number;
    userRoleId: number;
    name: string;
    description: string;
    isLogin: boolean;
    status: boolean;
}

type User = {
    id: number;
    userName: string;
    email: string;
    fullName: string;
}

export type UserPerson = {
    id: number;
    userName: string;
    email: string;
    fullName: string;
    state?: string;
    personId?: number;
    identification?: string;
}


export type ResponseIntroducersSearchService = CommonHttpResponsePagination<Introducer>
export type ResponseUserPersonSearchService = CommonHttpResponse<UserPerson>

export type BodyIntroducersSearch = {
    fullName: string;
    identification: string;
    brandName: string;
    species: string[];
    status: boolean;
    page: number;
    limit: number;
}

export type Introducer = {
    id: number;
    fullName: string;
    email: string;
    identification: string;
    status: boolean;
    userId: number;
    brands: Brand[];
}

export type Brand = {
    id: number;
    name: string;
    description: string;
    status: boolean;
    species: string[];
}

export type ResponseSpecieSearchService = CommonHttpResponsePagination<Specie>
export interface Specie {
    id: number;
    name?: string;
    descriptio?: string;
    status: boolean;
}

export type ResponseCreateIntroducerBrandService = {
    code: number
    message: string
    data: IntroducerBrand
}
export interface CreateBrandsRequest {
    introducerId: number;
    name: string;
    description: string;
    speciesIds: number[];
}

export interface IntroducerBrand {
    id: number;
    name: string;
    description: string;
    introducerId: number;
    state: string;
    species: SpeciesBrand[];
}

export interface SpeciesBrand {
    id: number;
    brandSpecieId: number;
    name: string;
    state: string;
}

export type FilterUserPerson = {
    fullName?: string;
    identification?: string;
}

export interface UserResponse {
    id: number;
    personId: number;
    fullName: string;
    email: string;
    userName: string;
    state: string;
    roles: Role[];
}

export interface UpdateUserRequest {
    email: string;
    userName: string;
    status: boolean;
    roles: Role[];
}

type Role = {
    id?: number,
    status?: boolean
}

export interface UpdateBrandRequest {
    name: string;
    description: string;
    species: { id: number, status: boolean }[];
    introducerId?: number;
}

export interface Species {
    id: number;
    status: boolean;
}


export interface UserSetRoleResponse {
    accessToken: string;
    refreshToken: string;
    tokenType: string;
    expiresIn: number;
    sessionUuid: string;
    user: User;
    activeRole: ActiveRole;
}


export interface ResetPasswordRequest {
    token: string;
    password: string;
    passwordConfirmation: string;
}


export interface GetUserByIdService {
    id: number;
    personId: number;
    userName: string;
    password: string;
    email: string;
    status: boolean;
    person: Person;
    userRoles: any[];
    introducer: IntroducerGetUser;
}

interface IntroducerGetUser {
    id: number;
    userId: number;
    status: boolean;
    brands: any[];
}
