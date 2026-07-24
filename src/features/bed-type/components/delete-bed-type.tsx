"use client";

import { Trash2Icon } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/confirmation-dialog";
import { deleteBedType } from "../server/db/bed-type.service";
import { BedType } from "../domain";
import { BED_TYPE_LIST_TAG } from "../constants";

export function DeleteBedType({ bedType }: { bedType: BedType }) {
  const queryClient = useQueryClient();

  const handleDelete = async () => {
    try {
      await deleteBedType(bedType.id);

      await queryClient.invalidateQueries({
        queryKey: [BED_TYPE_LIST_TAG],
      });

      toast.success("Tipo de cama eliminado exitosamente");
    } catch (error: any) {
      const { data } = await error.response.json();
      toast.error(data);
    }
  };

  return (
    <ConfirmationDialog
      title="¿Estás seguro de que deseas eliminar este tipo de cama?"
      description="Esta acción no se puede deshacer."
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
