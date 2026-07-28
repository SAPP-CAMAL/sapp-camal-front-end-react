"use client";

import { Trash2Icon } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/confirmation-dialog";
import { deleteCleaningMethodService } from "../server/db/cleaning-method-admin.service";
import { CleaningMethodAdmin } from "../domain/cleaning-method-admin.domain";

export function DeleteCleaningMethod({ cleaningMethod }: { cleaningMethod: CleaningMethodAdmin }) {
  const queryClient = useQueryClient();

  const handleDelete = async () => {
    try {
      await deleteCleaningMethodService(cleaningMethod.id);

      await queryClient.invalidateQueries({
        queryKey: ["cleaning-methods-admin"],
      });

      toast.success("Método de limpieza eliminado exitosamente");
    } catch (error: any) {
      const { data } = await error.response.json();
      toast.error(data);
    }
  };

  return (
    <ConfirmationDialog
      title="¿Estás seguro de que deseas eliminar este método de limpieza?"
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
