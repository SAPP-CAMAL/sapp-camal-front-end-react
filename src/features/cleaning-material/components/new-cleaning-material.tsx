"use client";

import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { HTTPError } from "ky";
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
import { NewCleaningMaterialFields } from "./cleaning-material-form-fields";
import { createCleaningMaterialService } from "../server/db/cleaning-material-admin.service";
import { useEffect, useState } from "react";

export type NewCleaningMaterialForm = {
  name: string;
  description: string;
  status: string;
};

const defaultValues: NewCleaningMaterialForm = {
  name: "",
  description: "",
  status: "true",
};

export function NewCleaningMaterial() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const form = useForm<NewCleaningMaterialForm>({ defaultValues });

  useEffect(() => {
    if (open) {
      form.reset(defaultValues);
    }
  }, [open, form]);

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      await createCleaningMaterialService({
        name: data.name,
        description: data.description || undefined,
        status: true,
      });

      form.reset(defaultValues);

      await queryClient.invalidateQueries({ queryKey: ["cleaning-materials-admin"] });

      toast.success("Material de limpieza creado exitosamente");
    } catch (error) {
      if (error instanceof HTTPError) {
        const { data } = await error.response.json<{ data: string }>();
        toast.error(data);
      } else {
        toast.error("No se pudo crear el material de limpieza");
      }
    }
  });

  return (
    <Dialog open={open} onOpenChange={(open) => setOpen(open)}>
      <DialogTrigger asChild>
        <Button>
          <PlusIcon />
          Crear material
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-screen overflow-y-auto w-[95vw] sm:max-w-[60vw]">
        <DialogHeader>
          <DialogTitle>Nuevo Material de Limpieza</DialogTitle>
          <DialogDescription>Registra un nuevo material usado en dosificación de limpieza.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={onSubmit} className="space-y-8 grid grid-cols-1 gap-2">
            <NewCleaningMaterialFields />
            <div className="flex justify-end col-span-2 gap-x-2">
              <Button
                type="button"
                variant={"outline"}
                disabled={form.formState.isSubmitting}
                onClick={() => setOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting || form.formState.isLoading}>
                {form.formState.isSubmitting ? "Guardando..." : "Guardar"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
