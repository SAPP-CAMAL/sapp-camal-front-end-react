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
import { ProductDiseaseFormFields } from "./product-disease-form-fields";
import { updateProductDiseaseService } from "../server/db/product-disease.service";
import { NewProductDiseaseForm } from "./new-product-disease";
import { ProductDisease } from "../domain/product-disease.domain";
import { PRODUCT_DISEASE_TAG } from "../constants/product-disease.constants";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function UpdateProductDisease({
  productDisease,
}: {
  productDisease: ProductDisease;
}) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const form = useForm<NewProductDiseaseForm>();

  useEffect(() => {
    if (open) {
      form.reset({
        idProduct: productDisease.idProduct,
        idDisease: productDisease.idDisease,
        idDiseaseGroup: productDisease.idDiseaseGroup,
      });
    }
  }, [open, form, productDisease]);

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      await updateProductDiseaseService(productDisease.id, {
        ...(form.formState.dirtyFields.idProduct && {
          idProduct: data.idProduct,
        }),
        ...(form.formState.dirtyFields.idDisease && {
          idDisease: data.idDisease,
        }),
        ...(form.formState.dirtyFields.idDiseaseGroup && {
          idDiseaseGroup: data.idDiseaseGroup,
        }),
      });

      form.reset(form.formState.defaultValues);

      await queryClient.invalidateQueries({
        queryKey: [PRODUCT_DISEASE_TAG],
      });

      toast.success("Regla actualizada exitosamente");
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
          Editar Regla
        </TooltipContent>
      </Tooltip>
      <DialogContent className="max-h-screen overflow-y-auto w-[95vw] sm:max-w-[60vw]">
        <DialogHeader>
          <DialogTitle>Editar Regla Producto - Enfermedad</DialogTitle>
          <DialogDescription>
            Modifica la regla seleccionada.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={onSubmit}
            className="space-y-8 grid grid-cols-1 gap-2"
          >
            <ProductDiseaseFormFields />
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
