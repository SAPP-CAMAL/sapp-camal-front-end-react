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
import { SpeciesProductFormFields } from "./species-product-form-fields";
import { updateSpeciesProductService } from "../server/db/species-product.service";
import { NewSpeciesProductForm } from "./new-species-product";
import { SPECIES_PRODUCT_LIST_TAG } from "../constants";
import { SpeciesProduct } from "../domain";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function UpdateSpeciesProduct({
  speciesProduct,
}: {
  speciesProduct: SpeciesProduct;
}) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const form = useForm<NewSpeciesProductForm>();

  useEffect(() => {
    if (open) {
      form.reset({
        idSpecies: String(speciesProduct.idSpecies),
        idProductType: String(speciesProduct.idProductType),
        idAnimalSex: speciesProduct.idAnimalSex
          ? String(speciesProduct.idAnimalSex)
          : "none",
        productName: speciesProduct.productName,
        productCode: speciesProduct.productCode,
        displayOrder: String(speciesProduct.displayOrder ?? 1),
      });
    }
  }, [open, form, speciesProduct]);

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      const dirty = form.formState.dirtyFields;
      await updateSpeciesProductService(speciesProduct.id, {
        ...(dirty.idSpecies && { idSpecies: Number(data.idSpecies) }),
        ...(dirty.idProductType && {
          idProductType: Number(data.idProductType),
        }),
        ...(dirty.idAnimalSex && {
          idAnimalSex:
            data.idAnimalSex === "none" ? null : Number(data.idAnimalSex),
        }),
        ...(dirty.productName && { productName: data.productName }),
        ...(dirty.productCode && { productCode: data.productCode }),
        ...(dirty.displayOrder && {
          displayOrder: Number(data.displayOrder),
        }),
      });

      form.reset(form.formState.defaultValues);
      setOpen(false);

      await queryClient.invalidateQueries({
        queryKey: [SPECIES_PRODUCT_LIST_TAG],
      });

      toast.success("Producto por especie actualizado exitosamente");
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
            <Button variant={"outline"} size="icon">
              <SquarePenIcon className="h-4 w-4" />
            </Button>
          </DialogTrigger>
        </TooltipTrigger>
        <TooltipContent
          side="top"
          align="center"
          sideOffset={5}
          avoidCollisions
        >
          Editar
        </TooltipContent>
      </Tooltip>
      <DialogContent className="max-h-screen overflow-y-auto min-w-[60vw]">
        <DialogHeader>
          <DialogTitle>Editar Producto por Especie</DialogTitle>
          <DialogDescription>
            Modifica el producto disponible para una especie y sexo de
            animal.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={onSubmit}
            className="space-y-8 grid grid-cols-1 gap-2"
          >
            <SpeciesProductFormFields />
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
