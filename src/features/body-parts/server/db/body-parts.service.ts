import { http } from "@/lib/ky";
import { CreateBodyPartsBody, ResponseBodyPartsService } from "@/features/body-parts/domain/body-parts.domain";

export function createBodyPartsService(body: CreateBodyPartsBody) {
    return http.post("v1/1.0.0/body-parts", { json: body }).json()
}

export function getBodyPartsService(): Promise<ResponseBodyPartsService> {
    return http.get("v1/1.0.0/body-parts/all").json()
}

export function updateBodyPartsService(id: number, body: Partial<CreateBodyPartsBody>) {
    return http.patch(`v1/1.0.0/body-parts/${id}`, { json: body }).json()
}

export function deleteBodyPartsService(id: number) {
    return http.delete(`v1/1.0.0/body-parts/${id}`).json()
}
