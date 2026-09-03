"use client";

import { PowerIcon } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/confirmation-dialog";
import { activateUserAction } from "../server/db/actions.users";
import { UserFilter } from "../domain";

export function ActivateUser({ user }: { user: UserFilter }) {
  const queryClient = useQueryClient();

  const handleActivate = async () => {
    try {
      await activateUserAction(user.id);

      await queryClient.invalidateQueries({
        queryKey: ["users"],
      });

      toast.success("Usuario activado exitosamente");
    } catch (error: any) {
      const { data } = await error.response.json();
      toast.error(data ?? "No se pudo activar el usuario.");
    }
  };

  return (
    <ConfirmationDialog
      title="¿Estás seguro de que deseas activar este usuario?"
      description="El usuario volverá a poder iniciar sesión en el sistema."
      onConfirm={handleActivate}
      triggerBtn={
        <Button variant="outline" title="Activar Usuario">
          <PowerIcon />
        </Button>
      }
      cancelBtn={<Button variant="outline">Cancelar</Button>}
      confirmBtn={<Button>Activar</Button>}
    />
  );
}
