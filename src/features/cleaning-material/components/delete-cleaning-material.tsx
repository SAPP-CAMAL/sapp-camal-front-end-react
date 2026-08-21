"use client";

import { Trash2Icon } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/confirmation-dialog";
import { deleteCleaningMaterialPermanentlyService } from "../server/db/cleaning-material-admin.service";
import { CleaningMaterialAdmin } from "../domain/cleaning-material-admin.domain";

export function DeleteCleaningMaterial({ cleaningMaterial }: { cleaningMaterial: CleaningMaterialAdmin }) {
  const queryClient = useQueryClient();

  const handleDelete = async () => {
    try {
      await deleteCleaningMaterialPermanentlyService(cleaningMaterial.id);

      await queryClient.invalidateQueries({
        queryKey: ["cleaning-materials-admin"],
      });

      toast.success("Material de limpieza eliminado exitosamente");
    } catch (error: any) {
      const { data } = await error.response.json();
      toast.error(data);
    }
  };

  return (
    <ConfirmationDialog
      title="¿Estás seguro de que deseas eliminar este material de limpieza?"
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
