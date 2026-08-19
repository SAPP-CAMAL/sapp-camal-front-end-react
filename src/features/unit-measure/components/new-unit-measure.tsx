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
import { NewUnitMeasureFields } from "./unit-measure-form-fields";
import { createUnitMeasureService } from "../server/db/unit-measure-admin.service";
import { useEffect, useState } from "react";

export type NewUnitMeasureForm = {
  code: string;
  name: string;
  symbol: string;
  description: string;
  status: string;
};

const defaultValues: NewUnitMeasureForm = {
  code: "",
  name: "",
  symbol: "",
  description: "",
  status: "true",
};

export function NewUnitMeasure() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const form = useForm<NewUnitMeasureForm>({ defaultValues });

  useEffect(() => {
    if (open) {
      form.reset(defaultValues);
    }
  }, [open, form]);

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      await createUnitMeasureService({
        code: data.code,
        name: data.name,
        symbol: data.symbol,
        description: data.description || undefined,
        status: true,
      });

      form.reset(defaultValues);

      await queryClient.invalidateQueries({ queryKey: ["unit-measures-admin"] });

      toast.success("Unidad de medida creada exitosamente");
    } catch (error) {
      if (error instanceof HTTPError) {
        const { data } = await error.response.json<{ data: string }>();
        toast.error(data);
      } else {
        toast.error("No se pudo crear la unidad de medida");
      }
    }
  });

  return (
    <Dialog open={open} onOpenChange={(open) => setOpen(open)}>
      <DialogTrigger asChild>
        <Button>
          <PlusIcon />
          Crear unidad de medida
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-screen overflow-y-auto w-[95vw] sm:max-w-[60vw]">
        <DialogHeader>
          <DialogTitle>Nueva Unidad de Medida</DialogTitle>
          <DialogDescription>Registra una nueva unidad de medida usada en pesaje.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={onSubmit} className="space-y-8 grid grid-cols-1 gap-2">
            <NewUnitMeasureFields />
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
