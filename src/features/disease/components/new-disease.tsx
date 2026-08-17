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
import { DiseaseFormFields } from "./disease-form-fields";
import { createDiseaseService } from "../server/db/disease.service";
import { useEffect, useState } from "react";
import { DISEASE_TAG } from "../constants/disease.constants";

export type NewDiseaseForm = {
  names: string;
  code: string;
  description: string;
  status: string;
};

const defaultValues: NewDiseaseForm = {
  names: "",
  code: "",
  description: "",
  status: "true",
};

export function NewDisease() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const form = useForm<NewDiseaseForm>({ defaultValues });

  useEffect(() => {
    if (open) {
      form.reset(defaultValues);
    }
  }, [open, form]);

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      await createDiseaseService({
        names: data.names,
        code: data.code,
        description: data.description,
      });

      form.reset(defaultValues);

      await queryClient.invalidateQueries({
        queryKey: [DISEASE_TAG],
      });

      toast.success("Enfermedad creada exitosamente");
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
          Crear enfermedad
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-screen overflow-y-auto w-[95vw] sm:max-w-[60vw]">
        <DialogHeader>
          <DialogTitle>Nueva Enfermedad</DialogTitle>
          <DialogDescription>
            Define una nueva enfermedad detectable en inspección.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={onSubmit}
            className="space-y-8 grid grid-cols-1 gap-2"
          >
            <DiseaseFormFields />
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
