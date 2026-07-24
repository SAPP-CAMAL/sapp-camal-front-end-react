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
import { VeterinarianFormFields } from "./veterinarian-form-fields";
import { updateVeterinarianService } from "../server/db/veterinarian.service";
import { Veterinarian } from "../domain/veterinarian.domain";
import { VETERINARIAN_TAG } from "../constants/veterinarian.constants";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export type UpdateVeterinarianForm = {
  code: string;
  authorizedDistribution: boolean;
  status: boolean;
};

export function UpdateVeterinarian({
  veterinarian,
}: {
  veterinarian: Veterinarian;
}) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const form = useForm<UpdateVeterinarianForm>();

  useEffect(() => {
    if (open) {
      form.reset({
        code: veterinarian.code,
        authorizedDistribution: veterinarian.authorizedDistribution,
        status: veterinarian.status,
      });
    }
  }, [open, form, veterinarian]);

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      await updateVeterinarianService(veterinarian.id, {
        ...(form.formState.dirtyFields.code && { code: data.code }),
        ...(form.formState.dirtyFields.authorizedDistribution && {
          authorizedDistribution: data.authorizedDistribution,
        }),
        ...(form.formState.dirtyFields.status && { status: data.status }),
      });

      form.reset(form.formState.defaultValues);

      await queryClient.invalidateQueries({
        queryKey: [VETERINARIAN_TAG],
      });

      toast.success("Médico veterinario actualizado exitosamente");
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
          Editar Médico Veterinario
        </TooltipContent>
      </Tooltip>
      <DialogContent className="max-h-screen overflow-y-auto w-[95vw] sm:max-w-[60vw]">
        <DialogHeader>
          <DialogTitle>Editar Médico Veterinario</DialogTitle>
          <DialogDescription>
            Modifica el código, la autorización de distribución y el estado
            del médico veterinario seleccionado.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={onSubmit}
            className="space-y-8 grid grid-cols-1 gap-2"
          >
            <VeterinarianFormFields />
            <div className="flex justify-end gap-x-2">
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
