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
import { DistributionProductFormFields } from "./distribution-product-form-fields";
import { updateDistributionProductService } from "../server/db/distribution-product.service";
import { NewDistributionProductForm } from "./new-distribution-product";
import { DistributionProduct } from "../domain/distribution-product.domain";
import { DISTRIBUTION_PRODUCTS_TAG } from "../constants/distribution-product.constants";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function UpdateDistributionProduct({
  distributionProduct,
}: {
  distributionProduct: DistributionProduct;
}) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const form = useForm<NewDistributionProductForm>();

  useEffect(() => {
    if (open) {
      form.reset({
        idShipping: distributionProduct.idShipping,
        idIntroducer: distributionProduct.idIntroducer,
        idOrigin: distributionProduct.idOrigin,
        startTime: distributionProduct.startTime?.slice(0, 5) ?? "",
        endTime: distributionProduct.endTime?.slice(0, 5) ?? "",
        withLoad: distributionProduct.withLoad,
        detailLoad: distributionProduct.detailLoad ?? "",
        commentary: distributionProduct.commentary ?? "",
        status: String(distributionProduct.status),
      });
    }
  }, [open, form, distributionProduct]);

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      await updateDistributionProductService(distributionProduct.id, {
        ...(form.formState.dirtyFields.idShipping && { idShipping: data.idShipping }),
        ...(form.formState.dirtyFields.idIntroducer && { idIntroducer: data.idIntroducer }),
        ...(form.formState.dirtyFields.idOrigin && { idOrigin: data.idOrigin }),
        ...(form.formState.dirtyFields.startTime && { startTime: data.startTime }),
        ...(form.formState.dirtyFields.endTime && { endTime: data.endTime || null }),
        ...(form.formState.dirtyFields.withLoad && { withLoad: data.withLoad }),
        ...(form.formState.dirtyFields.detailLoad && {
          detailLoad: data.withLoad ? data.detailLoad || null : null,
        }),
        ...(form.formState.dirtyFields.commentary && { commentary: data.commentary || null }),
        ...(form.formState.dirtyFields.status && { status: data.status === "true" }),
      });

      form.reset(form.formState.defaultValues);

      await queryClient.invalidateQueries({
        queryKey: [DISTRIBUTION_PRODUCTS_TAG],
      });

      toast.success("Despacho actualizado exitosamente");
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
        <TooltipContent side="top" align="center" sideOffset={5} avoidCollisions>
          Editar Despacho
        </TooltipContent>
      </Tooltip>
      <DialogContent className="max-h-screen overflow-y-auto w-[95vw] sm:max-w-[60vw]">
        <DialogHeader>
          <DialogTitle>Editar Despacho de Distribución</DialogTitle>
          <DialogDescription>
            Modifica la información del despacho seleccionado.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={onSubmit} className="space-y-8 grid grid-cols-1 gap-2">
            <DistributionProductFormFields showStatus />
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
