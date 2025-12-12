"use client";

import { useQuery } from "@tanstack/react-query";
import { getProductAnatomicalLocationsService } from "../server/db/product-anatomical-locations.service";

export function useProductAnatomicalLocations(idProduct: number | null) {
  const enabled = idProduct !== null && idProduct > 0;

  return useQuery({
    queryKey: ["product-anatomical-locations", idProduct],
    queryFn: () => getProductAnatomicalLocationsService(idProduct!),
    enabled,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}
