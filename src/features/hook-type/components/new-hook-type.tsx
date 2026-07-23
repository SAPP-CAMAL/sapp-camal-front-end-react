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
import { HookTypeFormFields } from "./hook-type-form-fields";
import { createHookTypeService } from "../server/db/hook-type.service";
import { useEffect, useState } from "react";
import { HOOK_TYPE_TAG } from "../constants/hook-type.constants";

export type NewHookTypeForm = {
  name: string;
  weight: number;
  description: string;
  idSpecie: number;
};

const defaultValues: NewHookTypeForm = {
  name: "",
  weight: 0,
  description: "",
  idSpecie: 0,
};

export function NewHookType() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const form = useForm<NewHookTypeForm>({ defaultValues });

  useEffect(() => {
    if (open) {
      form.reset(defaultValues);
    }
  }, [open, form]);

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      await createHookTypeService({
        name: data.name,
        weight: data.weight,
        description: data.description,
        idSpecie: data.idSpecie,
      });

      form.reset(defaultValues);

      await queryClient.invalidateQueries({
        queryKey: [HOOK_TYPE_TAG],
      });

      toast.success("Tipo de gancho creado exitosamente");
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
          Crear tipo de gancho
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-screen overflow-y-auto w-[95vw] sm:max-w-[60vw]">
        <DialogHeader>
          <DialogTitle>Nuevo Tipo de Gancho</DialogTitle>
          <DialogDescription>
            Define un nuevo tipo de gancho de faenamiento para una especie.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={onSubmit}
            className="space-y-8 grid grid-cols-1 gap-2"
          >
            <HookTypeFormFields />
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
