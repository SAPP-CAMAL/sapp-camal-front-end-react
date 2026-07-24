"use client";

import { Trash2Icon } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/confirmation-dialog";
import { deleteChannelTypeService } from "../server/db/channel-type.service";
import { ChannelType } from "../domain/channel-type.domain";
import { CHANNEL_TYPE_TAG } from "../constants/channel-type.constants";

export function DeleteChannelType({ channelType }: { channelType: ChannelType }) {
  const queryClient = useQueryClient();

  const handleDelete = async () => {
    try {
      await deleteChannelTypeService(channelType.id);

      await queryClient.invalidateQueries({
        queryKey: [CHANNEL_TYPE_TAG],
      });

      toast.success("Tipo de canal eliminado exitosamente");
    } catch (error: any) {
      const { data } = await error.response.json();
      toast.error(data);
    }
  };

  return (
    <ConfirmationDialog
      title="¿Estás seguro de que deseas eliminar este tipo de canal?"
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
