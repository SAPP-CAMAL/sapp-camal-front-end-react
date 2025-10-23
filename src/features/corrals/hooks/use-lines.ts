"use client";

import { useQuery } from "@tanstack/react-query";
import { getActiveLinesService } from "@/features/postmortem/server/db/line.service";

export function useLines() {
  return useQuery({
    queryKey: ["corrals-lines"],
    queryFn: getActiveLinesService,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}
