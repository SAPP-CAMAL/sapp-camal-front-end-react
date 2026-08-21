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
import { EquipmentTypeFormFields } from "./equipment-type-form-fields";
import { createEquipmentTypeService } from "../server/db/equipment.service";
import { useEffect, useState } from "react";
import { EQUIPMENT_TYPES_TAG } from "../constants/equipment.constants";

export type NewEquipmentTypeForm = {
  description: string;
  status: string;
};

const defaultValues: NewEquipmentTypeForm = {
  description: "",
  status: "true",
};

export function NewEquipmentType() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const form = useForm<NewEquipmentTypeForm>({ defaultValues });

  useEffect(() => {
    if (open) {
      form.reset(defaultValues);
    }
  }, [open, form]);

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      await createEquipmentTypeService({
        description: data.description,
      });

      form.reset(defaultValues);

      await queryClient.invalidateQueries({
        queryKey: [EQUIPMENT_TYPES_TAG],
      });

      toast.success("Tipo de equipo creado exitosamente");
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
          Crear tipo de equipo
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-screen overflow-y-auto w-[95vw] sm:max-w-[50vw]">
        <DialogHeader>
          <DialogTitle>Nuevo Tipo de Equipo</DialogTitle>
          <DialogDescription>
            Define un nuevo tipo de equipo de bioseguridad.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={onSubmit}
            className="space-y-8 grid grid-cols-1 gap-2"
          >
            <EquipmentTypeFormFields />
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
                {form.formState.isSubmitting ? "Guardando..." : "Guardar"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
