"use client";

import { Trash2Icon } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/confirmation-dialog";
import { deleteSettingSignsBodyService } from "../server/db/setting-signs-body.service";
import { SettingSignsBody } from "../domain/setting-signs-body.domain";
import { SETTING_SIGNS_BODY_TAG } from "../constants/setting-signs-body.constants";

export function DeleteSettingSignsBody({
  settingSignsBody,
}: {
  settingSignsBody: SettingSignsBody;
}) {
  const queryClient = useQueryClient();

  const handleDelete = async () => {
    try {
      await deleteSettingSignsBodyService(settingSignsBody.id);

      await queryClient.invalidateQueries({
        queryKey: [SETTING_SIGNS_BODY_TAG],
      });

      toast.success("Parte del cuerpo eliminada exitosamente");
    } catch (error: any) {
      const { data } = await error.response.json();
      toast.error(data);
    }
  };

  return (
    <ConfirmationDialog
      title="¿Estás seguro de que deseas eliminar esta parte del cuerpo?"
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
