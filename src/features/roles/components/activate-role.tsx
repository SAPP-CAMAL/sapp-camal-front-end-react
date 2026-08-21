"use client";

import { PowerIcon } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/confirmation-dialog";
import { updateRoleService } from "../server/db/roles.service";
import { Role } from "../domain/roles.domain";

export function ActivateRole({ role }: { role: Role }) {
  const queryClient = useQueryClient();

  const handleActivate = async () => {
    try {
      await updateRoleService(role.id, { status: true });

      await queryClient.invalidateQueries({
        queryKey: ["roles"],
      });

      toast.success("Rol activado exitosamente");
    } catch (error: any) {
      const { data } = await error.response.json();
      toast.error(data);
    }
  };

  return (
    <ConfirmationDialog
      title="¿Estás seguro de que deseas activar este rol?"
      description="El rol volverá a estar disponible para ser asignado a usuarios."
      onConfirm={handleActivate}
      triggerBtn={
        <Button variant="outline" title="Activar Rol">
          <PowerIcon />
        </Button>
      }
      cancelBtn={<Button variant="outline">Cancelar</Button>}
      confirmBtn={<Button>Activar</Button>}
    />
  );
}
