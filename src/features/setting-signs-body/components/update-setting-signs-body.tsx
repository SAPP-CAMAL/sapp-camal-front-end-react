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
import { SettingSignsBodyFormFields } from "./setting-signs-body-form-fields";
import { updateSettingSignsBodyService } from "../server/db/setting-signs-body.service";
import { NewSettingSignsBodyForm } from "./new-setting-signs-body";
import { SettingSignsBody } from "../domain/setting-signs-body.domain";
import { SETTING_SIGNS_BODY_TAG } from "../constants/setting-signs-body.constants";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function UpdateSettingSignsBody({
  settingSignsBody,
}: {
  settingSignsBody: SettingSignsBody;
}) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const form = useForm<NewSettingSignsBodyForm>();

  useEffect(() => {
    if (open) {
      form.reset({
        idBodyParts: settingSignsBody.idBodyParts,
      });
    }
  }, [open, form, settingSignsBody]);

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      await updateSettingSignsBodyService(settingSignsBody.id, {
        ...(form.formState.dirtyFields.idBodyParts && {
          idBodyParts: data.idBodyParts,
        }),
      });

      form.reset(form.formState.defaultValues);

      await queryClient.invalidateQueries({
        queryKey: [SETTING_SIGNS_BODY_TAG],
      });

      toast.success("Parte del cuerpo actualizada exitosamente");
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
          Editar Parte del Cuerpo
        </TooltipContent>
      </Tooltip>
      <DialogContent className="max-h-screen overflow-y-auto w-[95vw] sm:max-w-[50vw]">
        <DialogHeader>
          <DialogTitle>Editar Parte del Cuerpo del Signo Clínico</DialogTitle>
          <DialogDescription>
            Modifica la parte del cuerpo seleccionada.
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
                {form.formState.isSubmitting ? "Actualizando..." : "Actualizar"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
