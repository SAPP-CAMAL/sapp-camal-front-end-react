"use client";

import { PowerOffIcon } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/confirmation-dialog";
import { deleteRoleService } from "../server/db/roles.service";
import { Role } from "../domain/roles.domain";

export function DeactivateRole({ role }: { role: Role }) {
  const queryClient = useQueryClient();

  const handleDeactivate = async () => {
    try {
      await deleteRoleService(role.id);

      await queryClient.invalidateQueries({
        queryKey: ["roles"],
      });

      toast.success("Rol desactivado exitosamente");
    } catch (error: any) {
      const { data } = await error.response.json();
      toast.error(data);
    }
  };

  return (
    <ConfirmationDialog
      title="¿Estás seguro de que deseas desactivar este rol?"
      description="Los usuarios con este rol asignado no podrán usarlo para iniciar sesión mientras esté inactivo. Podrás reactivarlo cuando lo necesites."
      onConfirm={handleDeactivate}
      triggerBtn={
        <Button variant="outline" title="Desactivar Rol">
          <PowerOffIcon />
        </Button>
      }
      cancelBtn={<Button variant="outline">Cancelar</Button>}
      confirmBtn={<Button variant="destructive">Desactivar</Button>}
    />
  );
}
