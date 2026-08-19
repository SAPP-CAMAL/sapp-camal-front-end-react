"use client";

import { Trash2Icon } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/confirmation-dialog";
import { deleteFinishTypePermanentlyService } from "../server/db/finish-type-admin.service";
import { FinishTypeAdmin } from "../domain";

export function DeleteFinishType({ finishType }: { finishType: FinishTypeAdmin }) {
  const queryClient = useQueryClient();

  const handleDelete = async () => {
    try {
      await deleteFinishTypePermanentlyService(finishType.id);

      await queryClient.invalidateQueries({
        queryKey: ["finish-types-admin"],
      });

      toast.success("Tipo de acabado eliminado exitosamente");
    } catch (error: any) {
      const { data } = await error.response.json();
      toast.error(data);
    }
  };

  return (
    <ConfirmationDialog
      title="¿Estás seguro de que deseas eliminar este tipo de acabado?"
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
