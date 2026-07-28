"use client";

import { Trash2Icon } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/confirmation-dialog";
import { deleteCorralTypeService } from "../server/db/corral-type-admin.service";
import { CorralType } from "../domain";

export function DeleteCorralType({ corralType }: { corralType: CorralType }) {
  const queryClient = useQueryClient();

  const handleDelete = async () => {
    try {
      await deleteCorralTypeService(corralType.id);

      await queryClient.invalidateQueries({
        queryKey: ["corral-types-admin"],
      });

      toast.success("Tipo de corral eliminado exitosamente");
    } catch (error: any) {
      const { data } = await error.response.json();
      toast.error(data);
    }
  };

  return (
    <ConfirmationDialog
      title="¿Estás seguro de que deseas eliminar este tipo de corral?"
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
