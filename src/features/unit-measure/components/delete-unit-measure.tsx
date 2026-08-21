"use client";

import { Trash2Icon } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/confirmation-dialog";
import { deleteUnitMeasurePermanentlyService } from "../server/db/unit-measure-admin.service";
import { UnitMeasureAdmin } from "../domain/unit-measure-admin.domain";

export function DeleteUnitMeasure({ unitMeasure }: { unitMeasure: UnitMeasureAdmin }) {
  const queryClient = useQueryClient();

  const handleDelete = async () => {
    try {
      await deleteUnitMeasurePermanentlyService(unitMeasure.id);

      await queryClient.invalidateQueries({
        queryKey: ["unit-measures-admin"],
      });

      toast.success("Unidad de medida eliminada exitosamente");
    } catch (error: any) {
      const { data } = await error.response.json();
      toast.error(data);
    }
  };

  return (
    <ConfirmationDialog
      title="¿Estás seguro de que deseas eliminar esta unidad de medida?"
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
