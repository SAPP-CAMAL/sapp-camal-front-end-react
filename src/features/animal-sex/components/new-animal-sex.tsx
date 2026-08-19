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
import { AnimalSexFormFields } from "./animal-sex-form-fields";
import { createAnimalSexService } from "../server/db/animal-sex.service";
import { ANIMAL_SEX_LIST_TAG } from "../constants";
import { useEffect, useState } from "react";

export type NewAnimalSexForm = {
  code: string;
  name: string;
  description: string;
};

const defaultValues: NewAnimalSexForm = {
  code: "",
  name: "",
  description: "",
};

export function NewAnimalSex() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const form = useForm<NewAnimalSexForm>({ defaultValues });

  useEffect(() => {
    if (open) {
      form.reset(defaultValues);
    }
  }, [open, form]);

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      await createAnimalSexService({
        code: data.code,
        name: data.name,
        description: data.description || undefined,
        status: true,
      });

      form.reset(defaultValues);
      setOpen(false);

      await queryClient.invalidateQueries({
        queryKey: [ANIMAL_SEX_LIST_TAG],
      });

      toast.success("Sexo de animal creado exitosamente");
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
          Nuevo sexo de animal
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-screen overflow-y-auto min-w-[50vw]">
        <DialogHeader>
          <DialogTitle>Nuevo Sexo de Animal</DialogTitle>
          <DialogDescription>
            Registra un nuevo valor de catálogo para el sexo del animal.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={onSubmit}
            className="space-y-8 grid grid-cols-1 gap-2"
          >
            <AnimalSexFormFields />
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
