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
import { ProductDiseaseFormFields } from "./product-disease-form-fields";
import { createProductDiseaseService } from "../server/db/product-disease.service";
import { useEffect, useState } from "react";
import { PRODUCT_DISEASE_TAG } from "../constants/product-disease.constants";

export type NewProductDiseaseForm = {
  idProduct: number;
  idDisease: number;
  idDiseaseGroup: number;
  status: string;
};

const defaultValues: NewProductDiseaseForm = {
  idProduct: undefined as unknown as number,
  idDisease: undefined as unknown as number,
  idDiseaseGroup: undefined as unknown as number,
  status: "true",
};

export function NewProductDisease() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const form = useForm<NewProductDiseaseForm>({ defaultValues });

  useEffect(() => {
    if (open) {
      form.reset(defaultValues);
    }
  }, [open, form]);

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      await createProductDiseaseService({
        idProduct: data.idProduct,
        idDisease: data.idDisease,
        idDiseaseGroup: data.idDiseaseGroup,
      });

      form.reset(defaultValues);

      await queryClient.invalidateQueries({
        queryKey: [PRODUCT_DISEASE_TAG],
      });

      toast.success("Regla creada exitosamente");
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
          Crear regla
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-screen overflow-y-auto w-[95vw] sm:max-w-[60vw]">
        <DialogHeader>
          <DialogTitle>Nueva Regla Producto - Enfermedad</DialogTitle>
          <DialogDescription>
            Define una nueva regla de enfermedad aplicable a un producto.
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
                {form.formState.isSubmitting ? "Guardando..." : "Guardar"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
