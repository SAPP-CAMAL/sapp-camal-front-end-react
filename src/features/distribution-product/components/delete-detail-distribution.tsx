"use client";

import { Trash2Icon } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/confirmation-dialog";
import { deleteDetailDistributionPermanentlyService } from "../server/db/distribution-product.service";
import { DETAIL_DISTRIBUTIONS_TAG } from "../constants/distribution-product.constants";

export function DeleteDetailDistribution({
  id,
  idDistributionProduct,
}: {
  id: number;
  idDistributionProduct: number;
}) {
  const queryClient = useQueryClient();

  const handleDelete = async () => {
    try {
      await deleteDetailDistributionPermanentlyService(id);

      await queryClient.invalidateQueries({
        queryKey: [DETAIL_DISTRIBUTIONS_TAG, idDistributionProduct],
      });

      toast.success("Producto removido del despacho exitosamente");
    } catch (error: any) {
      const { data } = await error.response.json();
      toast.error(data);
    }
  };

  return (
    <ConfirmationDialog
      title="¿Estás seguro de que deseas remover este producto del despacho?"
      description="Esta acción no se puede deshacer."
      onConfirm={handleDelete}
      triggerBtn={
        <Button variant="ghost" size="sm">
          <Trash2Icon className="h-3.5 w-3.5" />
        </Button>
      }
      cancelBtn={<Button variant="outline">Cancelar</Button>}
      confirmBtn={<Button variant="destructive">Eliminar</Button>}
    />
  );
}
