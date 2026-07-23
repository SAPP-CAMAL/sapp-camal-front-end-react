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
import { NewCatalogueValueFields } from "./catalogue-value-form-fields";
import { createCatalogueValueService } from "../server/db/catalogue-management.service";
import { useEffect, useState } from "react";

export type NewCatalogueValueForm = {
  catalogueTypeId: number;
  parentId: number | null;
  code: string;
  name: string;
  description: string;
};

const baseDefaultValues: NewCatalogueValueForm = {
  catalogueTypeId: 0,
  parentId: null,
  code: "",
  name: "",
  description: "",
};

export function NewCatalogueValue({ fixedCatalogueTypeId }: { fixedCatalogueTypeId?: number } = {}) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const defaultValues: NewCatalogueValueForm = {
    ...baseDefaultValues,
    ...(fixedCatalogueTypeId && { catalogueTypeId: fixedCatalogueTypeId }),
  };

  const form = useForm<NewCatalogueValueForm>({ defaultValues });

  useEffect(() => {
    if (open) {
      form.reset(defaultValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, form]);

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      await createCatalogueValueService({
        catalogueTypeId: data.catalogueTypeId,
        parentId: data.parentId,
        code: data.code,
        name: data.name,
        description: data.description,
        status: true,
      });

      form.reset(defaultValues);

      await queryClient.invalidateQueries({ queryKey: ["catalogue-values"] });

      toast.success("Valor de catálogo creado exitosamente");
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
          Crear valor
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-screen overflow-y-auto w-[95vw] sm:max-w-[60vw]">
        <DialogHeader>
          <DialogTitle>Nuevo Valor de Catálogo</DialogTitle>
          <DialogDescription>
            Define un nuevo valor dentro del tipo de catálogo seleccionado.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={onSubmit} className="space-y-8 grid grid-cols-1 gap-2">
            <NewCatalogueValueFields fixedCatalogueTypeId={fixedCatalogueTypeId} />
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
                disabled={form.formState.isSubmitting || form.formState.isLoading}
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
