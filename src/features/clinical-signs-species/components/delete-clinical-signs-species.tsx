"use client";

import { Trash2Icon } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/confirmation-dialog";
import { deleteClinicalSignsSpeciesService } from "../server/db/clinical-signs-species.service";
import { ClinicalSignsSpecies } from "../domain/clinical-signs-species.domain";
import { CLINICAL_SIGNS_SPECIES_TAG } from "../constants/clinical-signs-species.constants";

export function DeleteClinicalSignsSpecies({
  clinicalSignsSpecies,
}: {
  clinicalSignsSpecies: ClinicalSignsSpecies;
}) {
  const queryClient = useQueryClient();

  const handleDelete = async () => {
    try {
      await deleteClinicalSignsSpeciesService(clinicalSignsSpecies.id);

      await queryClient.invalidateQueries({
        queryKey: [CLINICAL_SIGNS_SPECIES_TAG],
      });

      toast.success("Especie del signo clínico eliminada exitosamente");
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
