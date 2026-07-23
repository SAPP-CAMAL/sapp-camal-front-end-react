import { http } from "@/lib/ky";
import { CreateChannelTypeBody, ResponseChannelTypeService } from "@/features/channel-type/domain/channel-type.domain";

export function createChannelTypeService(body: CreateChannelTypeBody) {
    return http.post("v1/1.0.0/channel-type", { json: body }).json()
}

export function getChannelTypesService(): Promise<ResponseChannelTypeService> {
    return http.get("v1/1.0.0/channel-type/all").json()
}

export function updateChannelTypeService(id: number, body: Partial<CreateChannelTypeBody>) {
    return http.patch(`v1/1.0.0/channel-type/${id}`, { json: body }).json()
}

export function deleteChannelTypeService(id: number) {
    return http.delete(`v1/1.0.0/channel-type/${id}`).json()
}
