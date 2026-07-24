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
import { NewCantonFields } from "./canton-form-fields";
import { updateCantonService } from "../server/db/locations-admin.service";
import { NewCantonForm } from "./new-canton";
import { Canton } from "../domain/locations-admin.domain";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function UpdateCanton({
  canton,
  fixedProvinceId,
}: {
  canton: Canton;
  fixedProvinceId?: number;
}) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const form = useForm<NewCantonForm>();

  useEffect(() => {
    if (open) {
      form.reset({
        provinceId: canton.province?.id,
        code: canton.code,
        name: canton.name,
        status: String(canton.status),
      });
    }
  }, [open, form, canton]);

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      await updateCantonService(canton.id, {
        ...(form.formState.dirtyFields.provinceId && { provinceId: data.provinceId }),
        ...(form.formState.dirtyFields.code && { code: data.code }),
        ...(form.formState.dirtyFields.name && { name: data.name }),
        ...(form.formState.dirtyFields.status && { status: data.status === "true" }),
      });

      form.reset(form.formState.defaultValues);

      await queryClient.invalidateQueries({ queryKey: ["cantons-admin"] });

      toast.success("Cantón actualizado exitosamente");
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
          Editar Cantón
        </TooltipContent>
      </Tooltip>
      <DialogContent className="max-h-screen overflow-y-auto w-[95vw] sm:max-w-[60vw]">
        <DialogHeader>
          <DialogTitle>Editar Cantón</DialogTitle>
          <DialogDescription>Modifica la información del cantón seleccionado.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={onSubmit} className="space-y-8 grid grid-cols-1 gap-2">
            <NewCantonFields showStatus fixedProvinceId={fixedProvinceId} />
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
