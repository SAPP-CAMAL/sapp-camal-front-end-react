import { http } from "@/lib/ky";
import type { GetChannelTypesResponse } from "../../domain/channel-type.types";

export async function getChannelTypesService(): Promise<GetChannelTypesResponse> {
  return await http
    .get("v1/1.0.0/channel-type/all-active")
    .json<GetChannelTypesResponse>();
}
