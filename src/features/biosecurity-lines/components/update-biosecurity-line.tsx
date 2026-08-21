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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RequiredMark } from "@/components/ui/required-mark";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { updateBiosecurityLineService } from "../server/db/biosecurity-lines.service";
import { BiosecurityLine } from "../domain/biosecurity-lines.domain";
import { BIOSECURITY_LINES_TAG } from "../constants/biosecurity-lines.constants";

type UpdateBiosecurityLineForm = {
  name: string;
  status: string;
};

export function UpdateBiosecurityLine({
  biosecurityLine,
}: {
  biosecurityLine: BiosecurityLine;
}) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const form = useForm<UpdateBiosecurityLineForm>();

  useEffect(() => {
    if (open) {
      form.reset({
        name: biosecurityLine.name,
        status: String(biosecurityLine.status),
      });
    }
  }, [open, form, biosecurityLine]);

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      await updateBiosecurityLineService(biosecurityLine.id, {
        ...(form.formState.dirtyFields.name && { name: data.name }),
        ...(form.formState.dirtyFields.status && {
          status: data.status === "true",
        }),
      });

      form.reset(form.formState.defaultValues);

      await queryClient.invalidateQueries({
        queryKey: [BIOSECURITY_LINES_TAG],
      });

      toast.success("Línea de bioseguridad actualizada exitosamente");
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
            <Button variant="outline" size="sm">
              <SquarePenIcon className="h-4 w-4" />
            </Button>
          </DialogTrigger>
        </TooltipTrigger>
        <TooltipContent side="top" align="center" sideOffset={5} avoidCollisions>
          Editar Línea de Bioseguridad
        </TooltipContent>
      </Tooltip>
      <DialogContent className="max-h-screen overflow-y-auto w-[95vw] sm:max-w-[50vw]">
        <DialogHeader>
          <DialogTitle>Editar Línea de Bioseguridad</DialogTitle>
          <DialogDescription>
            Modifica la información del perfil de bioseguridad seleccionado.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={onSubmit} className="space-y-8 grid grid-cols-1 gap-2">
            <FormField
              control={form.control}
              name="name"
              rules={{
                required: { value: true, message: "El nombre es requerido" },
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre <RequiredMark /></FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              rules={{
                required: { value: true, message: "El estado es requerido" },
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estado <RequiredMark /></FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Seleccione un estado" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="true">Activo</SelectItem>
                      <SelectItem value="false">Inactivo</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
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
                {form.formState.isSubmitting ? "Actualizando..." : "Actualizar"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
