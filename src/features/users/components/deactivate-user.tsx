"use client";

import { PowerOffIcon } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/confirmation-dialog";
import { deactivateUserAction } from "../server/db/actions.users";
import { UserFilter } from "../domain";

export function DeactivateUser({ user }: { user: UserFilter }) {
  const queryClient = useQueryClient();

  const handleDeactivate = async () => {
    try {
      await deactivateUserAction(user.id);

      await queryClient.invalidateQueries({
        queryKey: ["users"],
      });

      toast.success("Usuario desactivado exitosamente");
    } catch (error: any) {
      const { data } = await error.response.json();
      toast.error(data ?? "No se pudo desactivar el usuario.");
    }
  };

  return (
    <ConfirmationDialog
      title="¿Estás seguro de que deseas desactivar este usuario?"
      description="El usuario no podrá iniciar sesión en el sistema mientras esté inactivo. Podrás reactivarlo cuando lo necesites."
      onConfirm={handleDeactivate}
      triggerBtn={
        <Button variant="outline" title="Desactivar Usuario">
          <PowerOffIcon />
        </Button>
      }
      cancelBtn={<Button variant="outline">Cancelar</Button>}
      confirmBtn={<Button variant="destructive">Desactivar</Button>}
    />
  );
}
