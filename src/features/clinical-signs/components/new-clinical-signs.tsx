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
import { ClinicalSignsFormFields } from "./clinical-signs-form-fields";
import { createClinicalSignService } from "../server/db/clinical-signs.service";
import { useEffect, useState } from "react";
import { CLINICAL_SIGNS_TAG } from "../constants/clinical-signs.constants";

export type NewClinicalSignForm = {
  description: string;
  groupSign: number;
  status: string;
};

const defaultValues: NewClinicalSignForm = {
  description: "",
  groupSign: undefined as unknown as number,
  status: "true",
};

export function NewClinicalSigns() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const form = useForm<NewClinicalSignForm>({ defaultValues });

  useEffect(() => {
    if (open) {
      form.reset(defaultValues);
    }
  }, [open, form]);

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      await createClinicalSignService({
        description: data.description,
        groupSign: data.groupSign,
      });

      form.reset(defaultValues);

      await queryClient.invalidateQueries({
        queryKey: [CLINICAL_SIGNS_TAG],
      });

      toast.success("Signo clínico creado exitosamente");
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
          Crear signo clínico
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-screen overflow-y-auto w-[95vw] sm:max-w-[60vw]">
        <DialogHeader>
          <DialogTitle>Nuevo Signo Clínico</DialogTitle>
          <DialogDescription>
            Define un nuevo signo clínico y su grupo de afección.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={onSubmit}
            className="space-y-8 grid grid-cols-1 gap-2"
          >
            <ClinicalSignsFormFields />
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
