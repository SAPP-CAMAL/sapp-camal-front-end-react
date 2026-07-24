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
import { ChannelTypeFormFields } from "./channel-type-form-fields";
import { createChannelTypeService } from "../server/db/channel-type.service";
import { useEffect, useState } from "react";
import { CHANNEL_TYPE_TAG } from "../constants/channel-type.constants";

export type NewChannelTypeForm = {
  code: string;
  name: string;
  description: string;
  hooksQuantity: number;
};

const defaultValues: NewChannelTypeForm = {
  code: "",
  name: "",
  description: "",
  hooksQuantity: 1,
};

export function NewChannelType() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const form = useForm<NewChannelTypeForm>({ defaultValues });

  useEffect(() => {
    if (open) {
      form.reset(defaultValues);
    }
  }, [open, form]);

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      await createChannelTypeService({
        code: data.code,
        name: data.name,
        description: data.description,
        hooksQuantity: data.hooksQuantity,
      });

      form.reset(defaultValues);

      await queryClient.invalidateQueries({
        queryKey: [CHANNEL_TYPE_TAG],
      });

      toast.success("Tipo de canal creado exitosamente");
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
          Crear tipo de canal
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-screen overflow-y-auto w-[95vw] sm:max-w-[60vw]">
        <DialogHeader>
          <DialogTitle>Nuevo Tipo de Canal</DialogTitle>
          <DialogDescription>
            Define un nuevo tipo de canal de faenamiento con su cantidad de
            ganchos.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={onSubmit}
            className="space-y-8 grid grid-cols-1 gap-2"
          >
            <ChannelTypeFormFields />
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
