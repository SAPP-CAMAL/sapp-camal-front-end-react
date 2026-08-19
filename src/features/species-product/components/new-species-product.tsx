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
import { SpeciesProductFormFields } from "./species-product-form-fields";
import { createSpeciesProductService } from "../server/db/species-product.service";
import { SPECIES_PRODUCT_LIST_TAG } from "../constants";
import { useEffect, useState } from "react";

export type NewSpeciesProductForm = {
  idSpecies: string;
  idProductType: string;
  idAnimalSex: string;
  productName: string;
  productCode: string;
  displayOrder: string;
};

const defaultValues: NewSpeciesProductForm = {
  idSpecies: "",
  idProductType: "",
  idAnimalSex: "none",
  productName: "",
  productCode: "",
  displayOrder: "1",
};

export function NewSpeciesProduct() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const form = useForm<NewSpeciesProductForm>({ defaultValues });

  useEffect(() => {
    if (open) {
      form.reset(defaultValues);
    }
  }, [open, form]);

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      await createSpeciesProductService({
        idSpecies: Number(data.idSpecies),
        idProductType: Number(data.idProductType),
        idAnimalSex:
          data.idAnimalSex === "none" ? undefined : Number(data.idAnimalSex),
        productName: data.productName,
        productCode: data.productCode,
        displayOrder: data.displayOrder ? Number(data.displayOrder) : undefined,
        status: true,
      });

      form.reset(defaultValues);
      setOpen(false);

      await queryClient.invalidateQueries({
        queryKey: [SPECIES_PRODUCT_LIST_TAG],
      });

      toast.success("Producto por especie creado exitosamente");
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
          Nuevo producto por especie
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-screen overflow-y-auto min-w-[60vw]">
        <DialogHeader>
          <DialogTitle>Nuevo Producto por Especie</DialogTitle>
          <DialogDescription>
            Define un nuevo producto disponible para una especie y sexo de
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
                {form.formState.isSubmitting ? "Guardando..." : "Guardar"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
