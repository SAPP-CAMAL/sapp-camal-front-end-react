"use client";

import { useEffect, useState } from "react";
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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RequiredMark } from "@/components/ui/required-mark";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { createBiosecurityLineService } from "../server/db/biosecurity-lines.service";
import { BIOSECURITY_LINES_TAG } from "../constants/biosecurity-lines.constants";

type NewBiosecurityLineForm = {
  name: string;
};

const defaultValues: NewBiosecurityLineForm = {
  name: "",
};

export function NewBiosecurityLine({ idLine }: { idLine: number }) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const form = useForm<NewBiosecurityLineForm>({ defaultValues });

  useEffect(() => {
    if (open) {
      form.reset(defaultValues);
    }
  }, [open, form]);

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      await createBiosecurityLineService({
        idLine,
        name: data.name,
      });

      form.reset(defaultValues);

      await queryClient.invalidateQueries({
        queryKey: [BIOSECURITY_LINES_TAG],
      });

      toast.success("Línea de bioseguridad creada exitosamente");
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
          Agregar línea de bioseguridad
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-screen overflow-y-auto w-[95vw] sm:max-w-[50vw]">
        <DialogHeader>
          <DialogTitle>Nueva Línea de Bioseguridad</DialogTitle>
          <DialogDescription>
            Define un nuevo perfil de bioseguridad para esta línea de
            producción (ej. distintos procesos dentro de la misma línea).
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={onSubmit} className="space-y-8 grid grid-cols-1 gap-2">
            <FormField
              control={form.control}
              name="name"
              rules={{
                required: { value: true, message: "El nombre es requerido" },
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre <RequiredMark /></FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-x-2">
              <Button
                type="button"
                variant={"outline"}
                disabled={form.formState.isSubmitting}
                onClick={() => setOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Guardando..." : "Guardar"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
