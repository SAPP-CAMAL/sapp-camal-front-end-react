import { useQuery } from "@tanstack/react-query";
import { getHookTypesBySpecieService } from "../server/db/hook-type.service";

const HOOK_TYPES_TAG = "hook-types";

export function useHookTypesBySpecie(idSpecie: number | null) {
  return useQuery({
    queryKey: [HOOK_TYPES_TAG, "by-specie", idSpecie],
    queryFn: () => getHookTypesBySpecieService(idSpecie!),
    enabled: idSpecie !== null,
    staleTime: 1000 * 60 * 60, // 1 hora - datos raramente cambian
    gcTime: 1000 * 60 * 60 * 2, // 2 horas en caché
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}
