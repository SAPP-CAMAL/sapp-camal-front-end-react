"use client";

import { useQuery } from "@tanstack/react-query";
import { getAnimalsByBrandService } from "@/features/antemortem/server/db/antemortem.service";

export function useAnimalsByBrand(idSettingCertificateBrands: number | null) {
  return useQuery({
    queryKey: ["animals-by-brand", idSettingCertificateBrands],
    queryFn: () => getAnimalsByBrandService(idSettingCertificateBrands!),
    enabled: idSettingCertificateBrands !== null && idSettingCertificateBrands > 0,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}
