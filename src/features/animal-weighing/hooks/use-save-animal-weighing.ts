import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { saveAnimalWeighing } from "../server/db/animal-weighing.service";
import type { SaveAnimalWeighingRequest } from "../domain";

export function useSaveAnimalWeighing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SaveAnimalWeighingRequest) => saveAnimalWeighing(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["animal-weighing"] });
      toast.success("Peso guardado exitosamente");
    },
    onError: () => {
      toast.error("Error al guardar el peso");
    },
  });
}
