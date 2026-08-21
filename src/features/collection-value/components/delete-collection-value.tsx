"use client";

import { Trash2Icon } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/confirmation-dialog";
import { deleteCollectionValuePermanentlyService } from "../server/db/collection-value-admin.service";
import { CollectionValueAdmin } from "../domain/collection-value.domain";

export function DeleteCollectionValue({ collectionValue }: { collectionValue: CollectionValueAdmin }) {
  const queryClient = useQueryClient();

  const handleDelete = async () => {
    try {
      await deleteCollectionValuePermanentlyService(collectionValue.id);

      await queryClient.invalidateQueries({
        queryKey: ["collection-values-admin"],
      });

      toast.success("Tarifa eliminada exitosamente");
    } catch (error: any) {
      const { data } = await error.response.json();
      toast.error(data);
    }
  };

  return (
    <ConfirmationDialog
      title="¿Estás seguro de que deseas eliminar esta tarifa?"
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
