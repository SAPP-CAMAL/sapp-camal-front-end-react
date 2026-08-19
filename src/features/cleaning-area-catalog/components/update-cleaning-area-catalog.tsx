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
import { CleaningAreaCatalogFormFields } from "./cleaning-area-catalog-form-fields";
import { updateCleaningAreaCatalogService } from "../server/db/cleaning-area-catalog.service";
import { NewCleaningAreaCatalogForm } from "./new-cleaning-area-catalog";
import { CleaningAreaCatalog } from "../domain/cleaning-area-catalog.domain";
import { CLEANING_AREA_CATALOG_TAG } from "../constants/cleaning-area-catalog.constants";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function UpdateCleaningAreaCatalog({
  areaCatalog,
}: {
  areaCatalog: CleaningAreaCatalog;
}) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const form = useForm<NewCleaningAreaCatalogForm>();

  useEffect(() => {
    if (open) {
      form.reset({
        name: areaCatalog.name,
        description: areaCatalog.description ?? "",
        orderIndex: areaCatalog.orderIndex ?? (undefined as unknown as number),
        status: String(areaCatalog.status),
      });
    }
  }, [open, form, areaCatalog]);

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      await updateCleaningAreaCatalogService(areaCatalog.id, {
        ...(form.formState.dirtyFields.name && {
          name: data.name,
        }),
        ...(form.formState.dirtyFields.description && {
          description: data.description || null,
        }),
        ...(form.formState.dirtyFields.orderIndex && {
          orderIndex: Number.isNaN(data.orderIndex) ? null : data.orderIndex,
        }),
        ...(form.formState.dirtyFields.status && {
          status: data.status === "true",
        }),
      });

      form.reset(form.formState.defaultValues);

      await queryClient.invalidateQueries({
        queryKey: [CLEANING_AREA_CATALOG_TAG],
      });

      toast.success("Área de limpieza actualizada exitosamente");
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
          Editar Área de Limpieza
        </TooltipContent>
      </Tooltip>
      <DialogContent className="max-h-screen overflow-y-auto w-[95vw] sm:max-w-[60vw]">
        <DialogHeader>
          <DialogTitle>Editar Área de Limpieza</DialogTitle>
          <DialogDescription>
            Modifica la información del área de limpieza seleccionada.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={onSubmit}
            className="space-y-8 grid grid-cols-1 gap-2"
          >
            <CleaningAreaCatalogFormFields showStatus />
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
