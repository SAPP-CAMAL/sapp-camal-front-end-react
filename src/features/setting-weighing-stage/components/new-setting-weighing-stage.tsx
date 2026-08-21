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
import { SettingWeighingStageFormFields } from "./setting-weighing-stage-form-fields";
import { createSettingWeighingStageService } from "../server/db/setting-weighing-stage.service";
import { useEffect, useState } from "react";
import { SETTING_WEIGHING_STAGES_TAG } from "../constants/setting-weighing-stage.constants";
import { SettingWeighingStage } from "../domain/setting-weighing-stage.domain";

export type NewSettingWeighingStageForm = {
  idWeighingStage: string;
  description: string;
};

const defaultValues: NewSettingWeighingStageForm = {
  idWeighingStage: "",
  description: "",
};

export function NewSettingWeighingStage({
  existingSettings,
}: {
  existingSettings: SettingWeighingStage[];
}) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const form = useForm<NewSettingWeighingStageForm>({ defaultValues });

  useEffect(() => {
    if (open) {
      form.reset(defaultValues);
    }
  }, [open, form]);

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      await createSettingWeighingStageService({
        idWeighingStage: Number(data.idWeighingStage),
        description: data.description || null,
      });

      form.reset(defaultValues);

      await queryClient.invalidateQueries({
        queryKey: [SETTING_WEIGHING_STAGES_TAG],
      });

      toast.success("Etapa de pesaje habilitada exitosamente");
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
          Habilitar etapa de pesaje
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-screen overflow-y-auto w-[95vw] sm:max-w-[50vw]">
        <DialogHeader>
          <DialogTitle>Habilitar Etapa de Pesaje para Distribución</DialogTitle>
          <DialogDescription>
            Selecciona la etapa de pesaje que estará habilitada en el flujo
            de distribución.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={onSubmit}
            className="space-y-8 grid grid-cols-1 gap-2"
          >
            <SettingWeighingStageFormFields
              excludedIds={existingSettings.map((s) => s.idWeighingStage)}
            />
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
