"use client";

import { Trash2Icon } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/confirmation-dialog";
import { deleteBodyPartsService } from "../server/db/body-parts.service";
import { BodyParts } from "../domain/body-parts.domain";
import { BODY_PARTS_TAG } from "../constants/body-parts.constants";

export function DeleteBodyParts({ bodyParts }: { bodyParts: BodyParts }) {
  const queryClient = useQueryClient();

  const handleDelete = async () => {
    try {
      await deleteBodyPartsService(bodyParts.id);

      await queryClient.invalidateQueries({
        queryKey: [BODY_PARTS_TAG],
      });

      toast.success("Parte del cuerpo eliminada exitosamente");
    } catch (error: any) {
      const { data } = await error.response.json();
      toast.error(data);
    }
  };

  return (
    <ConfirmationDialog
      title="¿Estás seguro de que deseas eliminar esta parte del cuerpo?"
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
