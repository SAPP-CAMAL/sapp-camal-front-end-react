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
import { ProductTypeFormFields } from "./product-type-form-fields";
import { updateProductTypeService } from "../server/db/product-type.service";
import { NewProductTypeForm } from "./new-product-type";
import { PRODUCT_TYPE_LIST_TAG } from "../constants";
import { ProductType } from "../domain";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function UpdateProductType({ productType }: { productType: ProductType }) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const form = useForm<NewProductTypeForm>();

  useEffect(() => {
    if (open) {
      form.reset({
        code: productType.code,
        typeName: productType.typeName,
        description: productType.description ?? "",
      });
    }
  }, [open, form, productType]);

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      await updateProductTypeService(productType.id, {
        ...(form.formState.dirtyFields.code && { code: data.code }),
        ...(form.formState.dirtyFields.typeName && { typeName: data.typeName }),
        ...(form.formState.dirtyFields.description && {
          description: data.description,
        }),
      });

      form.reset(form.formState.defaultValues);
      setOpen(false);

      await queryClient.invalidateQueries({
        queryKey: [PRODUCT_TYPE_LIST_TAG],
      });

      toast.success("Tipo de producto actualizado exitosamente");
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
      <DialogContent className="max-h-screen overflow-y-auto min-w-[50vw]">
        <DialogHeader>
          <DialogTitle>Editar Tipo de Producto</DialogTitle>
          <DialogDescription>
            Modifica el tipo de producto/subproducto cárnico.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={onSubmit}
            className="space-y-8 grid grid-cols-1 gap-2"
          >
            <ProductTypeFormFields />
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
