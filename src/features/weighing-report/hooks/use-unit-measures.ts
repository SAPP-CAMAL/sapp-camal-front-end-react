import { useQuery } from "@tanstack/react-query";
import { getUnitMeasures } from "../server";

const UNIT_MEASURES_TAG = "unit-measures";

export function useUnitMeasures() {
  return useQuery({
    queryKey: [UNIT_MEASURES_TAG],
    queryFn: getUnitMeasures,
    staleTime: 1000 * 60 * 30, // 30 minutos
    gcTime: 1000 * 60 * 60, // 1 hora en caché
  });
}
