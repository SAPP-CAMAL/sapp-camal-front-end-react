"use client";

import { Trash2Icon } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/confirmation-dialog";
import { deleteHookTypePermanentlyService } from "../server/db/hook-type.service";
import { HookType } from "../domain/hook-type.domain";
import { HOOK_TYPE_TAG } from "../constants/hook-type.constants";

export function DeleteHookType({ hookType }: { hookType: HookType }) {
  const queryClient = useQueryClient();

  const handleDelete = async () => {
    try {
      await deleteHookTypePermanentlyService(hookType.id);

      await queryClient.invalidateQueries({
        queryKey: [HOOK_TYPE_TAG],
      });

      toast.success("Tipo de gancho eliminado exitosamente");
    } catch (error: any) {
      const { data } = await error.response.json();
      toast.error(data);
    }
  };

  return (
    <ConfirmationDialog
      title="¿Estás seguro de que deseas eliminar este tipo de gancho?"
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
