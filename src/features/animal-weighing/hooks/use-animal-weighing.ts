import { useQuery } from "@tanstack/react-query";
import { getAnimalWeighingByFilters } from "../server/db/animal-weighing.service";
import type { GetAnimalWeighingRequest } from "../domain";

export function useAnimalWeighingByFilters(
  request: GetAnimalWeighingRequest | null
) {
  return useQuery({
    queryKey: ["animal-weighing", request],
    queryFn: () => {
      if (!request) return Promise.resolve({ data: [] });
      return getAnimalWeighingByFilters(request);
    },
    enabled: !!request,
  });
}
