import { http } from "@/lib/ky";
import { ResponseMenuService, ResponseModule, ResponseModuleWithMenus } from "@/features/modules/domain/module.domain";
import { getStructureMenuByModule } from "@/features/menus/server/db/menus.queries";
import { Menu } from "@/features/menus/domain/menus.domain";
import { httpSSR } from "@/lib/ky-ssr";

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
    return httpSSR.get("v1/1.0.0/administration/menu").json<ResponseMenuService>()
}