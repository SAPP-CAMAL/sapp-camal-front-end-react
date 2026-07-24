"use client";

import { Trash2Icon } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/confirmation-dialog";
import { deleteProductService } from "../server/db/product.service";
import { Product } from "../domain/product.domain";
import { PRODUCT_TAG } from "../constants/product.constants";

export function DeleteProduct({ product }: { product: Product }) {
  const queryClient = useQueryClient();

  const handleDelete = async () => {
    try {
      await deleteProductService(product.id);

      await queryClient.invalidateQueries({
        queryKey: [PRODUCT_TAG],
      });

      toast.success("Producto eliminado exitosamente");
    } catch (error: any) {
      const { data } = await error.response.json();
      toast.error(data);
    }
  };

  return (
    <ConfirmationDialog
      title="¿Estás seguro de que deseas eliminar este producto?"
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
