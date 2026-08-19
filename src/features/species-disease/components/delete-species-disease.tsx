"use client";

import { Trash2Icon } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/confirmation-dialog";
import { deleteSpeciesDiseaseService } from "../server/db/species-disease.service";
import { SpeciesDisease } from "../domain/species-disease.domain";
import { SPECIES_DISEASE_TAG } from "../constants/species-disease.constants";

export function DeleteSpeciesDisease({
  speciesDisease,
}: {
  speciesDisease: SpeciesDisease;
}) {
  const queryClient = useQueryClient();

  const handleDelete = async () => {
    try {
      await deleteSpeciesDiseaseService(speciesDisease.id);

      await queryClient.invalidateQueries({
        queryKey: [SPECIES_DISEASE_TAG],
      });

      toast.success("Especie eliminada exitosamente");
    } catch (error: any) {
      const { data } = await error.response.json();
      toast.error(data);
    }
  };

  return (
    <ConfirmationDialog
      title="¿Estás seguro de que deseas eliminar esta especie?"
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
