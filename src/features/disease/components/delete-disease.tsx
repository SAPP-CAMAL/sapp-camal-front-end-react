"use client";

import { Trash2Icon } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/confirmation-dialog";
import { deleteDiseasePermanentlyService } from "../server/db/disease.service";
import { Disease } from "../domain/disease.domain";
import { DISEASE_TAG } from "../constants/disease.constants";

export function DeleteDisease({ disease }: { disease: Disease }) {
  const queryClient = useQueryClient();

  const handleDelete = async () => {
    try {
      await deleteDiseasePermanentlyService(disease.id);

      await queryClient.invalidateQueries({
        queryKey: [DISEASE_TAG],
      });

      toast.success("Enfermedad eliminada exitosamente");
    } catch (error: any) {
      const { data } = await error.response.json();
      toast.error(data);
    }
  };

  return (
    <ConfirmationDialog
      title="¿Estás seguro de que deseas eliminar esta enfermedad?"
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
