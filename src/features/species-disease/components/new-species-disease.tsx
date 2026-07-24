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
import { SpeciesDiseaseFormFields } from "./species-disease-form-fields";
import { createSpeciesDiseaseService } from "../server/db/species-disease.service";
import { useEffect, useState } from "react";
import { SPECIES_DISEASE_TAG } from "../constants/species-disease.constants";

export type NewSpeciesDiseaseForm = {
  idSpecie: number;
};

const defaultValues: NewSpeciesDiseaseForm = {
  idSpecie: undefined as unknown as number,
};

export function NewSpeciesDisease({
  idProductDisease,
}: {
  idProductDisease: number;
}) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const form = useForm<NewSpeciesDiseaseForm>({ defaultValues });

  useEffect(() => {
    if (open) {
      form.reset(defaultValues);
    }
  }, [open, form]);

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      await createSpeciesDiseaseService({
        idSpecie: data.idSpecie,
        idProductDisease,
      });

      form.reset(defaultValues);

      await queryClient.invalidateQueries({
        queryKey: [SPECIES_DISEASE_TAG],
      });

      toast.success("Especie asociada exitosamente");
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
          Nueva especie
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-screen overflow-y-auto w-[95vw] sm:max-w-[50vw]">
        <DialogHeader>
          <DialogTitle>Nueva Especie de la Regla</DialogTitle>
          <DialogDescription>
            Asocia una especie a esta regla producto-enfermedad.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={onSubmit}
            className="space-y-8 grid grid-cols-1 gap-2"
          >
            <SpeciesDiseaseFormFields />
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
