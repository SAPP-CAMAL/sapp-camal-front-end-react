"use client";

import { Trash2Icon } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/confirmation-dialog";
import { deleteOrderTypePermanentlyService } from "../server/db/order-type.service";
import { OrderType } from "../domain/order-type.domain";
import { ORDER_TYPES_TAG } from "../constants/order-type.constants";

export function DeleteOrderType({ orderType }: { orderType: OrderType }) {
  const queryClient = useQueryClient();

  const handleDelete = async () => {
    try {
      await deleteOrderTypePermanentlyService(orderType.id);

      await queryClient.invalidateQueries({
        queryKey: [ORDER_TYPES_TAG],
      });

      toast.success("Rol para pedidos eliminado exitosamente");
    } catch (error: any) {
      const { data } = await error.response.json();
      toast.error(data);
    }
  };

  return (
    <ConfirmationDialog
      title="¿Estás seguro de que deseas eliminar este rol para pedidos?"
      description="Esta acción no se puede deshacer."
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
