"use client";

import { Trash2Icon } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/confirmation-dialog";
import { deleteSettingWeighingStagePermanentlyService } from "../server/db/setting-weighing-stage.service";
import { SettingWeighingStage } from "../domain/setting-weighing-stage.domain";
import { SETTING_WEIGHING_STAGES_TAG } from "../constants/setting-weighing-stage.constants";

export function DeleteSettingWeighingStage({
  settingWeighingStage,
}: {
  settingWeighingStage: SettingWeighingStage;
}) {
  const queryClient = useQueryClient();

  const handleDelete = async () => {
    try {
      await deleteSettingWeighingStagePermanentlyService(settingWeighingStage.id);

      await queryClient.invalidateQueries({
        queryKey: [SETTING_WEIGHING_STAGES_TAG],
      });

      toast.success("Etapa de pesaje eliminada exitosamente");
    } catch (error: any) {
      const { data } = await error.response.json();
      toast.error(data);
    }
  };

  return (
    <ConfirmationDialog
      title="¿Estás seguro de que deseas eliminar esta etapa de pesaje?"
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
