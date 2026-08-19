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
import { ClinicalSignsSpeciesFormFields } from "./clinical-signs-species-form-fields";
import { createClinicalSignsSpeciesService } from "../server/db/clinical-signs-species.service";
import { useEffect, useState } from "react";
import { CLINICAL_SIGNS_SPECIES_TAG } from "../constants/clinical-signs-species.constants";

export type NewClinicalSignsSpeciesForm = {
  idSpecies: number;
  details: string;
};

const defaultValues: NewClinicalSignsSpeciesForm = {
  idSpecies: undefined as unknown as number,
  details: "",
};

export function NewClinicalSignsSpecies({
  idClinicalSigns,
}: {
  idClinicalSigns: number;
}) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const form = useForm<NewClinicalSignsSpeciesForm>({ defaultValues });

  useEffect(() => {
    if (open) {
      form.reset(defaultValues);
    }
  }, [open, form]);

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      await createClinicalSignsSpeciesService({
        idSpecies: data.idSpecies,
        details: data.details,
        idClinicalSigns,
      });

      form.reset(defaultValues);

      await queryClient.invalidateQueries({
        queryKey: [CLINICAL_SIGNS_SPECIES_TAG],
      });

      toast.success("Especie del signo clínico creada exitosamente");
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
          <DialogTitle>Nueva Especie del Signo Clínico</DialogTitle>
          <DialogDescription>
            Asocia una especie a este signo clínico.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={onSubmit}
            className="space-y-8 grid grid-cols-1 gap-2"
          >
            <ClinicalSignsSpeciesFormFields />
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
