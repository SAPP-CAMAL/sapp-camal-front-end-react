"use client";

import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { DistributionProductFormFields } from "./distribution-product-form-fields";
import { createDistributionProductService } from "../server/db/distribution-product.service";
import { useEffect, useState } from "react";
import { DISTRIBUTION_PRODUCTS_TAG } from "../constants/distribution-product.constants";

export type NewDistributionProductForm = {
  idShipping: number;
  idIntroducer: number;
  idOrigin: number;
  startTime: string;
  endTime: string;
  withLoad: boolean;
  detailLoad: string;
  commentary: string;
};

const defaultValues: NewDistributionProductForm = {
  idShipping: undefined as unknown as number,
  idIntroducer: undefined as unknown as number,
  idOrigin: undefined as unknown as number,
  startTime: "",
  endTime: "",
  withLoad: false,
  detailLoad: "",
  commentary: "",
};

export function NewDistributionProduct() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const form = useForm<NewDistributionProductForm>({ defaultValues });

  useEffect(() => {
    if (open) {
      form.reset(defaultValues);
    }
  }, [open, form]);

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      await createDistributionProductService({
        idShipping: data.idShipping,
        idIntroducer: data.idIntroducer,
        idOrigin: data.idOrigin,
        startTime: data.startTime,
        endTime: data.endTime || null,
        withLoad: data.withLoad,
        detailLoad: data.withLoad ? data.detailLoad || null : null,
        commentary: data.commentary || null,
      });

      form.reset(defaultValues);

      await queryClient.invalidateQueries({
        queryKey: [DISTRIBUTION_PRODUCTS_TAG],
      });

      toast.success("Despacho creado exitosamente");
      setOpen(false);
    } catch (error: any) {
      const { data } = await error.response.json();
      toast.error(data);
    }
  });

  return (
    <Dialog open={open} onOpenChange={(open) => setOpen(open)}>
      <DialogTrigger asChild>
        <Button>
          <PlusIcon />
          Nuevo despacho
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-screen overflow-y-auto w-[95vw] sm:max-w-[60vw]">
        <DialogHeader>
          <DialogTitle>Nuevo Despacho de Distribución</DialogTitle>
          <DialogDescription>
            Registra un nuevo despacho de productos, asociado a un envío,
            introductor y origen.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={onSubmit}
            className="space-y-8 grid grid-cols-1 gap-2"
          >
            <DistributionProductFormFields />
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
                {form.formState.isSubmitting ? "Guardando..." : "Guardar"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
