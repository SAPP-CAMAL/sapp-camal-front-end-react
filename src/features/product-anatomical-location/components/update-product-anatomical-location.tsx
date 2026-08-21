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
import { ProductAnatomicalLocationFormFields } from "./product-anatomical-location-form-fields";
import { updateProductAnatomicalLocationService } from "../server/db/product-anatomical-location.service";
import { NewProductAnatomicalLocationForm } from "./new-product-anatomical-location";
import { ProductAnatomicalLocation } from "../domain/product-anatomical-location.domain";
import { PRODUCT_ANATOMICAL_LOCATION_TAG } from "../constants/product-anatomical-location.constants";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function UpdateProductAnatomicalLocation({
  productAnatomicalLocation,
}: {
  productAnatomicalLocation: ProductAnatomicalLocation;
}) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const form = useForm<NewProductAnatomicalLocationForm>();

  useEffect(() => {
    if (open) {
      form.reset({
        code: productAnatomicalLocation.code,
        name: productAnatomicalLocation.name,
        bodyRegion: productAnatomicalLocation.bodyRegion ?? "",
      });
    }
  }, [open, form, productAnatomicalLocation]);

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      await updateProductAnatomicalLocationService(
        productAnatomicalLocation.id,
        {
          ...(form.formState.dirtyFields.code && {
            code: data.code,
          }),
          ...(form.formState.dirtyFields.name && {
            name: data.name,
          }),
          ...(form.formState.dirtyFields.bodyRegion && {
            bodyRegion: data.bodyRegion,
          }),
        }
      );

      form.reset(form.formState.defaultValues);

      await queryClient.invalidateQueries({
        queryKey: [PRODUCT_ANATOMICAL_LOCATION_TAG],
      });

      toast.success("Ubicación anatómica actualizada exitosamente");
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
          Editar Ubicación Anatómica
        </TooltipContent>
      </Tooltip>
      <DialogContent className="max-h-screen overflow-y-auto w-[95vw] sm:max-w-[50vw]">
        <DialogHeader>
          <DialogTitle>Editar Ubicación Anatómica</DialogTitle>
          <DialogDescription>
            Modifica la ubicación anatómica seleccionada.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={onSubmit}
            className="space-y-8 grid grid-cols-1 gap-2"
          >
            <ProductAnatomicalLocationFormFields />
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
