"use client";

import { Trash2Icon } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/confirmation-dialog";
import { deleteCatalogueValuePermanentlyService } from "../server/db/catalogue-management.service";
import { CatalogueValue } from "../domain/catalogue-management.domain";

export function DeleteCatalogueValue({ value }: { value: CatalogueValue }) {
  const queryClient = useQueryClient();

  const handleDelete = async () => {
    try {
      await deleteCatalogueValuePermanentlyService(value.id);

      await queryClient.invalidateQueries({
        queryKey: ["catalogue-values"],
      });

      toast.success("Valor de catálogo eliminado exitosamente");
    } catch (error: any) {
      const { data } = await error.response.json();
      toast.error(data);
    }
  };

  return (
    <ConfirmationDialog
      title="¿Estás seguro de que deseas eliminar este valor de catálogo?"
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
