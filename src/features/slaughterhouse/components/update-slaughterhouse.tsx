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
import { SlaughterhouseFormFields } from "./slaughterhouse-form-fields";
import { updateSlaughterhouseService } from "../server/db/slaughterhouse.service";
import { NewSlaughterhouseForm } from "./new-slaughterhouse";
import { Slaughterhouse } from "../domain";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function UpdateSlaughterhouse({
  slaughterhouse,
}: {
  slaughterhouse: Slaughterhouse;
}) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const form = useForm<NewSlaughterhouseForm>();

  useEffect(() => {
    if (open) {
      form.reset({
        code: slaughterhouse.code,
        name: slaughterhouse.name,
        description: slaughterhouse.description,
        enablingCode: slaughterhouse.enablingCode,
      });
    }
  }, [open, form, slaughterhouse]);

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      await updateSlaughterhouseService(slaughterhouse.id, {
        ...(form.formState.dirtyFields.code && { code: data.code }),
        ...(form.formState.dirtyFields.name && { name: data.name }),
        ...(form.formState.dirtyFields.description && {
          description: data.description,
        }),
        ...(form.formState.dirtyFields.enablingCode && {
          enablingCode: data.enablingCode,
        }),
      });

      form.reset(form.formState.defaultValues);
      setOpen(false);

      await queryClient.invalidateQueries({
        queryKey: ["slaughterhouse"],
      });

      toast.success("Configuración de camal actualizada exitosamente");
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
            <Button variant={"outline"} size="icon">
              <SquarePenIcon className="h-4 w-4" />
            </Button>
          </DialogTrigger>
        </TooltipTrigger>
        <TooltipContent
          side="top"
          align="center"
          sideOffset={5}
          avoidCollisions
        >
          Editar configuración
        </TooltipContent>
      </Tooltip>
      <DialogContent className="max-h-screen overflow-y-auto min-w-[60vw]">
        <DialogHeader>
          <DialogTitle>Editar Configuración del Camal</DialogTitle>
          <DialogDescription>
            Modifica los datos institucionales base del camal.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={onSubmit}
            className="space-y-8 grid grid-cols-1 gap-2"
          >
            <SlaughterhouseFormFields />
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
