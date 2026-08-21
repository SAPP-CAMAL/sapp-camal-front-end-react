"use client";

import { Trash2Icon } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/confirmation-dialog";
import { deleteProductAnatomicalLocationService } from "../server/db/product-anatomical-location.service";
import { ProductAnatomicalLocation } from "../domain/product-anatomical-location.domain";
import { PRODUCT_ANATOMICAL_LOCATION_TAG } from "../constants/product-anatomical-location.constants";

export function DeleteProductAnatomicalLocation({
  productAnatomicalLocation,
}: {
  productAnatomicalLocation: ProductAnatomicalLocation;
}) {
  const queryClient = useQueryClient();

  const handleDelete = async () => {
    try {
      await deleteProductAnatomicalLocationService(
        productAnatomicalLocation.id
      );

      await queryClient.invalidateQueries({
        queryKey: [PRODUCT_ANATOMICAL_LOCATION_TAG],
      });

      toast.success("Ubicación anatómica eliminada exitosamente");
    } catch (error: any) {
      const { data } = await error.response.json();
      toast.error(data);
    }
  };

  return (
    <ConfirmationDialog
      title="¿Estás seguro de que deseas eliminar esta ubicación anatómica?"
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
