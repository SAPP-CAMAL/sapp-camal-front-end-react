"use client";

import { useEffect, useState } from "react";
import { SquarePenIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { HTTPError } from "ky";

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
import { NewSettingHygieneFields } from "./setting-hygiene-form-fields";
import { updateSettingHygieneService } from "../server/db/setting-hygiene-admin.service";
import { NewSettingHygieneForm } from "./new-setting-hygiene";
import { SettingHygieneAdmin } from "../domain/setting-hygiene-admin.domain";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function UpdateSettingHygiene({
  settingHygiene,
  excludeEquipmentIds,
}: {
  settingHygiene: SettingHygieneAdmin;
  excludeEquipmentIds: number[];
}) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const form = useForm<NewSettingHygieneForm>();

  useEffect(() => {
    if (open) {
      form.reset({
        idEquipment: settingHygiene.idEquipment,
        status: String(settingHygiene.status),
      });
    }
  }, [open, form, settingHygiene]);

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      await updateSettingHygieneService(settingHygiene.id, {
        ...(form.formState.dirtyFields.idEquipment && { idEquipment: data.idEquipment }),
        ...(form.formState.dirtyFields.status && { status: data.status === "true" }),
      });

      form.reset(form.formState.defaultValues);

      await queryClient.invalidateQueries({ queryKey: ["setting-hygiene-admin"] });

      toast.success("Configuración de higiene actualizada exitosamente");
    } catch (error) {
      if (error instanceof HTTPError) {
        const { data } = await error.response.json<{ data: string }>();
        toast.error(data);
      } else {
        toast.error("No se pudo actualizar la configuración de higiene");
      }
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
        <TooltipContent side="top" align="center" sideOffset={5} avoidCollisions>
          Editar Configuración
        </TooltipContent>
      </Tooltip>
      <DialogContent className="max-h-screen overflow-y-auto w-[95vw] sm:max-w-[60vw]">
        <DialogHeader>
          <DialogTitle>Editar Configuración de Higiene</DialogTitle>
          <DialogDescription>Modifica la configuración de higiene seleccionada.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={onSubmit} className="space-y-8 grid grid-cols-1 gap-2">
            <NewSettingHygieneFields showStatus excludeEquipmentIds={excludeEquipmentIds} />
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
                {form.formState.isSubmitting ? "Actualizando..." : "Actualizar"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
