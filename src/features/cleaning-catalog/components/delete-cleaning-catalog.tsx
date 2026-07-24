"use client";

import { Trash2Icon } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/confirmation-dialog";
import { deleteCleaningCatalogService } from "../server/db/cleaning-catalog.service";
import { CleaningCatalog } from "../domain/cleaning-catalog.domain";
import { CLEANING_CATALOG_TAG } from "../constants/cleaning-catalog.constants";

export function DeleteCleaningCatalog({
  cleaningCatalog,
}: {
  cleaningCatalog: CleaningCatalog;
}) {
  const queryClient = useQueryClient();

  const handleDelete = async () => {
    try {
      await deleteCleaningCatalogService(cleaningCatalog.id);

      await queryClient.invalidateQueries({
        queryKey: [CLEANING_CATALOG_TAG],
      });

      toast.success("Ítem de limpieza eliminado exitosamente");
    } catch (error: any) {
      const { data } = await error.response.json();
      toast.error(data);
    }
  };

  return (
    <ConfirmationDialog
      title="¿Estás seguro de que deseas eliminar este ítem de limpieza?"
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
