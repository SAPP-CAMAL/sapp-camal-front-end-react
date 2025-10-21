"use client";

import { useQuery } from "@tanstack/react-query";
import { getSpeciesDiseaseService } from "../server/db/species-disease.service";

export function useSpeciesDisease(idSpecie: number | null) {
  return useQuery({
    queryKey: ["species-disease", idSpecie],
    queryFn: () => getSpeciesDiseaseService(idSpecie!),
    enabled: idSpecie !== null && idSpecie > 0,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}
