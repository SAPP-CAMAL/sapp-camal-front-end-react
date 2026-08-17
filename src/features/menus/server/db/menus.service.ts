import { http } from "@/lib/ky";
import { CreateMenuBody, ResponseMenuAdmin, SearchParamsMenu } from "@/features/menus/domain/menus.domain";

export function getMenusAdminService(searchParams: SearchParamsMenu): Promise<ResponseMenuAdmin> {
    return http.get("v1/1.0.0/administration/menu/admin", { searchParams }).json()
}

export function createMenuService(body: CreateMenuBody) {
    return http.post("v1/1.0.0/administration/menu", { json: body }).json()
}

export function updateMenuService(menuId: number, body: Partial<CreateMenuBody>) {
    return http.patch(`v1/1.0.0/administration/menu/${menuId}`, { json: body }).json()
}

export function deleteMenuService(menuId: number) {
    return http.delete(`v1/1.0.0/administration/menu/${menuId}`).json()
}

export function deleteMenuPermanentlyService(menuId: number) {
    return http.delete(`v1/1.0.0/administration/menu/${menuId}/permanent`).json()
}
