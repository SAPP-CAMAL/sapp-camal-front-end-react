"use client";

import { Trash2Icon } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/confirmation-dialog";
import { deleteProductDiseasePermanentlyService } from "../server/db/product-disease.service";
import { ProductDisease } from "../domain/product-disease.domain";
import { PRODUCT_DISEASE_TAG } from "../constants/product-disease.constants";

export function DeleteProductDisease({
  productDisease,
}: {
  productDisease: ProductDisease;
}) {
  const queryClient = useQueryClient();

  const handleDelete = async () => {
    try {
      await deleteProductDiseasePermanentlyService(productDisease.id);

      await queryClient.invalidateQueries({
        queryKey: [PRODUCT_DISEASE_TAG],
      });

      toast.success("Regla eliminada exitosamente");
    } catch (error: any) {
      const { data } = await error.response.json();
      toast.error(data);
    }
  };

  return (
    <ConfirmationDialog
      title="¿Estás seguro de que deseas eliminar esta regla?"
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
