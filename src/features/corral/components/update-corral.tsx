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
import { NewCorralFields } from "./corral-form-fields";
import { updateCorralAdminService } from "../server/db/corral-admin.service";
import { NewCorralForm } from "./new-corral";
import { CorralAdmin } from "../domain/corral-admin.domain";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function UpdateCorral({ corral }: { corral: CorralAdmin }) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const form = useForm<NewCorralForm>();

  useEffect(() => {
    if (open) {
      form.reset({
        idCorralType: corral.idCorralType,
        name: corral.name,
        description: corral.description ?? "",
        minimumQuantity: corral.minimumQuantity,
        maximumQuantity: corral.maximumQuantity,
        status: String(corral.status),
      });
    }
  }, [open, form, corral]);

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      await updateCorralAdminService(corral.id, {
        ...(form.formState.dirtyFields.idCorralType && { idCorralType: data.idCorralType }),
        ...(form.formState.dirtyFields.name && { name: data.name }),
        ...(form.formState.dirtyFields.description && { description: data.description }),
        ...(form.formState.dirtyFields.minimumQuantity && { minimumQuantity: data.minimumQuantity }),
        ...(form.formState.dirtyFields.maximumQuantity && { maximumQuantity: data.maximumQuantity }),
        ...(form.formState.dirtyFields.status && { status: data.status === "true" }),
      });

      form.reset(form.formState.defaultValues);

      await queryClient.invalidateQueries({ queryKey: ["corrals-admin"] });

      toast.success("Corral actualizado exitosamente");
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
          Editar Corral
        </TooltipContent>
      </Tooltip>
      <DialogContent className="max-h-screen overflow-y-auto w-[95vw] sm:max-w-[60vw]">
        <DialogHeader>
          <DialogTitle>Editar Corral</DialogTitle>
          <DialogDescription>Modifica la información del corral seleccionado.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={onSubmit} className="space-y-8 grid grid-cols-1 gap-2">
            <NewCorralFields showStatus />
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
