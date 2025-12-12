"use client";

import { useQuery } from "@tanstack/react-query";
import { getAvgOrgansSpeciesService } from "../server/db/avg-organs-species.service";

export function useAvgOrgansSpecies(
  idSpecie: number | null,
  idProduct: number | null
) {
  const enabled =
    idSpecie !== null && idSpecie > 0 && idProduct !== null && idProduct > 0;

  return useQuery({
    queryKey: ["avg-organs-species", idSpecie, idProduct],
    queryFn: () => getAvgOrgansSpeciesService(idSpecie!, idProduct!),
    enabled,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}
