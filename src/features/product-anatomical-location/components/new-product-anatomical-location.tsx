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
import { ProductAnatomicalLocationFormFields } from "./product-anatomical-location-form-fields";
import { createProductAnatomicalLocationService } from "../server/db/product-anatomical-location.service";
import { useEffect, useState } from "react";
import { PRODUCT_ANATOMICAL_LOCATION_TAG } from "../constants/product-anatomical-location.constants";

export type NewProductAnatomicalLocationForm = {
  code: string;
  name: string;
  bodyRegion: string;
};

const defaultValues: NewProductAnatomicalLocationForm = {
  code: "",
  name: "",
  bodyRegion: "",
};

export function NewProductAnatomicalLocation({
  idProduct,
}: {
  idProduct: number;
}) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const form = useForm<NewProductAnatomicalLocationForm>({ defaultValues });

  useEffect(() => {
    if (open) {
      form.reset(defaultValues);
    }
  }, [open, form]);

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      await createProductAnatomicalLocationService({
        code: data.code,
        name: data.name,
        bodyRegion: data.bodyRegion,
        idProduct,
      });

      form.reset(defaultValues);

      await queryClient.invalidateQueries({
        queryKey: [PRODUCT_ANATOMICAL_LOCATION_TAG],
      });

      toast.success("Ubicación anatómica creada exitosamente");
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
          Nueva ubicación anatómica
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-screen overflow-y-auto w-[95vw] sm:max-w-[50vw]">
        <DialogHeader>
          <DialogTitle>Nueva Ubicación Anatómica</DialogTitle>
          <DialogDescription>
            Define una nueva ubicación anatómica para este producto.
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
                {form.formState.isSubmitting ? "Guardando..." : "Guardar"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
