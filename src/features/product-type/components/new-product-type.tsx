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
import { ProductTypeFormFields } from "./product-type-form-fields";
import { createProductTypeService } from "../server/db/product-type.service";
import { PRODUCT_TYPE_LIST_TAG } from "../constants";
import { useEffect, useState } from "react";

export type NewProductTypeForm = {
  code: string;
  typeName: string;
  description: string;
};

const defaultValues: NewProductTypeForm = {
  code: "",
  typeName: "",
  description: "",
};

export function NewProductType() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const form = useForm<NewProductTypeForm>({ defaultValues });

  useEffect(() => {
    if (open) {
      form.reset(defaultValues);
    }
  }, [open, form]);

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      await createProductTypeService({
        code: data.code,
        typeName: data.typeName,
        description: data.description || undefined,
        status: true,
      });

      form.reset(defaultValues);
      setOpen(false);

      await queryClient.invalidateQueries({
        queryKey: [PRODUCT_TYPE_LIST_TAG],
      });

      toast.success("Tipo de producto creado exitosamente");
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
          Nuevo tipo de producto
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-screen overflow-y-auto min-w-[50vw]">
        <DialogHeader>
          <DialogTitle>Nuevo Tipo de Producto</DialogTitle>
          <DialogDescription>
            Registra un nuevo tipo de producto/subproducto cárnico.
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
                {form.formState.isSubmitting ? "Guardando..." : "Guardar"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
