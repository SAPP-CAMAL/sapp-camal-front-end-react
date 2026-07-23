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
import { NewModuleFields } from "./module-form-fields";
import { updateModuleService } from "../server/db/modules.service";
import { NewModuleForm } from "./new-module";
import { Module } from "../domain/module.domain";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function UpdateModule({ module }: { module: Module }) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const form = useForm<NewModuleForm>();

  useEffect(() => {
    if (open) {
      form.reset({
        name: module.name,
        description: module.description,
        status: String(module.status),
      });
    }
  }, [open, form, module]);

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      await updateModuleService(module.id, {
        ...(form.formState.dirtyFields.name && {
          name: data.name,
        }),
        ...(form.formState.dirtyFields.description && {
          description: data.description,
        }),
        ...(form.formState.dirtyFields.status && {
          status: data.status === "true",
        }),
      });

      form.reset(form.formState.defaultValues);

      await queryClient.invalidateQueries({
        queryKey: ["modules"],
      });

      toast.success("Módulo actualizado exitosamente");
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
        <TooltipContent side="top" align="center" sideOffset={5} avoidCollisions>
          Editar Módulo
        </TooltipContent>
      </Tooltip>
      <DialogContent className="max-h-screen overflow-y-auto w-[95vw] sm:max-w-[60vw]">
        <DialogHeader>
          <DialogTitle>Editar Módulo del Sistema</DialogTitle>
          <DialogDescription>
            Modifica la información del módulo seleccionado.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={onSubmit}
            className="space-y-8 grid grid-cols-1 gap-2"
          >
            <NewModuleFields showStatus />
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
