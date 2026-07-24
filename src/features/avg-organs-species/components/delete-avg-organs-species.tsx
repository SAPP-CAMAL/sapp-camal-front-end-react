"use client";

import { Trash2Icon } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/confirmation-dialog";
import { deleteAvgOrgansSpeciesService } from "../server/db/avg-organs-species.service";
import { AvgOrgansSpecies } from "../domain/avg-organs-species.domain";
import { AVG_ORGANS_SPECIES_TAG } from "../constants/avg-organs-species.constants";

export function DeleteAvgOrgansSpecies({
  avgOrgansSpecies,
}: {
  avgOrgansSpecies: AvgOrgansSpecies;
}) {
  const queryClient = useQueryClient();

  const handleDelete = async () => {
    try {
      await deleteAvgOrgansSpeciesService(avgOrgansSpecies.id);

      await queryClient.invalidateQueries({
        queryKey: [AVG_ORGANS_SPECIES_TAG],
      });

      toast.success("Peso promedio eliminado exitosamente");
    } catch (error: any) {
      const { data } = await error.response.json();
      toast.error(data);
    }
  };

  return (
    <ConfirmationDialog
      title="¿Estás seguro de que deseas eliminar este peso promedio?"
      description="Esta acción no se puede deshacer. Esto eliminará permanentemente el registro."
      onConfirm={handleDelete}
      triggerBtn={
        <Button variant="outline">
          <Trash2Icon />
        </Button>
      }
      cancelBtn={<Button variant="outline">Cancelar</Button>}
      confirmBtn={<Button variant="destructive">Eliminar</Button>}
    />
  );
}
