"use client";

import { Trash2Icon } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/confirmation-dialog";
import { deleteOpinionService } from "../server/db/opinion.service";
import { Opinion } from "../domain/opinion.domain";
import { OPINION_TAG } from "../constants/opinion.constants";

export function DeleteOpinion({ opinion }: { opinion: Opinion }) {
  const queryClient = useQueryClient();

  const handleDelete = async () => {
    try {
      await deleteOpinionService(opinion.id);

      await queryClient.invalidateQueries({
        queryKey: [OPINION_TAG],
      });

      toast.success("Opinión eliminada exitosamente");
    } catch (error: any) {
      const { data } = await error.response.json();
      toast.error(data);
    }
  };

  return (
    <ConfirmationDialog
      title="¿Estás seguro de que deseas eliminar esta opinión?"
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
