import { useQuery } from "@tanstack/react-query";
import { getWeighingStagesService } from "../server/db/weighing-stage.service";

const WEIGHING_STAGES_TAG = "weighing-stages";

export function useWeighingStages() {
  return useQuery({
    queryKey: [WEIGHING_STAGES_TAG, "all-active"],
    queryFn: getWeighingStagesService,
    staleTime: 1000 * 60 * 60, // 1 hora - datos raramente cambian
    gcTime: 1000 * 60 * 60 * 2, // 2 horas en caché
    refetchOnWindowFocus: false, // No refetch al enfocar ventana
    refetchOnMount: false, // No refetch al montar si hay datos en caché
  });
}
