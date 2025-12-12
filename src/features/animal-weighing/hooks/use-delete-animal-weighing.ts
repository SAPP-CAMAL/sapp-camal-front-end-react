import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteAnimalWeighing } from "../server/db/animal-weighing.service";
import { toast } from "sonner";

export function useDeleteAnimalWeighing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (idAnimalWeighing: number) => deleteAnimalWeighing(idAnimalWeighing),
    onSuccess: () => {
      toast.success("Pesaje eliminado correctamente");
      queryClient.invalidateQueries({ queryKey: ["animal-weighing"] });
    },
    onError: (error: any) => {
      toast.error("Error al eliminar el pesaje: " + (error.message || "Error desconocido"));
    },
  });
}
