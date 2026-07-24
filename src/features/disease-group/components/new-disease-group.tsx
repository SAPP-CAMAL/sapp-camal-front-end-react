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
import { DiseaseGroupFormFields } from "./disease-group-form-fields";
import { createDiseaseGroupService } from "../server/db/disease-group.service";
import { useEffect, useState } from "react";
import { DISEASE_GROUP_TAG } from "../constants/disease-group.constants";

export type NewDiseaseGroupForm = {
  name: string;
  groupNumber: number;
  code: string;
};

const defaultValues: NewDiseaseGroupForm = {
  name: "",
  groupNumber: undefined as unknown as number,
  code: "",
};

export function NewDiseaseGroup() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const form = useForm<NewDiseaseGroupForm>({ defaultValues });

  useEffect(() => {
    if (open) {
      form.reset(defaultValues);
    }
  }, [open, form]);

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      await createDiseaseGroupService({
        name: data.name,
        groupNumber: data.groupNumber,
        code: data.code,
      });

      form.reset(defaultValues);

      await queryClient.invalidateQueries({
        queryKey: [DISEASE_GROUP_TAG],
      });

      toast.success("Grupo de enfermedad creado exitosamente");
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
          Crear grupo de enfermedad
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-screen overflow-y-auto w-[95vw] sm:max-w-[60vw]">
        <DialogHeader>
          <DialogTitle>Nuevo Grupo de Enfermedad</DialogTitle>
          <DialogDescription>
            Define un nuevo grupo de enfermedad para clasificación de
            productos.
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
                {form.formState.isSubmitting ? "Guardando..." : "Guardar"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
