"use client";

import { Trash2Icon } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/confirmation-dialog";
import { deleteProvinceService } from "../server/db/locations-admin.service";
import { Province } from "../domain/locations-admin.domain";

export function DeleteProvince({ province }: { province: Province }) {
  const queryClient = useQueryClient();

  const handleDelete = async () => {
    try {
      await deleteProvinceService(province.id);

      await queryClient.invalidateQueries({
        queryKey: ["provinces-admin"],
      });

      toast.success("Provincia eliminada exitosamente");
    } catch (error: any) {
      const { data } = await error.response.json();
      toast.error(data);
    }
  };

  return (
    <ConfirmationDialog
      title="¿Estás seguro de que deseas eliminar esta provincia?"
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
