import { useQuery } from "@tanstack/react-query";
import { getAnimalWeighingByFilters } from "../server/db/animal-weighing.service";
import type { GetAnimalWeighingRequest, GetAnimalWeighingResponse } from "../domain";

export function useAnimalWeighingByFilters(
  request: GetAnimalWeighingRequest | null
) {
  return useQuery<GetAnimalWeighingResponse>({
    queryKey: ["animal-weighing", request],
    queryFn: () => {
      if (!request) {
        return Promise.resolve({
          code: 200,
          message: "OK",
          data: { ingressEmergency: [], ingressNormal: [] },
        });
      }
      return getAnimalWeighingByFilters(request);
    },
    enabled: !!request && !!request.idSpecie && !!request.idWeighingStage,
  });
}
