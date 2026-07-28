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
import { EnvironmentVariableFormFields } from "./environment-variable-form-fields";
import { createEnvironmentVariableService } from "../server/db/environment-variables.service";
import { ENVIRONMENT_VARIABLES_LIST_TAG } from "../constants";
import { useEffect, useState } from "react";

export type NewEnvironmentVariableForm = {
  name: string;
  token: string;
  typeData: string;
};

const defaultValues: NewEnvironmentVariableForm = {
  name: "",
  token: "",
  typeData: "",
};

export function NewEnvironmentVariable() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const form = useForm<NewEnvironmentVariableForm>({ defaultValues });

  useEffect(() => {
    if (open) {
      form.reset(defaultValues);
    }
  }, [open, form]);

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      await createEnvironmentVariableService({
        name: data.name,
        token: data.token,
        typeData: data.typeData,
        status: true,
      });

      form.reset(defaultValues);
      setOpen(false);

      await queryClient.invalidateQueries({
        queryKey: [ENVIRONMENT_VARIABLES_LIST_TAG],
      });

      toast.success("Variable de entorno creada exitosamente");
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
          Nueva variable
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-screen overflow-y-auto min-w-[50vw]">
        <DialogHeader>
          <DialogTitle>Nueva Variable de Entorno</DialogTitle>
          <DialogDescription>
            Registra una nueva configuración técnica sensible.
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
                {form.formState.isSubmitting ? "Guardando..." : "Guardar"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
