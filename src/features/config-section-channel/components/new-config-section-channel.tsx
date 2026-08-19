"use client";

import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { ConfigSectionChannelFormFields } from "./config-section-channel-form-fields";
import { createConfigSectionChannelService } from "../server/db/config-section-channel.service";
import { useEffect, useState } from "react";
import { CONFIG_SECTION_CHANNEL_TAG } from "../constants/config-section-channel.constants";

export type NewConfigSectionChannelForm = {
  sectionCode: string;
  orderNumber: number;
  description: string;
};

const defaultValues: NewConfigSectionChannelForm = {
  sectionCode: "",
  orderNumber: 1,
  description: "",
};

export function NewConfigSectionChannel({
  idChannelType,
}: {
  idChannelType: number;
}) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const form = useForm<NewConfigSectionChannelForm>({ defaultValues });

  useEffect(() => {
    if (open) {
      form.reset(defaultValues);
    }
  }, [open, form]);

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      await createConfigSectionChannelService({
        sectionCode: data.sectionCode,
        orderNumber: data.orderNumber,
        description: data.description,
        idChannelType,
      });

      form.reset(defaultValues);

      await queryClient.invalidateQueries({
        queryKey: [CONFIG_SECTION_CHANNEL_TAG, idChannelType],
      });

      toast.success("Sección creada exitosamente");
      setOpen(false);
    } catch (error: any) {
      const { data } = await error.response.json();
      toast.error(data);
    }
  });

  return (
    <Dialog open={open} onOpenChange={(open) => setOpen(open)}>
      <DialogTrigger asChild>
        <Button>
          <PlusIcon />
          Nueva sección
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-screen overflow-y-auto w-[95vw] sm:max-w-[50vw]">
        <DialogHeader>
          <DialogTitle>Nueva Sección de Canal</DialogTitle>
          <DialogDescription>
            Define una nueva sección interna para este tipo de canal.
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
                {form.formState.isSubmitting ? "Guardando..." : "Guardar"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
