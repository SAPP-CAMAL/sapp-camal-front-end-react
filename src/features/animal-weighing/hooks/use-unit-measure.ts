import { useQuery } from "@tanstack/react-query";
import { getUnitMeasureService } from "../server/db/unit-measure.service";

export function useUnitMeasure() {
  return useQuery({
    queryKey: ["unit-measure"],
    queryFn: () => getUnitMeasureService(),
    staleTime: Infinity, // Los datos nunca cambian, mantenerlos en caché
    gcTime: Infinity, // No eliminar del caché
  });
}
