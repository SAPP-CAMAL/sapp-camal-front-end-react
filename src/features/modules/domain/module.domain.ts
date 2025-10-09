import { Menu } from "@/features/menus/domain/menus.domain";
import { CommonHttpResponse, CommonHttpResponsePagination } from "@/features/people/domain";

type Module = {
    id: number;
    name: string;
    description: string;
    status: boolean;
}

export type ResponseModule = CommonHttpResponsePagination<Module>

export type ResponseModuleWithMenus = (Module & {
    menus: Menu[]
})[]

export type AdministrationMenu = {
    id: number;
    menuName: string;
    url: null;
    icon: null;
    sequence: number;
    children: Child[];
}

type Child = {
    id: number;
    menuName: string;
    url: null;
    icon: null;
    sequence: number;
    permissions: string[];
}

export type ResponseMenuService = CommonHttpResponse<AdministrationMenu>
