"use client";

import { Trash2Icon } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/confirmation-dialog";
import { deleteCleaningAreaCatalogService } from "../server/db/cleaning-area-catalog.service";
import { CleaningAreaCatalog } from "../domain/cleaning-area-catalog.domain";
import { CLEANING_AREA_CATALOG_TAG } from "../constants/cleaning-area-catalog.constants";

export function DeleteCleaningAreaCatalog({
  areaCatalog,
}: {
  areaCatalog: CleaningAreaCatalog;
}) {
  const queryClient = useQueryClient();

  const handleDelete = async () => {
    try {
      await deleteCleaningAreaCatalogService(areaCatalog.id);

      await queryClient.invalidateQueries({
        queryKey: [CLEANING_AREA_CATALOG_TAG],
      });

      toast.success("Área de limpieza eliminada exitosamente");
    } catch (error: any) {
      const { data } = await error.response.json();
      toast.error(data);
    }
  };

  return (
    <ConfirmationDialog
      title="¿Estás seguro de que deseas eliminar esta área de limpieza?"
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
