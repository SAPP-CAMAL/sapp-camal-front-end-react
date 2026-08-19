"use client";

import { Trash2Icon } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/confirmation-dialog";
import { deleteMenuPermanentlyService } from "../server/db/menus.service";
import { MenuAdmin } from "../domain/menus.domain";

export function DeleteMenu({ menu }: { menu: MenuAdmin }) {
  const queryClient = useQueryClient();

  const handleDelete = async () => {
    try {
      await deleteMenuPermanentlyService(menu.id);

      await queryClient.invalidateQueries({
        queryKey: ["menus-admin"],
      });

      toast.success("Menú eliminado exitosamente");
    } catch (error: any) {
      const { data } = await error.response.json();
      toast.error(data);
    }
  };

  return (
    <ConfirmationDialog
      title="¿Estás seguro de que deseas eliminar este menú?"
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
