"use client";

import { useQuery } from "@tanstack/react-query";
import { getPostmortemByFiltersService } from "../server/db/postmortem.service";
import type { GetPostmortemByFiltersRequest } from "../domain/save-postmortem.types";

export function usePostmortemByFilters(request: GetPostmortemByFiltersRequest | null) {
  return useQuery({
    queryKey: ["postmortem-by-filters", request],
    queryFn: () => getPostmortemByFiltersService(request!),
    enabled: request !== null && !!request.slaughterDate && request.idSpecies > 0,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}
