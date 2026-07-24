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
import { NewParishFields } from "./parish-form-fields";
import { updateParishService } from "../server/db/locations-admin.service";
import { NewParishForm } from "./new-parish";
import { Parish } from "../domain/locations-admin.domain";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function UpdateParish({
  parish,
  fixedCantonId,
}: {
  parish: Parish;
  fixedCantonId?: number;
}) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const form = useForm<NewParishForm>();

  useEffect(() => {
    if (open) {
      form.reset({
        cantonId: parish.canton?.id,
        code: parish.code,
        name: parish.name,
        status: String(parish.status),
      });
    }
  }, [open, form, parish]);

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      await updateParishService(parish.id, {
        ...(form.formState.dirtyFields.cantonId && { cantonId: data.cantonId }),
        ...(form.formState.dirtyFields.code && { code: data.code }),
        ...(form.formState.dirtyFields.name && { name: data.name }),
        ...(form.formState.dirtyFields.status && { status: data.status === "true" }),
      });

      form.reset(form.formState.defaultValues);

      await queryClient.invalidateQueries({ queryKey: ["parishes-admin"] });

      toast.success("Parroquia actualizada exitosamente");
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
          Editar Parroquia
        </TooltipContent>
      </Tooltip>
      <DialogContent className="max-h-screen overflow-y-auto w-[95vw] sm:max-w-[60vw]">
        <DialogHeader>
          <DialogTitle>Editar Parroquia</DialogTitle>
          <DialogDescription>Modifica la información de la parroquia seleccionada.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={onSubmit} className="space-y-8 grid grid-cols-1 gap-2">
            <NewParishFields showStatus fixedCantonId={fixedCantonId} />
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
