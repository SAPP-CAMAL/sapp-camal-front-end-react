import { http } from "@/lib/ky";
import {
    CreateSlaughterhouseBody,
    ResponseSlaughterhouseAll,
    UpdateSlaughterhouseBody,
} from "@/features/slaughterhouse/domain/slaughterhouse.domain";

export function createSlaughterhouseService(body: CreateSlaughterhouseBody) {
    return http.post("v1/1.0.0/slaughterhouse", { json: body }).json();
}

export function getAllSlaughterhouseService(): Promise<ResponseSlaughterhouseAll> {
    return http.get("v1/1.0.0/slaughterhouse/all").json();
}

export function updateSlaughterhouseService(id: number, body: UpdateSlaughterhouseBody) {
    return http.patch(`v1/1.0.0/slaughterhouse/${id}`, { json: body }).json();
}

export function deleteSlaughterhouseService(id: number) {
    return http.delete(`v1/1.0.0/slaughterhouse/${id}`);
}

export function deleteSlaughterhousePermanentlyService(id: number) {
    return http.delete(`v1/1.0.0/slaughterhouse/${id}/permanent`);
}
