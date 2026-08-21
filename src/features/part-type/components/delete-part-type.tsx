"use client";

import { Trash2Icon } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/confirmation-dialog";
import { deletePartTypePermanentlyService } from "../server/db/part-type.service";
import { PartType } from "../domain/part-type.domain";
import { PART_TYPE_TAG } from "../constants/part-type.constants";

export function DeletePartType({ partType }: { partType: PartType }) {
  const queryClient = useQueryClient();

  const handleDelete = async () => {
    try {
      await deletePartTypePermanentlyService(partType.id);

      await queryClient.invalidateQueries({
        queryKey: [PART_TYPE_TAG],
      });

      toast.success("Tipo de parte eliminado exitosamente");
    } catch (error: any) {
      const { data } = await error.response.json();
      toast.error(data);
    }
  };

  return (
    <ConfirmationDialog
      title="¿Estás seguro de que deseas eliminar este tipo de parte?"
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
