import { useQuery } from "@tanstack/react-query";
import { getChannelSectionsByTypeService } from "../server/db/channel-section.service";

const CHANNEL_SECTIONS_TAG = "channel-sections";

export function useChannelSectionsByType(idChannelType: number | null) {
  return useQuery({
    queryKey: [CHANNEL_SECTIONS_TAG, "by-type", idChannelType],
    queryFn: () => getChannelSectionsByTypeService(idChannelType!),
    enabled: idChannelType !== null,
    staleTime: 1000 * 60 * 60, // 1 hora - datos raramente cambian
    gcTime: 1000 * 60 * 60 * 2, // 2 horas en caché
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}
