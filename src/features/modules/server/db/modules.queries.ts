import { http } from "@/lib/ky";
import { ResponseMenuService, ResponseModule, ResponseModuleWithMenus } from "@/features/modules/domain/module.domain";
import { getStructureMenuByModule } from "@/features/menus/server/db/menus.queries";
import { Menu } from "@/features/menus/domain/menus.domain";
import { ssrGetJson } from "@/lib/ky-ssr";

export async function getModulesWithMenusService(): Promise<ResponseModuleWithMenus> {
    const modules = await http.get("v1/1.0.0/administration/module").json<ResponseModule>()

    const modulesWithMenusPromises = modules.data.items.map(
        async (module) => {
            try {

                const response = await getStructureMenuByModule(module.id)

                return {
                    ...module,
                    menus: response.data
                }

            } catch {

                return {
                    ...module,
                    menus: [] as Menu[]
                }
            }
        }
    )

    return await Promise.all(modulesWithMenusPromises)
}

export async function getAdministrationMenusService() {
    try {
        return await ssrGetJson<ResponseMenuService>("v1/1.0.0/administration/menu")
    } catch (error) {
        console.error("Error fetching administration menus:", error);
        // Retornar estructura vacía en caso de error
        return { 
            code: 500, 
            message: "Error al obtener menús", 
            data: [] 
        } as ResponseMenuService;
    }
}