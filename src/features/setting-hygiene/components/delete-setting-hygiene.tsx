"use client";

import { Trash2Icon } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/confirmation-dialog";
import { deleteSettingHygieneService } from "../server/db/setting-hygiene-admin.service";
import { SettingHygieneAdmin } from "../domain/setting-hygiene-admin.domain";

export function DeleteSettingHygiene({ settingHygiene }: { settingHygiene: SettingHygieneAdmin }) {
  const queryClient = useQueryClient();

  const handleDelete = async () => {
    try {
      await deleteSettingHygieneService(settingHygiene.id);

      await queryClient.invalidateQueries({
        queryKey: ["setting-hygiene-admin"],
      });

      toast.success("Configuración de higiene eliminada exitosamente");
    } catch (error: any) {
      const { data } = await error.response.json();
      toast.error(data);
    }
  };

  return (
    <ConfirmationDialog
      title="¿Estás seguro de que deseas eliminar esta configuración de higiene?"
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
