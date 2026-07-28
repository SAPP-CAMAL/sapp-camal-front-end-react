"use client";

import { Trash2Icon } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/confirmation-dialog";
import { deleteWeighingStagePermanentlyService } from "../server/db/weighing-stage.service";
import { WeighingStage } from "../domain/weighing-stage.domain";
import { WEIGHING_STAGE_TAG } from "../constants/weighing-stage.constants";

export function DeleteWeighingStage({
  weighingStage,
}: {
  weighingStage: WeighingStage;
}) {
  const queryClient = useQueryClient();

  const handleDelete = async () => {
    try {
      await deleteWeighingStagePermanentlyService(weighingStage.id);

      await queryClient.invalidateQueries({
        queryKey: [WEIGHING_STAGE_TAG],
      });

      toast.success("Etapa de pesaje eliminada exitosamente");
    } catch (error: any) {
      const { data } = await error.response.json();
      toast.error(data);
    }
  };

  return (
    <ConfirmationDialog
      title="¿Estás seguro de que deseas eliminar esta etapa de pesaje?"
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
