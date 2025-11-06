import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { updateAnimalWeighing } from "../server/db/animal-weighing.service";
import type { UpdateAnimalWeighingRequest } from "../domain";

export function useUpdateAnimalWeighing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ idAnimalWeighing, data }: { idAnimalWeighing: number; data: UpdateAnimalWeighingRequest }) => 
      updateAnimalWeighing(idAnimalWeighing, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["animal-weighing"] });
      toast.success("Peso actualizado exitosamente");
    },
    onError: () => {
      toast.error("Error al actualizar el peso");
    },
  });
}
