"use client";

import { Trash2Icon } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/confirmation-dialog";
import { deleteCorralGroupPermanentlyService } from "../server/db/corral-group-admin.service";
import { CorralGroupAdmin } from "../domain/corral-group-admin.domain";

export function DeleteCorralGroup({ corralGroup }: { corralGroup: CorralGroupAdmin }) {
  const queryClient = useQueryClient();

  const handleDelete = async () => {
    try {
      await deleteCorralGroupPermanentlyService(corralGroup.id);

      await queryClient.invalidateQueries({
        queryKey: ["corral-groups-admin"],
      });

      toast.success("Grupo de corrales eliminado exitosamente");
    } catch (error: any) {
      const { data } = await error.response.json();
      toast.error(data);
    }
  };

  return (
    <ConfirmationDialog
      title="¿Estás seguro de que deseas eliminar este grupo de corrales?"
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
