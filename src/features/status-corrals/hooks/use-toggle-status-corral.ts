"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { closeCorralByStatusIdService } from "@/features/corrals/server/db/corrals.service";

export function useToggleStatusCorral() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ statusRecordId, close }: { statusRecordId: number; close: boolean }) =>
      closeCorralByStatusIdService(statusRecordId, close),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["status-corrals-daily-admin"] });
    },
  });
}
