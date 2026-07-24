"use client";

import { useEffect, useState } from "react";
import { SquarePenIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { ConfigSectionChannelFormFields } from "./config-section-channel-form-fields";
import { updateConfigSectionChannelService } from "../server/db/config-section-channel.service";
import { NewConfigSectionChannelForm } from "./new-config-section-channel";
import { ConfigSectionChannel } from "../domain/config-section-channel.domain";
import { CONFIG_SECTION_CHANNEL_TAG } from "../constants/config-section-channel.constants";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function UpdateConfigSectionChannel({
  configSectionChannel,
  idChannelType,
}: {
  configSectionChannel: ConfigSectionChannel;
  idChannelType: number;
}) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const form = useForm<NewConfigSectionChannelForm>();

  useEffect(() => {
    if (open) {
      form.reset({
        sectionCode: configSectionChannel.sectionCode,
        orderNumber: configSectionChannel.orderNumber,
        description: configSectionChannel.description ?? "",
      });
    }
  }, [open, form, configSectionChannel]);

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      await updateConfigSectionChannelService(configSectionChannel.id, {
        ...(form.formState.dirtyFields.sectionCode && {
          sectionCode: data.sectionCode,
        }),
        ...(form.formState.dirtyFields.orderNumber && {
          orderNumber: data.orderNumber,
        }),
        ...(form.formState.dirtyFields.description && {
          description: data.description,
        }),
      });

      form.reset(form.formState.defaultValues);

      await queryClient.invalidateQueries({
        queryKey: [CONFIG_SECTION_CHANNEL_TAG, idChannelType],
      });

      toast.success("Sección actualizada exitosamente");
      setOpen(false);
    } catch (error: any) {
      const { data } = await error.response.json();
      toast.error(data);
    }
  });

  return (
    <Dialog open={open} onOpenChange={(open) => setOpen(open)}>
      <Tooltip>
        <TooltipTrigger asChild>
          <DialogTrigger asChild>
            <Button variant={"outline"}>
              <SquarePenIcon />
            </Button>
          </DialogTrigger>
        </TooltipTrigger>
        <TooltipContent
          side="top"
          align="center"
          sideOffset={5}
          avoidCollisions
        >
          Editar Sección
        </TooltipContent>
      </Tooltip>
      <DialogContent className="max-h-screen overflow-y-auto w-[95vw] sm:max-w-[50vw]">
        <DialogHeader>
          <DialogTitle>Editar Sección de Canal</DialogTitle>
          <DialogDescription>
            Modifica la información de la sección seleccionada.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={onSubmit}
            className="space-y-8 grid grid-cols-1 gap-2"
          >
            <ConfigSectionChannelFormFields />
            <div className="flex justify-end col-span-2 gap-x-2">
              <Button
                type="button"
                variant={"outline"}
                disabled={form.formState.isSubmitting}
                onClick={() => setOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={
                  form.formState.isSubmitting || form.formState.isLoading
                }
              >
                {form.formState.isSubmitting ? "Actualizando..." : "Actualizar"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
