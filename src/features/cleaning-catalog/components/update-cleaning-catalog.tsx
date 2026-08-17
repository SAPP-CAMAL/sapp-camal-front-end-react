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
import { CleaningCatalogFormFields } from "./cleaning-catalog-form-fields";
import { updateCleaningCatalogService } from "../server/db/cleaning-catalog.service";
import { NewCleaningCatalogForm } from "./new-cleaning-catalog";
import { CleaningCatalog } from "../domain/cleaning-catalog.domain";
import { CLEANING_CATALOG_TAG } from "../constants/cleaning-catalog.constants";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function UpdateCleaningCatalog({
  cleaningCatalog,
}: {
  cleaningCatalog: CleaningCatalog;
}) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const form = useForm<NewCleaningCatalogForm>();

  useEffect(() => {
    if (open) {
      form.reset({
        name: cleaningCatalog.name,
        description: cleaningCatalog.description ?? "",
        type: cleaningCatalog.type ?? "",
        status: String(cleaningCatalog.status),
      });
    }
  }, [open, form, cleaningCatalog]);

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      await updateCleaningCatalogService(cleaningCatalog.id, {
        ...(form.formState.dirtyFields.name && {
          name: data.name,
        }),
        ...(form.formState.dirtyFields.description && {
          description: data.description || null,
        }),
        ...(form.formState.dirtyFields.type && {
          type: data.type || null,
        }),
        ...(form.formState.dirtyFields.status && {
          status: data.status === "true",
        }),
      });

      form.reset(form.formState.defaultValues);

      await queryClient.invalidateQueries({
        queryKey: [CLEANING_CATALOG_TAG],
      });

      toast.success("Ítem de limpieza actualizado exitosamente");
      setOpen(false);
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
        <TooltipContent
          side="top"
          align="center"
          sideOffset={5}
          avoidCollisions
        >
          Editar Ítem de Limpieza
        </TooltipContent>
      </Tooltip>
      <DialogContent className="max-h-screen overflow-y-auto w-[95vw] sm:max-w-[60vw]">
        <DialogHeader>
          <DialogTitle>Editar Ítem de Limpieza</DialogTitle>
          <DialogDescription>
            Modifica la información del ítem de limpieza seleccionado.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={onSubmit}
            className="space-y-8 grid grid-cols-1 gap-2"
          >
            <CleaningCatalogFormFields showStatus />
            <div className="flex justify-end gap-x-2">
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
