"use client";

import { Trash2Icon } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/confirmation-dialog";
import { deleteParishService } from "../server/db/locations-admin.service";
import { Parish } from "../domain/locations-admin.domain";

export function DeleteParish({ parish }: { parish: Parish }) {
  const queryClient = useQueryClient();

  const handleDelete = async () => {
    try {
      await deleteParishService(parish.id);

      await queryClient.invalidateQueries({
        queryKey: ["parishes-admin"],
      });

      toast.success("Parroquia eliminada exitosamente");
    } catch (error: any) {
      const { data } = await error.response.json();
      toast.error(data);
    }
  };

  return (
    <ConfirmationDialog
      title="¿Estás seguro de que deseas eliminar esta parroquia?"
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
