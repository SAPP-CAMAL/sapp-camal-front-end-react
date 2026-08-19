"use client";

import { Trash2Icon } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/confirmation-dialog";
import { deleteDiseaseGroupPermanentlyService } from "../server/db/disease-group.service";
import { DiseaseGroup } from "../domain/disease-group.domain";
import { DISEASE_GROUP_TAG } from "../constants/disease-group.constants";

export function DeleteDiseaseGroup({
  diseaseGroup,
}: {
  diseaseGroup: DiseaseGroup;
}) {
  const queryClient = useQueryClient();

  const handleDelete = async () => {
    try {
      await deleteDiseaseGroupPermanentlyService(diseaseGroup.id);

      await queryClient.invalidateQueries({
        queryKey: [DISEASE_GROUP_TAG],
      });

      toast.success("Grupo de enfermedad eliminado exitosamente");
    } catch (error: any) {
      const { data } = await error.response.json();
      toast.error(data);
    }
  };

  return (
    <ConfirmationDialog
      title="¿Estás seguro de que deseas eliminar este grupo de enfermedad?"
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
