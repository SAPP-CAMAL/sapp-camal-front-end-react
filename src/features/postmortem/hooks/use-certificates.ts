"use client";

import { useQuery } from "@tanstack/react-query";
import { getCertificatesService } from "../server/db/certificates.service";
import type { GetCertificatesRequest } from "../domain/certificates.types";

export function useCertificates(request: GetCertificatesRequest | null) {
  return useQuery({
    queryKey: ["postmortem-certificates", request],
    queryFn: () => getCertificatesService(request!),
    enabled: request !== null && !!request.slaughterDate && request.idSpecies > 0,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}
