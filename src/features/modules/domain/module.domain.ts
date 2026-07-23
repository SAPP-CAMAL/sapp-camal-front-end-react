import { Menu } from "@/features/menus/domain/menus.domain";
import { CommonHttpResponse, CommonHttpResponsePagination } from "@/features/people/domain";

export type Module = {
    id: number;
    name: string;
    description: string;
    status: boolean;
}

export type CreateModuleBody = {
    name: string
    description?: string
    status?: boolean
}

export type SearchParamsModule = {
    page?: number
    limit?: number
    name?: string
    status?: string
}

export type ResponseModule = CommonHttpResponsePagination<Module>

export type ResponseModuleWithMenus = (Module & {
    menus: Menu[]
})[]

export type AdministrationMenu = {
    id: number;
    menuName: string;
    url: string | null;
    icon: string | null;
    sequence: number;
    children: Child[];
}

type Child = {
    id: number;
    menuName: string;
    url: string | null;
    icon: string | null;
    sequence: number;
    permissions: string[];
}

export type ResponseMenuService = CommonHttpResponse<AdministrationMenu>
