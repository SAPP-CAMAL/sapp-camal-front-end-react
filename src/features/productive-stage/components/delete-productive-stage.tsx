"use client";

import { Trash2Icon } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/confirmation-dialog";
import { deleteProductiveStagePermanentlyService } from "../server/db/productive-stage.service";
import { ProductiveStage } from "../domain";
import { PRODUCTIVE_LIST_TAG } from "../constants";

export function DeleteProductiveStage({
  productiveStage,
}: {
  productiveStage: ProductiveStage;
}) {
  const queryClient = useQueryClient();

  const handleDelete = async () => {
    try {
      await deleteProductiveStagePermanentlyService(productiveStage.id);

      await queryClient.invalidateQueries({
        queryKey: [PRODUCTIVE_LIST_TAG],
      });

      toast.success("Etapa productiva eliminada exitosamente");
    } catch (error: any) {
      const { data } = await error.response.json();
      toast.error(data);
    }
  };

  return (
    <ConfirmationDialog
      title="¿Estás seguro de que deseas eliminar esta etapa productiva?"
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
