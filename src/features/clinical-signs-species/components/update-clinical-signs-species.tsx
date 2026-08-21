"use client";

import { useEffect, useState } from "react";
import { SquarePenIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { ClinicalSignsSpeciesFormFields } from "./clinical-signs-species-form-fields";
import { updateClinicalSignsSpeciesService } from "../server/db/clinical-signs-species.service";
import { NewClinicalSignsSpeciesForm } from "./new-clinical-signs-species";
import { ClinicalSignsSpecies } from "../domain/clinical-signs-species.domain";
import { CLINICAL_SIGNS_SPECIES_TAG } from "../constants/clinical-signs-species.constants";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function UpdateClinicalSignsSpecies({
  clinicalSignsSpecies,
}: {
  clinicalSignsSpecies: ClinicalSignsSpecies;
}) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const form = useForm<NewClinicalSignsSpeciesForm>();

  useEffect(() => {
    if (open) {
      form.reset({
        idSpecies: clinicalSignsSpecies.idSpecies,
        details: clinicalSignsSpecies.details ?? "",
      });
    }
  }, [open, form, clinicalSignsSpecies]);

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      await updateClinicalSignsSpeciesService(clinicalSignsSpecies.id, {
        ...(form.formState.dirtyFields.idSpecies && {
          idSpecies: data.idSpecies,
        }),
        ...(form.formState.dirtyFields.details && {
          details: data.details,
        }),
      });

      form.reset(form.formState.defaultValues);

      await queryClient.invalidateQueries({
        queryKey: [CLINICAL_SIGNS_SPECIES_TAG],
      });

      toast.success("Especie del signo clínico actualizada exitosamente");
      setOpen(false);
    } catch (error: any) {
      const { data } = await error.response.json();
      toast.error(data);
    }
  });

  return (
    <Dialog open={open} onOpenChange={(open) => setOpen(open)}>
      <Tooltip>
        <TooltipTrigger asChild>
          <DialogTrigger asChild>
            <Button variant={"outline"}>
              <SquarePenIcon />
            </Button>
          </DialogTrigger>
        </TooltipTrigger>
        <TooltipContent
          side="top"
          align="center"
          sideOffset={5}
          avoidCollisions
        >
          Editar Especie
        </TooltipContent>
      </Tooltip>
      <DialogContent className="max-h-screen overflow-y-auto w-[95vw] sm:max-w-[50vw]">
        <DialogHeader>
          <DialogTitle>Editar Especie del Signo Clínico</DialogTitle>
          <DialogDescription>
            Modifica la especie y los detalles seleccionados.
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
                {form.formState.isSubmitting ? "Actualizando..." : "Actualizar"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
