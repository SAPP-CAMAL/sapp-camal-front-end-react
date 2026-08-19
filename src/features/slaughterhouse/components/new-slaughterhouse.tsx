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
import { SlaughterhouseFormFields } from "./slaughterhouse-form-fields";
import { createSlaughterhouseService } from "../server/db/slaughterhouse.service";
import { useEffect, useState } from "react";

export type NewSlaughterhouseForm = {
  code: string;
  name: string;
  description: string;
  enablingCode: string;
};

const defaultValues: NewSlaughterhouseForm = {
  code: "",
  name: "",
  description: "",
  enablingCode: "",
};

export function NewSlaughterhouse() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const form = useForm<NewSlaughterhouseForm>({ defaultValues });

  useEffect(() => {
    if (open) {
      form.reset(defaultValues);
    }
  }, [open, form]);

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      await createSlaughterhouseService({
        code: data.code,
        name: data.name,
        description: data.description,
        enablingCode: data.enablingCode,
        status: true,
      });

      form.reset(defaultValues);
      setOpen(false);

      await queryClient.invalidateQueries({
        queryKey: ["slaughterhouse"],
      });

      toast.success("Configuración de camal creada exitosamente");
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
          Nueva configuración
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-screen overflow-y-auto min-w-[60vw]">
        <DialogHeader>
          <DialogTitle>Nueva Configuración del Camal</DialogTitle>
          <DialogDescription>
            Registra los datos institucionales base del camal. Al crear una
            nueva configuración con el mismo nombre, la anterior se
            desactivará automáticamente.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={onSubmit}
            className="space-y-8 grid grid-cols-1 gap-2"
          >
            <SlaughterhouseFormFields />
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
