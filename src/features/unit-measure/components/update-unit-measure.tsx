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
import { NewUnitMeasureFields } from "./unit-measure-form-fields";
import { updateUnitMeasureService } from "../server/db/unit-measure-admin.service";
import { NewUnitMeasureForm } from "./new-unit-measure";
import { UnitMeasureAdmin } from "../domain/unit-measure-admin.domain";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function UpdateUnitMeasure({ unitMeasure }: { unitMeasure: UnitMeasureAdmin }) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const form = useForm<NewUnitMeasureForm>();

  useEffect(() => {
    if (open) {
      form.reset({
        code: unitMeasure.code,
        name: unitMeasure.name,
        symbol: unitMeasure.symbol,
        description: unitMeasure.description ?? "",
        status: String(unitMeasure.status),
      });
    }
  }, [open, form, unitMeasure]);

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      await updateUnitMeasureService(unitMeasure.id, {
        ...(form.formState.dirtyFields.code && { code: data.code }),
        ...(form.formState.dirtyFields.name && { name: data.name }),
        ...(form.formState.dirtyFields.symbol && { symbol: data.symbol }),
        ...(form.formState.dirtyFields.description && { description: data.description }),
        ...(form.formState.dirtyFields.status && { status: data.status === "true" }),
      });

      form.reset(form.formState.defaultValues);

      await queryClient.invalidateQueries({ queryKey: ["unit-measures-admin"] });

      toast.success("Unidad de medida actualizada exitosamente");
    } catch (error) {
      if (error instanceof HTTPError) {
        const { data } = await error.response.json<{ data: string }>();
        toast.error(data);
      } else {
        toast.error("No se pudo actualizar la unidad de medida");
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
          Editar Unidad de Medida
        </TooltipContent>
      </Tooltip>
      <DialogContent className="max-h-screen overflow-y-auto w-[95vw] sm:max-w-[60vw]">
        <DialogHeader>
          <DialogTitle>Editar Unidad de Medida</DialogTitle>
          <DialogDescription>Modifica la información de la unidad de medida seleccionada.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={onSubmit} className="space-y-8 grid grid-cols-1 gap-2">
            <NewUnitMeasureFields showStatus />
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
