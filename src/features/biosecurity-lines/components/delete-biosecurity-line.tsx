"use client";

import { Trash2Icon } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/confirmation-dialog";
import { deleteBiosecurityLinePermanentlyService } from "../server/db/biosecurity-lines.service";
import { BIOSECURITY_LINES_TAG } from "../constants/biosecurity-lines.constants";

export function DeleteBiosecurityLine({ id }: { id: number }) {
  const queryClient = useQueryClient();

  const handleDelete = async () => {
    try {
      await deleteBiosecurityLinePermanentlyService(id);

      await queryClient.invalidateQueries({
        queryKey: [BIOSECURITY_LINES_TAG],
      });

      toast.success("Línea de bioseguridad eliminada exitosamente");
    } catch (error: any) {
      const { data } = await error.response.json();
      toast.error(data);
    }
  };

  return (
    <ConfirmationDialog
      title="¿Estás seguro de que deseas eliminar esta línea de bioseguridad?"
      description="Esta acción no se puede deshacer. Si tiene equipos asignados, no podrá eliminarse hasta quitarlos primero."
      onConfirm={handleDelete}
      triggerBtn={
        <Button variant="outline" size="sm">
          <Trash2Icon className="h-4 w-4" />
        </Button>
      }
      cancelBtn={<Button variant="outline">Cancelar</Button>}
      confirmBtn={<Button variant="destructive">Eliminar</Button>}
    />
  );
}
