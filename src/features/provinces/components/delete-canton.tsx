"use client";

import { Trash2Icon } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/confirmation-dialog";
import { deleteCantonPermanentlyService } from "../server/db/locations-admin.service";
import { Canton } from "../domain/locations-admin.domain";

export function DeleteCanton({ canton }: { canton: Canton }) {
  const queryClient = useQueryClient();

  const handleDelete = async () => {
    try {
      await deleteCantonPermanentlyService(canton.id);

      await queryClient.invalidateQueries({
        queryKey: ["cantons-admin"],
      });

      toast.success("Cantón eliminado exitosamente");
    } catch (error: any) {
      const { data } = await error.response.json();
      toast.error(data);
    }
  };

  return (
    <ConfirmationDialog
      title="¿Estás seguro de que deseas eliminar este cantón?"
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
