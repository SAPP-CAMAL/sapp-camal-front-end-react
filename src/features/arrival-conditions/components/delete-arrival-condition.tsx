"use client";

import { Trash2Icon } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/confirmation-dialog";
import { deleteArrivalConditionPermanently } from "../server/db/arrival-conditions.service";
import { ArrivalConditions } from "../domain";
import { ARRIVAL_CONDITIONS_LIST_TAG } from "../constants";

export function DeleteArrivalCondition({
  arrivalCondition,
}: {
  arrivalCondition: ArrivalConditions;
}) {
  const queryClient = useQueryClient();

  const handleDelete = async () => {
    try {
      await deleteArrivalConditionPermanently(arrivalCondition.id);

      await queryClient.invalidateQueries({
        queryKey: [ARRIVAL_CONDITIONS_LIST_TAG],
      });

      toast.success("Condición de llegada eliminada exitosamente");
    } catch (error: any) {
      const { data } = await error.response.json();
      toast.error(data);
    }
  };

  return (
    <ConfirmationDialog
      title="¿Estás seguro de que deseas eliminar esta condición de llegada?"
      description="Esta acción no se puede deshacer."
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
