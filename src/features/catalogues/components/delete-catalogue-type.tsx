"use client";

import { Trash2Icon } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/confirmation-dialog";
import { deleteCatalogueTypeService } from "../server/db/catalogue-management.service";
import { CatalogueType } from "../domain/catalogue-management.domain";

export function DeleteCatalogueType({ catalogueType }: { catalogueType: CatalogueType }) {
  const queryClient = useQueryClient();

  const handleDelete = async () => {
    try {
      await deleteCatalogueTypeService(catalogueType.id);

      await queryClient.invalidateQueries({
        queryKey: ["catalogue-types"],
      });

      toast.success("Tipo de catálogo eliminado exitosamente");
    } catch (error: any) {
      const { data } = await error.response.json();
      toast.error(data);
    }
  };

  return (
    <ConfirmationDialog
      title="¿Estás seguro de que deseas eliminar este tipo de catálogo?"
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
