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
import { AnimalSexFormFields } from "./animal-sex-form-fields";
import { updateAnimalSexService } from "../server/db/animal-sex.service";
import { NewAnimalSexForm } from "./new-animal-sex";
import { ANIMAL_SEX_LIST_TAG } from "../constants";
import { AnimalSex } from "../domain";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function UpdateAnimalSex({ animalSex }: { animalSex: AnimalSex }) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const form = useForm<NewAnimalSexForm>();

  useEffect(() => {
    if (open) {
      form.reset({
        code: animalSex.code,
        name: animalSex.name,
        description: animalSex.description ?? "",
      });
    }
  }, [open, form, animalSex]);

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      await updateAnimalSexService(animalSex.id, {
        ...(form.formState.dirtyFields.code && { code: data.code }),
        ...(form.formState.dirtyFields.name && { name: data.name }),
        ...(form.formState.dirtyFields.description && {
          description: data.description,
        }),
      });

      form.reset(form.formState.defaultValues);
      setOpen(false);

      await queryClient.invalidateQueries({
        queryKey: [ANIMAL_SEX_LIST_TAG],
      });

      toast.success("Sexo de animal actualizado exitosamente");
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
            <Button variant={"outline"} size="icon">
              <SquarePenIcon className="h-4 w-4" />
            </Button>
          </DialogTrigger>
        </TooltipTrigger>
        <TooltipContent
          side="top"
          align="center"
          sideOffset={5}
          avoidCollisions
        >
          Editar
        </TooltipContent>
      </Tooltip>
      <DialogContent className="max-h-screen overflow-y-auto min-w-[50vw]">
        <DialogHeader>
          <DialogTitle>Editar Sexo de Animal</DialogTitle>
          <DialogDescription>
            Modifica el valor de catálogo para el sexo del animal.
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
                {form.formState.isSubmitting ? "Actualizando..." : "Actualizar"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
