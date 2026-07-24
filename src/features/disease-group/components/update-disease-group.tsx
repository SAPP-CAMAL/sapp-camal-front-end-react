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
import { DiseaseGroupFormFields } from "./disease-group-form-fields";
import { updateDiseaseGroupService } from "../server/db/disease-group.service";
import { NewDiseaseGroupForm } from "./new-disease-group";
import { DiseaseGroup } from "../domain/disease-group.domain";
import { DISEASE_GROUP_TAG } from "../constants/disease-group.constants";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function UpdateDiseaseGroup({
  diseaseGroup,
}: {
  diseaseGroup: DiseaseGroup;
}) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const form = useForm<NewDiseaseGroupForm>();

  useEffect(() => {
    if (open) {
      form.reset({
        name: diseaseGroup.name,
        groupNumber: diseaseGroup.groupNumber,
        code: diseaseGroup.code,
      });
    }
  }, [open, form, diseaseGroup]);

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      await updateDiseaseGroupService(diseaseGroup.id, {
        ...(form.formState.dirtyFields.name && {
          name: data.name,
        }),
        ...(form.formState.dirtyFields.groupNumber && {
          groupNumber: data.groupNumber,
        }),
        ...(form.formState.dirtyFields.code && {
          code: data.code,
        }),
      });

      form.reset(form.formState.defaultValues);

      await queryClient.invalidateQueries({
        queryKey: [DISEASE_GROUP_TAG],
      });

      toast.success("Grupo de enfermedad actualizado exitosamente");
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
          Editar Grupo de Enfermedad
        </TooltipContent>
      </Tooltip>
      <DialogContent className="max-h-screen overflow-y-auto w-[95vw] sm:max-w-[60vw]">
        <DialogHeader>
          <DialogTitle>Editar Grupo de Enfermedad</DialogTitle>
          <DialogDescription>
            Modifica la información del grupo de enfermedad seleccionado.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={onSubmit}
            className="space-y-8 grid grid-cols-1 gap-2"
          >
            <DiseaseGroupFormFields />
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
