"use client";

import { Trash2Icon } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/confirmation-dialog";
import { deleteEquipmentTypePermanentlyService } from "../server/db/equipment.service";
import { EquipmentType } from "../domain/equipment.domain";
import { EQUIPMENT_TYPES_TAG } from "../constants/equipment.constants";

export function DeleteEquipmentType({
  equipmentType,
}: {
  equipmentType: EquipmentType;
}) {
  const queryClient = useQueryClient();

  const handleDelete = async () => {
    try {
      await deleteEquipmentTypePermanentlyService(equipmentType.id);

      await queryClient.invalidateQueries({
        queryKey: [EQUIPMENT_TYPES_TAG],
      });

      toast.success("Tipo de equipo eliminado exitosamente");
    } catch (error: any) {
      const { data } = await error.response.json();
      toast.error(data);
    }
  };

  return (
    <ConfirmationDialog
      title="¿Estás seguro de que deseas eliminar este tipo de equipo?"
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
