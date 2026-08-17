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
import { EquipmentTypeFormFields } from "./equipment-type-form-fields";
import { updateEquipmentTypeService } from "../server/db/equipment.service";
import { NewEquipmentTypeForm } from "./new-equipment-type";
import { EquipmentType } from "../domain/equipment.domain";
import { EQUIPMENT_TYPES_TAG } from "../constants/equipment.constants";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function UpdateEquipmentType({
  equipmentType,
}: {
  equipmentType: EquipmentType;
}) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const form = useForm<NewEquipmentTypeForm>();

  useEffect(() => {
    if (open) {
      form.reset({
        description: equipmentType.description,
        status: String(equipmentType.status),
      });
    }
  }, [open, form, equipmentType]);

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      await updateEquipmentTypeService(equipmentType.id, {
        ...(form.formState.dirtyFields.description && {
          description: data.description,
        }),
        ...(form.formState.dirtyFields.status && {
          status: data.status === "true",
        }),
      });

      form.reset(form.formState.defaultValues);

      await queryClient.invalidateQueries({
        queryKey: [EQUIPMENT_TYPES_TAG],
      });

      toast.success("Tipo de equipo actualizado exitosamente");
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
          Editar Tipo de Equipo
        </TooltipContent>
      </Tooltip>
      <DialogContent className="max-h-screen overflow-y-auto w-[95vw] sm:max-w-[50vw]">
        <DialogHeader>
          <DialogTitle>Editar Tipo de Equipo</DialogTitle>
          <DialogDescription>
            Modifica la información del tipo de equipo seleccionado.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={onSubmit}
            className="space-y-8 grid grid-cols-1 gap-2"
          >
            <EquipmentTypeFormFields showStatus />
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
                {form.formState.isSubmitting ? "Actualizando..." : "Actualizar"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
