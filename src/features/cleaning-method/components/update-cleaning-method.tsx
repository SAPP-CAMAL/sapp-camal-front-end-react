"use client";

import { useEffect, useState } from "react";
import { SquarePenIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { HTTPError } from "ky";

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
import { NewCleaningMethodFields } from "./cleaning-method-form-fields";
import { updateCleaningMethodService } from "../server/db/cleaning-method-admin.service";
import { NewCleaningMethodForm } from "./new-cleaning-method";
import { CleaningMethodAdmin } from "../domain/cleaning-method-admin.domain";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function UpdateCleaningMethod({ cleaningMethod }: { cleaningMethod: CleaningMethodAdmin }) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const form = useForm<NewCleaningMethodForm>();

  useEffect(() => {
    if (open) {
      form.reset({
        name: cleaningMethod.name,
        description: cleaningMethod.description ?? "",
        status: String(cleaningMethod.status),
      });
    }
  }, [open, form, cleaningMethod]);

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      await updateCleaningMethodService(cleaningMethod.id, {
        ...(form.formState.dirtyFields.name && { name: data.name }),
        ...(form.formState.dirtyFields.description && { description: data.description }),
        ...(form.formState.dirtyFields.status && { status: data.status === "true" }),
      });

      form.reset(form.formState.defaultValues);

      await queryClient.invalidateQueries({ queryKey: ["cleaning-methods-admin"] });

      toast.success("Método de limpieza actualizado exitosamente");
    } catch (error) {
      if (error instanceof HTTPError) {
        const { data } = await error.response.json<{ data: string }>();
        toast.error(data);
      } else {
        toast.error("No se pudo actualizar el método de limpieza");
      }
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
          Editar Método
        </TooltipContent>
      </Tooltip>
      <DialogContent className="max-h-screen overflow-y-auto w-[95vw] sm:max-w-[60vw]">
        <DialogHeader>
          <DialogTitle>Editar Método de Limpieza</DialogTitle>
          <DialogDescription>Modifica la información del método seleccionado.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={onSubmit} className="space-y-8 grid grid-cols-1 gap-2">
            <NewCleaningMethodFields showStatus />
            <div className="flex justify-end col-span-2 gap-x-2">
              <Button
                type="button"
                variant={"outline"}
                disabled={form.formState.isSubmitting}
                onClick={() => setOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting || form.formState.isLoading}>
                {form.formState.isSubmitting ? "Actualizando..." : "Actualizar"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
