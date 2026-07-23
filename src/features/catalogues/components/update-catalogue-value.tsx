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
import { NewCatalogueValueFields } from "./catalogue-value-form-fields";
import { updateCatalogueValueService } from "../server/db/catalogue-management.service";
import { NewCatalogueValueForm } from "./new-catalogue-value";
import { CatalogueValue } from "../domain/catalogue-management.domain";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function UpdateCatalogueValue({
  value,
  fixedCatalogueTypeId,
}: {
  value: CatalogueValue;
  fixedCatalogueTypeId?: number;
}) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const form = useForm<NewCatalogueValueForm>();

  useEffect(() => {
    if (open) {
      form.reset({
        catalogueTypeId: value.catalogueTypeId,
        parentId: value.parentId,
        code: value.code,
        name: value.name,
        description: value.description,
      });
    }
  }, [open, form, value]);

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      await updateCatalogueValueService(value.id, {
        ...(form.formState.dirtyFields.catalogueTypeId && { catalogueTypeId: data.catalogueTypeId }),
        ...(form.formState.dirtyFields.parentId && { parentId: data.parentId }),
        ...(form.formState.dirtyFields.code && { code: data.code }),
        ...(form.formState.dirtyFields.name && { name: data.name }),
        ...(form.formState.dirtyFields.description && { description: data.description }),
      });

      form.reset(form.formState.defaultValues);

      await queryClient.invalidateQueries({ queryKey: ["catalogue-values"] });

      toast.success("Valor de catálogo actualizado exitosamente");
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
          Editar Valor
        </TooltipContent>
      </Tooltip>
      <DialogContent className="max-h-screen overflow-y-auto w-[95vw] sm:max-w-[60vw]">
        <DialogHeader>
          <DialogTitle>Editar Valor de Catálogo</DialogTitle>
          <DialogDescription>
            Modifica la información del valor seleccionado.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={onSubmit} className="space-y-8 grid grid-cols-1 gap-2">
            <NewCatalogueValueFields excludeCatalogueId={value.id} fixedCatalogueTypeId={fixedCatalogueTypeId} />
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
                disabled={form.formState.isSubmitting || form.formState.isLoading}
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
