import { http } from "@/lib/ky";
import { ResponseMenu } from "@/features/menus/domain/menus.domain";

export function getStructureMenuByModule(moduleId: number): Promise<ResponseMenu> {
    return http.get(`v1/1.0.0/administration/menu/new/module/${moduleId}`).json<ResponseMenu>()
}