import { http } from "@/lib/ky";
import type { GetChannelSectionsResponse } from "../../domain/channel-section.types";

export async function getChannelSectionsByTypeService(
  idChannelType: number
): Promise<GetChannelSectionsResponse> {
  return await http
    .get(`v1/1.0.0/config-section-channel/by-channel-type/${idChannelType}`)
    .json<GetChannelSectionsResponse>();
}
