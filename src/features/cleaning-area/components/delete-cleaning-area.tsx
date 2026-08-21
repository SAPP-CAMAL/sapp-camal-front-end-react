"use client";

import { Trash2Icon } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/confirmation-dialog";
import { deleteCleaningAreaService } from "../server/db/cleaning-area.service";
import { CLEANING_AREA_BY_LINE_TAG } from "../constants/cleaning-area.constants";

export function DeleteCleaningArea({
  idArea,
  idLine,
}: {
  idArea: number;
  idLine: number;
}) {
  const queryClient = useQueryClient();

  const handleDelete = async () => {
    try {
      await deleteCleaningAreaService(idArea);

      await queryClient.invalidateQueries({
        queryKey: [CLEANING_AREA_BY_LINE_TAG, idLine],
      });

      toast.success("Área removida de la línea exitosamente");
    } catch (error: any) {
      const { data } = await error.response.json();
      toast.error(data);
    }
  };

  return (
    <ConfirmationDialog
      title="¿Estás seguro de que deseas remover esta área de la línea?"
      description="Esta acción no se puede deshacer. Se eliminarán también las estructuras/materiales asignados a esta área en esta línea."
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
