"use client";

import { Trash2Icon } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/confirmation-dialog";
import { getApiErrorMessage } from "@/lib/error-handler";
import { deleteDistributionProductPermanentlyService } from "../server/db/distribution-product.service";
import { DistributionProduct } from "../domain/distribution-product.domain";
import { DISTRIBUTION_PRODUCTS_TAG } from "../constants/distribution-product.constants";

export function DeleteDistributionProduct({
  distributionProduct,
}: {
  distributionProduct: DistributionProduct;
}) {
  const queryClient = useQueryClient();

  const handleDelete = async () => {
    try {
      await deleteDistributionProductPermanentlyService(distributionProduct.id);

      await queryClient.invalidateQueries({
        queryKey: [DISTRIBUTION_PRODUCTS_TAG],
      });

      toast.success("Despacho eliminado exitosamente");
    } catch (error: unknown) {
      toast.error(await getApiErrorMessage(error) ?? "Error al eliminar el despacho");
    }
  };

  return (
    <ConfirmationDialog
      title="¿Estás seguro de que deseas eliminar este despacho?"
      description="Esta acción no se puede deshacer. Si tiene productos detallados asignados, no podrá eliminarse hasta quitarlos primero."
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
