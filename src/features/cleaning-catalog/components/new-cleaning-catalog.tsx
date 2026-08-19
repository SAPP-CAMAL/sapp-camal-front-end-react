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
import { CleaningCatalogFormFields } from "./cleaning-catalog-form-fields";
import { createCleaningCatalogService } from "../server/db/cleaning-catalog.service";
import { useEffect, useState } from "react";
import { CLEANING_CATALOG_TAG } from "../constants/cleaning-catalog.constants";

export type NewCleaningCatalogForm = {
  name: string;
  description: string;
  type: string;
  status: string;
};

const defaultValues: NewCleaningCatalogForm = {
  name: "",
  description: "",
  type: "",
  status: "true",
};

export function NewCleaningCatalog() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const form = useForm<NewCleaningCatalogForm>({ defaultValues });

  useEffect(() => {
    if (open) {
      form.reset(defaultValues);
    }
  }, [open, form]);

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      await createCleaningCatalogService({
        name: data.name,
        description: data.description || null,
        type: data.type || null,
      });

      form.reset(defaultValues);

      await queryClient.invalidateQueries({
        queryKey: [CLEANING_CATALOG_TAG],
      });

      toast.success("Ítem de limpieza creado exitosamente");
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
          Crear ítem de limpieza
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-screen overflow-y-auto w-[95vw] sm:max-w-[60vw]">
        <DialogHeader>
          <DialogTitle>Nuevo Ítem de Limpieza</DialogTitle>
          <DialogDescription>
            Define una nueva estructura, equipo, utensilio o material de
            limpieza.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={onSubmit}
            className="space-y-8 grid grid-cols-1 gap-2"
          >
            <CleaningCatalogFormFields />
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
