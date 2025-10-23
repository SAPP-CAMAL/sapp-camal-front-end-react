"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { savePostmortemService, updatePostmortemService } from "../server/db/postmortem.service";
import type { SavePostmortemRequest } from "../domain/save-postmortem.types";

export function useSavePostmortem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: SavePostmortemRequest) =>
      savePostmortemService(request),
    onSuccess: () => {
      // Invalidar queries para recargar datos
      queryClient.invalidateQueries({ queryKey: ["postmortem-by-brand"] });
      queryClient.invalidateQueries({ queryKey: ["postmortem-by-filters"] });
      queryClient.invalidateQueries({ queryKey: ["animals-by-brand"] });
    },
  });
}

export function useUpdatePostmortem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, request }: { id: number; request: Omit<SavePostmortemRequest, "idDetailsSpeciesCertificate"> }) =>
      updatePostmortemService(id, request),
    onSuccess: () => {
      // Invalidar queries para recargar datos
      queryClient.invalidateQueries({ queryKey: ["postmortem-by-brand"] });
      queryClient.invalidateQueries({ queryKey: ["postmortem-by-filters"] });
      queryClient.invalidateQueries({ queryKey: ["animals-by-brand"] });
    },
  });
}
