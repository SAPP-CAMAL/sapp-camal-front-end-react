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
import { ClinicalSignsFormFields } from "./clinical-signs-form-fields";
import { updateClinicalSignService } from "../server/db/clinical-signs.service";
import { NewClinicalSignForm } from "./new-clinical-signs";
import { ClinicalSign } from "../domain/clinical-signs.domain";
import { CLINICAL_SIGNS_TAG } from "../constants/clinical-signs.constants";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function UpdateClinicalSigns({
  clinicalSign,
}: {
  clinicalSign: ClinicalSign;
}) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const form = useForm<NewClinicalSignForm>();

  useEffect(() => {
    if (open) {
      form.reset({
        description: clinicalSign.description,
        groupSign: clinicalSign.groupSign,
        status: String(clinicalSign.status),
      });
    }
  }, [open, form, clinicalSign]);

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      await updateClinicalSignService(clinicalSign.id, {
        ...(form.formState.dirtyFields.description && {
          description: data.description,
        }),
        ...(form.formState.dirtyFields.groupSign && {
          groupSign: data.groupSign,
        }),
        ...(form.formState.dirtyFields.status && {
          status: data.status === "true",
        }),
      });

      form.reset(form.formState.defaultValues);

      await queryClient.invalidateQueries({
        queryKey: [CLINICAL_SIGNS_TAG],
      });

      toast.success("Signo clínico actualizado exitosamente");
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
          Editar Signo Clínico
        </TooltipContent>
      </Tooltip>
      <DialogContent className="max-h-screen overflow-y-auto w-[95vw] sm:max-w-[60vw]">
        <DialogHeader>
          <DialogTitle>Editar Signo Clínico</DialogTitle>
          <DialogDescription>
            Modifica la información del signo clínico seleccionado.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={onSubmit}
            className="space-y-8 grid grid-cols-1 gap-2"
          >
            <ClinicalSignsFormFields showStatus />
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
