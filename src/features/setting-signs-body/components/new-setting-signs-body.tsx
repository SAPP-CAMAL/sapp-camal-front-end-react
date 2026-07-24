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
import { SettingSignsBodyFormFields } from "./setting-signs-body-form-fields";
import { createSettingSignsBodyService } from "../server/db/setting-signs-body.service";
import { useEffect, useState } from "react";
import { SETTING_SIGNS_BODY_TAG } from "../constants/setting-signs-body.constants";

export type NewSettingSignsBodyForm = {
  idBodyParts: number;
};

const defaultValues: NewSettingSignsBodyForm = {
  idBodyParts: undefined as unknown as number,
};

export function NewSettingSignsBody({
  idClinicalSigns,
}: {
  idClinicalSigns: number;
}) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const form = useForm<NewSettingSignsBodyForm>({ defaultValues });

  useEffect(() => {
    if (open) {
      form.reset(defaultValues);
    }
  }, [open, form]);

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      await createSettingSignsBodyService({
        idBodyParts: data.idBodyParts,
        idClinicalSigns,
      });

      form.reset(defaultValues);

      await queryClient.invalidateQueries({
        queryKey: [SETTING_SIGNS_BODY_TAG],
      });

      toast.success("Parte del cuerpo asociada exitosamente");
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
          Nueva parte del cuerpo
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-screen overflow-y-auto w-[95vw] sm:max-w-[50vw]">
        <DialogHeader>
          <DialogTitle>Nueva Parte del Cuerpo del Signo Clínico</DialogTitle>
          <DialogDescription>
            Asocia una parte del cuerpo a este signo clínico.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={onSubmit}
            className="space-y-8 grid grid-cols-1 gap-2"
          >
            <SettingSignsBodyFormFields />
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
