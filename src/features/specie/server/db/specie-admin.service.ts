import { http } from "@/lib/ky";
import { CreateSpecieBody, ResponseSpeciesAdmin } from "@/features/specie/domain";

export function getSpeciesAdminService(): Promise<ResponseSpeciesAdmin> {
    return http.get("v1/1.0.0/specie/admin").json();
}

export function createSpecieService(body: CreateSpecieBody) {
    return http.post("v1/1.0.0/specie", { json: body }).json();
}

export function updateSpecieService(id: number, body: Partial<CreateSpecieBody>) {
    return http.patch(`v1/1.0.0/specie/${id}`, { json: body }).json();
}

export function deleteSpecieService(id: number) {
    return http.delete(`v1/1.0.0/specie/${id}`).json();
}
