import { CommonHttpResponse } from "@/features/people/domain";

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