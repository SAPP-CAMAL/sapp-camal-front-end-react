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
import { NewCorralGroupFields } from "./corral-group-form-fields";
import { updateCorralGroupService } from "../server/db/corral-group-admin.service";
import { NewCorralGroupForm } from "./new-corral-group";
import { CorralGroupAdmin } from "../domain/corral-group-admin.domain";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function UpdateCorralGroup({ corralGroup }: { corralGroup: CorralGroupAdmin }) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const form = useForm<NewCorralGroupForm>();

  useEffect(() => {
    if (open) {
      form.reset({
        name: corralGroup.name,
        description: corralGroup.description ?? "",
        idLine: corralGroup.idLine,
        idFinishType: corralGroup.idFinishType ?? null,
        order: corralGroup.order,
        status: String(corralGroup.status),
      });
    }
  }, [open, form, corralGroup]);

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      await updateCorralGroupService(corralGroup.id, {
        ...(form.formState.dirtyFields.name && { name: data.name }),
        ...(form.formState.dirtyFields.description && { description: data.description }),
        ...(form.formState.dirtyFields.idLine && { idLine: data.idLine }),
        ...(form.formState.dirtyFields.idFinishType && { idFinishType: data.idFinishType }),
        ...(form.formState.dirtyFields.order && { order: data.order }),
        ...(form.formState.dirtyFields.status && { status: data.status === "true" }),
      });

      form.reset(form.formState.defaultValues);

      await queryClient.invalidateQueries({ queryKey: ["corral-groups-admin"] });

      toast.success("Grupo de corrales actualizado exitosamente");
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
          Editar Grupo
        </TooltipContent>
      </Tooltip>
      <DialogContent className="max-h-screen overflow-y-auto w-[95vw] sm:max-w-[60vw]">
        <DialogHeader>
          <DialogTitle>Editar Grupo de Corrales</DialogTitle>
          <DialogDescription>Modifica la información del grupo seleccionado.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={onSubmit} className="space-y-8 grid grid-cols-1 gap-2">
            <NewCorralGroupFields showStatus />
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
