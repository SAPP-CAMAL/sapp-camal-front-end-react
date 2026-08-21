import { http } from "@/lib/ky";
import { CreateConfigSectionChannelBody, ResponseConfigSectionChannelService } from "@/features/config-section-channel/domain/config-section-channel.domain";

export function createConfigSectionChannelService(body: CreateConfigSectionChannelBody) {
    return http.post("v1/1.0.0/config-section-channel", { json: body }).json()
}

export function getConfigSectionChannelsByChannelTypeService(idChannelType: number): Promise<ResponseConfigSectionChannelService> {
    return http.get(`v1/1.0.0/config-section-channel/by-channel-type/${idChannelType}`).json()
}

export function updateConfigSectionChannelService(id: number, body: Partial<CreateConfigSectionChannelBody>) {
    return http.patch(`v1/1.0.0/config-section-channel/${id}`, { json: body }).json()
}

export function deleteConfigSectionChannelService(id: number) {
    return http.delete(`v1/1.0.0/config-section-channel/${id}`).json()
}
