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
import { SpeciesDiseaseFormFields } from "./species-disease-form-fields";
import { updateSpeciesDiseaseService } from "../server/db/species-disease.service";
import { NewSpeciesDiseaseForm } from "./new-species-disease";
import { SpeciesDisease } from "../domain/species-disease.domain";
import { SPECIES_DISEASE_TAG } from "../constants/species-disease.constants";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function UpdateSpeciesDisease({
  speciesDisease,
}: {
  speciesDisease: SpeciesDisease;
}) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const form = useForm<NewSpeciesDiseaseForm>();

  useEffect(() => {
    if (open) {
      form.reset({
        idSpecie: speciesDisease.specie?.id,
      });
    }
  }, [open, form, speciesDisease]);

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      await updateSpeciesDiseaseService(speciesDisease.id, {
        ...(form.formState.dirtyFields.idSpecie && {
          idSpecie: data.idSpecie,
        }),
      });

      form.reset(form.formState.defaultValues);

      await queryClient.invalidateQueries({
        queryKey: [SPECIES_DISEASE_TAG],
      });

      toast.success("Especie actualizada exitosamente");
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
          <DialogTitle>Editar Especie de la Regla</DialogTitle>
          <DialogDescription>
            Modifica la especie seleccionada.
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
                {form.formState.isSubmitting ? "Actualizando..." : "Actualizar"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
