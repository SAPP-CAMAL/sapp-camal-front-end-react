import { http } from "@/lib/ky";
import { CreateModuleBody, ResponseModule, SearchParamsModule } from "@/features/modules/domain/module.domain";

export function getModulesService(searchParams: SearchParamsModule): Promise<ResponseModule> {
    return http.get("v1/1.0.0/administration/module", { searchParams }).json()
}

export function createModuleService(body: CreateModuleBody) {
    return http.post("v1/1.0.0/administration/module", { json: body }).json()
}

export function updateModuleService(moduleId: number, body: Partial<CreateModuleBody>) {
    return http.patch(`v1/1.0.0/administration/module/${moduleId}`, { json: body }).json()
}

export function deleteModuleService(moduleId: number) {
    return http.delete(`v1/1.0.0/administration/module/${moduleId}`).json()
}
