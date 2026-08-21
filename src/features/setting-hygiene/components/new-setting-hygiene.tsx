"use client";

import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { HTTPError } from "ky";
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
import { NewSettingHygieneFields } from "./setting-hygiene-form-fields";
import { createSettingHygieneService } from "../server/db/setting-hygiene-admin.service";
import { useEffect, useState } from "react";

export type NewSettingHygieneForm = {
  idEquipment: number;
  status: string;
};

const defaultValues: NewSettingHygieneForm = {
  idEquipment: 0,
  status: "true",
};

export function NewSettingHygiene({ excludeEquipmentIds }: { excludeEquipmentIds: number[] }) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const form = useForm<NewSettingHygieneForm>({ defaultValues });

  useEffect(() => {
    if (open) {
      form.reset(defaultValues);
    }
  }, [open, form]);

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      await createSettingHygieneService({
        idEquipment: data.idEquipment,
        status: true,
      });

      form.reset(defaultValues);

      await queryClient.invalidateQueries({ queryKey: ["setting-hygiene-admin"] });

      toast.success("Configuración de higiene creada exitosamente");
    } catch (error) {
      if (error instanceof HTTPError) {
        const { data } = await error.response.json<{ data: string }>();
        toast.error(data);
      } else {
        toast.error("No se pudo crear la configuración de higiene");
      }
    }
  });

  return (
    <Dialog open={open} onOpenChange={(open) => setOpen(open)}>
      <DialogTrigger asChild>
        <Button>
          <PlusIcon />
          Crear configuración
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-screen overflow-y-auto w-[95vw] sm:max-w-[60vw]">
        <DialogHeader>
          <DialogTitle>Nueva Configuración de Higiene</DialogTitle>
          <DialogDescription>Define qué equipo requiere control de higiene.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={onSubmit} className="space-y-8 grid grid-cols-1 gap-2">
            <NewSettingHygieneFields excludeEquipmentIds={excludeEquipmentIds} />
            <div className="flex justify-end col-span-2 gap-x-2">
              <Button
                type="button"
                variant={"outline"}
                disabled={form.formState.isSubmitting}
                onClick={() => setOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting || form.formState.isLoading}>
                {form.formState.isSubmitting ? "Guardando..." : "Guardar"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
