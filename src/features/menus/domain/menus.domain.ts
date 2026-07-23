import { CommonHttpResponse, CommonHttpResponsePagination } from "@/features/people/domain";

export type MenuAdmin = {
    id: number;
    moduleId: number;
    sequence: number;
    menuName: string;
    icon: string | null;
    url: string | null;
    parentId: number | null;
    orderIndex: number | null;
    externalLink: boolean | null;
    status: boolean;
    module?: { id: number; name: string };
}

export type CreateMenuBody = {
    moduleId: number
    sequence: number
    menuName: string
    icon?: string
    url?: string
    parentId?: number | null
    orderIndex?: number
    externalLink?: boolean
    status?: boolean
}

export type SearchParamsMenu = {
    page?: number
    limit?: number
    menuName?: string
    moduleId?: number
    parentId?: number
    status?: string
}

export type ResponseMenuAdmin = CommonHttpResponsePagination<MenuAdmin>

export type Menu = {
    id: number;
    menuName: string;
    url: null;
    icon: null;
    sequence: number;
    assigned: boolean;
    administrationMenuChildren: AdministrationMenuChild[];
}

export type ResponseMenu = CommonHttpResponse<Menu>

type AdministrationMenuChild = {
    id: number;
    menuName: string;
    url: null;
    icon: null;
    sequence: number;
    assigned: boolean;
    permissions: Permission[];
}

type Permission = {
    id: number;
    name: string;
    code: string;
    assigned: boolean;
}