import { useQuery } from "@tanstack/react-query";
import { getChannelTypesService } from "../server/db/channel-type.service";

const CHANNEL_TYPES_TAG = "channel-types";

export function useChannelTypes() {
  return useQuery({
    queryKey: [CHANNEL_TYPES_TAG, "all-active"],
    queryFn: getChannelTypesService,
    staleTime: 1000 * 60 * 60, // 1 hora - datos raramente cambian
    gcTime: 1000 * 60 * 60 * 2, // 2 horas en caché
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}
