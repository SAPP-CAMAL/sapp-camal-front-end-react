"use client";

import { Trash2Icon } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/confirmation-dialog";
import { deleteSettingEquipmentLinePermanentlyService } from "../server/db/biosecurity-lines.service";
import { SETTING_EQUIPMENT_LINES_TAG } from "../constants/biosecurity-lines.constants";

export function DeleteSettingEquipmentLine({
  id,
  idBiosecurityLine,
}: {
  id: number;
  idBiosecurityLine: number;
}) {
  const queryClient = useQueryClient();

  const handleDelete = async () => {
    try {
      await deleteSettingEquipmentLinePermanentlyService(id);

      await queryClient.invalidateQueries({
        queryKey: [SETTING_EQUIPMENT_LINES_TAG, idBiosecurityLine],
      });

      toast.success("Equipo removido de la línea exitosamente");
    } catch (error: any) {
      const { data } = await error.response.json();
      toast.error(data);
    }
  };

  return (
    <ConfirmationDialog
      title="¿Estás seguro de que deseas remover este equipo?"
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
