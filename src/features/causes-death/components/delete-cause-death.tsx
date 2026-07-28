"use client";

import { Trash2Icon } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/confirmation-dialog";
import { deleteCauseDeathPermanentlyService } from "../server/db/causes-death.service";
import { CauseDeath } from "../domain/causes-death.domain";
import { CAUSES_DEATH_TAG } from "../constants/causes-death.constants";

export function DeleteCauseDeath({ causeDeath }: { causeDeath: CauseDeath }) {
  const queryClient = useQueryClient();

  const handleDelete = async () => {
    try {
      await deleteCauseDeathPermanentlyService(causeDeath.id);

      await queryClient.invalidateQueries({
        queryKey: [CAUSES_DEATH_TAG],
      });

      toast.success("Causa de muerte eliminada exitosamente");
    } catch (error: any) {
      const { data } = await error.response.json();
      toast.error(data);
    }
  };

  return (
    <ConfirmationDialog
      title="¿Estás seguro de que deseas eliminar esta causa de muerte?"
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
