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
import { EnvironmentVariableFormFields } from "./environment-variable-form-fields";
import { updateEnvironmentVariableService } from "../server/db/environment-variables.service";
import { NewEnvironmentVariableForm } from "./new-environment-variable";
import { ENVIRONMENT_VARIABLES_LIST_TAG } from "../constants";
import type { EnvironmentVariable } from "@/features/dashboard/domain/environment-variables.types";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function UpdateEnvironmentVariable({
  environmentVariable,
}: {
  environmentVariable: EnvironmentVariable;
}) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const form = useForm<NewEnvironmentVariableForm>();

  useEffect(() => {
    if (open) {
      form.reset({
        name: environmentVariable.name,
        token: environmentVariable.token,
        typeData: environmentVariable.typeData,
      });
    }
  }, [open, form, environmentVariable]);

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      await updateEnvironmentVariableService(environmentVariable.id, {
        ...(form.formState.dirtyFields.name && { name: data.name }),
        ...(form.formState.dirtyFields.token && { token: data.token }),
        ...(form.formState.dirtyFields.typeData && {
          typeData: data.typeData,
        }),
      });

      form.reset(form.formState.defaultValues);
      setOpen(false);

      await queryClient.invalidateQueries({
        queryKey: [ENVIRONMENT_VARIABLES_LIST_TAG],
      });

      toast.success("Variable de entorno actualizada exitosamente");
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
          <DialogTitle>Editar Variable de Entorno</DialogTitle>
          <DialogDescription>
            Modifica la configuración técnica sensible.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={onSubmit}
            className="space-y-8 grid grid-cols-1 gap-2"
          >
            <EnvironmentVariableFormFields />
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
