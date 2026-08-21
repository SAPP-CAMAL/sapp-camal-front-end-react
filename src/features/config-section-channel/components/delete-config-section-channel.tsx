"use client";

import { Trash2Icon } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/confirmation-dialog";
import { deleteConfigSectionChannelService } from "../server/db/config-section-channel.service";
import { ConfigSectionChannel } from "../domain/config-section-channel.domain";
import { CONFIG_SECTION_CHANNEL_TAG } from "../constants/config-section-channel.constants";

export function DeleteConfigSectionChannel({
  configSectionChannel,
  idChannelType,
}: {
  configSectionChannel: ConfigSectionChannel;
  idChannelType: number;
}) {
  const queryClient = useQueryClient();

  const handleDelete = async () => {
    try {
      await deleteConfigSectionChannelService(configSectionChannel.id);

      await queryClient.invalidateQueries({
        queryKey: [CONFIG_SECTION_CHANNEL_TAG, idChannelType],
      });

      toast.success("Sección eliminada exitosamente");
    } catch (error: any) {
      const { data } = await error.response.json();
      toast.error(data);
    }
  };

  return (
    <ConfirmationDialog
      title="¿Estás seguro de que deseas eliminar esta sección?"
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
