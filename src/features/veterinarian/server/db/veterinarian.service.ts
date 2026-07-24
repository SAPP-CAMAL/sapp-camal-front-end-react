import { http } from "@/lib/ky";
import { ResponseVeterinarianService, UpdateVeterinarianBody } from "@/features/veterinarian/domain/veterinarian.domain";

export function getVeterinariansService(): Promise<ResponseVeterinarianService> {
    return http.get("v1/1.0.0/veterinarian/all").json()
}

export function updateVeterinarianService(id: number, body: UpdateVeterinarianBody) {
    return http.patch(`v1/1.0.0/veterinarian/${id}`, { json: body }).json()
}
