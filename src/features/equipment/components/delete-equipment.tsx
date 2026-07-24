"use client";

import { Trash2Icon } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/confirmation-dialog";
import { deleteEquipmentService } from "../server/db/equipment.service";
import { Equipment } from "../domain/equipment.domain";
import { EQUIPMENTS_TAG } from "../constants/equipment.constants";

export function DeleteEquipment({ equipment }: { equipment: Equipment }) {
  const queryClient = useQueryClient();

  const handleDelete = async () => {
    try {
      await deleteEquipmentService(equipment.id);

      await queryClient.invalidateQueries({
        queryKey: [EQUIPMENTS_TAG],
      });

      toast.success("Equipo eliminado exitosamente");
    } catch (error: any) {
      const { data } = await error.response.json();
      toast.error(data);
    }
  };

  return (
    <ConfirmationDialog
      title="¿Estás seguro de que deseas eliminar este equipo?"
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
