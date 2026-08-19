"use client";

import { useQuery } from "@tanstack/react-query";
import { getStatusCorralsDailyAdminService } from "../server/db/status-corrals.service";

function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function useStatusCorralsDailyAdmin(idLine: number | null) {
  const admissionDate = getTodayDateString();

  return useQuery({
    queryKey: ["status-corrals-daily-admin", idLine, admissionDate],
    queryFn: async () => {
      if (!idLine) return [];
      const response = await getStatusCorralsDailyAdminService(idLine, admissionDate);
      return response ?? [];
    },
    enabled: !!idLine,
  });
}
