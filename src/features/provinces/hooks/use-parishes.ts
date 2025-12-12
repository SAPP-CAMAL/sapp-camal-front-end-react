import { useQuery } from "@tanstack/react-query";
import { getParishesByCantonIdService } from "../server/parishes.service";

export function useParishesByCantonId(cantonId?: number) {
  return useQuery({
    queryKey: ["parishes", cantonId],
    queryFn: () => getParishesByCantonIdService(cantonId as number),
    enabled: !!cantonId, 
  });
}
