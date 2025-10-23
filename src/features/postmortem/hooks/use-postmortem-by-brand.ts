"use client";

import { useQuery } from "@tanstack/react-query";
import { getPostmortemByBrandService } from "../server/db/postmortem.service";

export function usePostmortemByBrand(idSettingCertificateBrands: number | null) {
  return useQuery({
    queryKey: ["postmortem-by-brand", idSettingCertificateBrands],
    queryFn: () => getPostmortemByBrandService(idSettingCertificateBrands!),
    enabled: idSettingCertificateBrands !== null && idSettingCertificateBrands > 0,
    staleTime: 1000 * 60 * 5, // 5 minutos - los datos son los mismos para toda la marca
  });
}
