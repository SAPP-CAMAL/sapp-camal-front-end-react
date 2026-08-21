"use client";

import { Trash2Icon } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/confirmation-dialog";
import { deleteCleaningAreaStructureService } from "../server/db/cleaning-area.service";
import { CLEANING_AREA_BY_LINE_TAG } from "../constants/cleaning-area.constants";

export function DeleteCleaningAreaStructure({
  idStructure,
  idLine,
}: {
  idStructure: number;
  idLine: number;
}) {
  const queryClient = useQueryClient();

  const handleDelete = async () => {
    try {
      await deleteCleaningAreaStructureService(idStructure);

      await queryClient.invalidateQueries({
        queryKey: [CLEANING_AREA_BY_LINE_TAG, idLine],
      });

      toast.success("Estructura removida del área exitosamente");
    } catch (error: any) {
      const { data } = await error.response.json();
      toast.error(data);
    }
  };

  return (
    <ConfirmationDialog
      title="¿Estás seguro de que deseas remover esta estructura del área?"
      description="Esta acción no se puede deshacer."
      onConfirm={handleDelete}
      triggerBtn={
        <Button variant="ghost" size="sm">
          <Trash2Icon className="h-3.5 w-3.5" />
        </Button>
      }
      cancelBtn={<Button variant="outline">Cancelar</Button>}
      confirmBtn={<Button variant="destructive">Eliminar</Button>}
    />
  );
}
