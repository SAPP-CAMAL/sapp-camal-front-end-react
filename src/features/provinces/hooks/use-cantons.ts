import { useQuery } from "@tanstack/react-query";
import { getCantonsByProvinceIdService } from "../server/cantons.service";

export function useCantonsByProvinceId(provinceId?: number) {
  return useQuery({
    queryKey: ["parishes", provinceId],
    queryFn: () => getCantonsByProvinceIdService(provinceId as number),
    enabled: !!provinceId, 
  });
}
