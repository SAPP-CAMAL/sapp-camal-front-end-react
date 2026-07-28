"use client";

import { Trash2Icon } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/confirmation-dialog";
import { deleteDisinfectantCatalogService } from "../server/db/disinfectant-catalog.service";
import { DisinfectantCatalog } from "../domain/disinfectant-catalog.domain";

export function DeleteDisinfectantCatalog({ disinfectant }: { disinfectant: DisinfectantCatalog }) {
  const queryClient = useQueryClient();

  const handleDelete = async () => {
    try {
      await deleteDisinfectantCatalogService(disinfectant.id);

      await queryClient.invalidateQueries({
        queryKey: ["disinfectants-catalog"],
      });

      toast.success("Desinfectante eliminado exitosamente");
    } catch (error: any) {
      const { data } = await error.response.json();
      toast.error(data);
    }
  };

  return (
    <ConfirmationDialog
      title="¿Estás seguro de que deseas eliminar este desinfectante?"
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
