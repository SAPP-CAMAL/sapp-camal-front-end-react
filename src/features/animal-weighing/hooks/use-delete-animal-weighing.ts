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
    onError: async (error: any) => {
      try {
        const errorData = await error?.response?.json();
        toast.error(errorData?.data || errorData?.message || "Error al eliminar el pesaje");
      } catch {
        toast.error("Error al eliminar el pesaje");
      }
    },
  });
}
