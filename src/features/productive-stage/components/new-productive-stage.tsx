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
import { ProductiveStageFormFields } from "./productive-stage-form-fields";
import { createProductiveStageService } from "../server/db/productive-stage.service";
import { useEffect, useState } from "react";
import { PRODUCTIVE_LIST_TAG } from "../constants";

export type NewProductiveStageForm = {
  name: string;
  code: string;
  idSpecies: number;
  idAnimalSex: number;
};

const defaultValues: NewProductiveStageForm = {
  name: "",
  code: "",
  idSpecies: undefined as unknown as number,
  idAnimalSex: undefined as unknown as number,
};

export function NewProductiveStage() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const form = useForm<NewProductiveStageForm>({ defaultValues });

  useEffect(() => {
    if (open) {
      form.reset(defaultValues);
    }
  }, [open, form]);

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      await createProductiveStageService({
        name: data.name,
        code: data.code,
        idSpecies: data.idSpecies,
        idAnimalSex: data.idAnimalSex,
      });

      form.reset(defaultValues);

      await queryClient.invalidateQueries({
        queryKey: [PRODUCTIVE_LIST_TAG],
      });

      toast.success("Etapa productiva creada exitosamente");
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
          Crear etapa productiva
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-screen overflow-y-auto w-[95vw] sm:max-w-[60vw]">
        <DialogHeader>
          <DialogTitle>Nueva Etapa Productiva</DialogTitle>
          <DialogDescription>
            Define una nueva etapa productiva del animal por especie y sexo.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={onSubmit}
            className="space-y-8 grid grid-cols-1 gap-2"
          >
            <ProductiveStageFormFields />
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
