"use client";

import { Trash2Icon } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/confirmation-dialog";
import { deleteOrderStatusPermanentlyService } from "../server/db/order-status.service";
import { OrderStatus } from "../domain/order-status.domain";

export function DeleteOrderStatus({ orderStatus }: { orderStatus: OrderStatus }) {
  const queryClient = useQueryClient();

  const handleDelete = async () => {
    try {
      await deleteOrderStatusPermanentlyService(orderStatus.id);

      await queryClient.invalidateQueries({
        queryKey: ["order-status-admin"],
      });

      toast.success("Estado de pedido eliminado exitosamente");
    } catch (error: any) {
      const { data } = await error.response.json();
      toast.error(data);
    }
  };

  return (
    <ConfirmationDialog
      title="¿Estás seguro de que deseas eliminar este estado de pedido?"
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
