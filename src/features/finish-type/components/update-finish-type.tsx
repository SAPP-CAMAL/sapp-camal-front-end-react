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
import { NewFinishTypeFields } from "./finish-type-form-fields";
import { updateFinishTypeService } from "../server/db/finish-type-admin.service";
import { NewFinishTypeForm } from "./new-finish-type";
import { FinishTypeAdmin } from "../domain/finish-type-admin.domain";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function UpdateFinishType({ finishType }: { finishType: FinishTypeAdmin }) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const form = useForm<NewFinishTypeForm>();

  useEffect(() => {
    if (open) {
      form.reset({
        idSpecie: finishType.idSpecie,
        name: finishType.name,
        code: finishType.code,
        status: String(finishType.status),
      });
    }
  }, [open, form, finishType]);

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      await updateFinishTypeService(finishType.id, {
        ...(form.formState.dirtyFields.idSpecie && { idSpecie: data.idSpecie }),
        ...(form.formState.dirtyFields.name && { name: data.name }),
        ...(form.formState.dirtyFields.code && { code: data.code }),
        ...(form.formState.dirtyFields.status && { status: data.status === "true" }),
      });

      form.reset(form.formState.defaultValues);

      await queryClient.invalidateQueries({ queryKey: ["finish-types-admin"] });

      toast.success("Tipo de acabado actualizado exitosamente");
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
          Editar Tipo de Acabado
        </TooltipContent>
      </Tooltip>
      <DialogContent className="max-h-screen overflow-y-auto w-[95vw] sm:max-w-[60vw]">
        <DialogHeader>
          <DialogTitle>Editar Tipo de Acabado</DialogTitle>
          <DialogDescription>Modifica la información del tipo de acabado seleccionado.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={onSubmit} className="space-y-8 grid grid-cols-1 gap-2">
            <NewFinishTypeFields showStatus />
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
