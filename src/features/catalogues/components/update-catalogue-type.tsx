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
import { NewCatalogueTypeFields } from "./catalogue-type-form-fields";
import { updateCatalogueTypeService } from "../server/db/catalogue-management.service";
import { NewCatalogueTypeForm } from "./new-catalogue-type";
import { CatalogueType } from "../domain/catalogue-management.domain";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function UpdateCatalogueType({ catalogueType }: { catalogueType: CatalogueType }) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const form = useForm<NewCatalogueTypeForm>();

  useEffect(() => {
    if (open) {
      form.reset({
        code: catalogueType.code,
        description: catalogueType.description,
        status: String(catalogueType.status),
      });
    }
  }, [open, form, catalogueType]);

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      await updateCatalogueTypeService(catalogueType.id, {
        ...(form.formState.dirtyFields.code && { code: data.code }),
        ...(form.formState.dirtyFields.description && { description: data.description }),
        ...(form.formState.dirtyFields.status && { status: data.status === "true" }),
      });

      form.reset(form.formState.defaultValues);

      await queryClient.invalidateQueries({ queryKey: ["catalogue-types"] });

      toast.success("Tipo de catálogo actualizado exitosamente");
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
          Editar Tipo de Catálogo
        </TooltipContent>
      </Tooltip>
      <DialogContent className="max-h-screen overflow-y-auto w-[95vw] sm:max-w-[60vw]">
        <DialogHeader>
          <DialogTitle>Editar Tipo de Catálogo</DialogTitle>
          <DialogDescription>
            Modifica la información del tipo de catálogo seleccionado.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={onSubmit} className="space-y-8 grid grid-cols-1 gap-2">
            <NewCatalogueTypeFields showStatus />
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
