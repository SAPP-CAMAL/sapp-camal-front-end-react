"use client";

import { Button } from "@/components/ui/button";
import { EditIcon } from "lucide-react";
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
// import { createPersonService } from "../server/db/people.service";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { VisitorLogFormFields } from "./new-visitor-log-fields.form";
import {
  createVisitorLogService,
  upateVisitorLogService,
} from "../server/db/visitor-log.service";
import { useState } from "react";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

function toLocalInputValue(utcString?: string) {
  if (!utcString) return "";
  const date = new Date(utcString);
  // Ajusta la zona horaria local (Ecuador UTC-5)
  const tzOffset = date.getTimezoneOffset() * 60000;
  const localISO = new Date(date.getTime() - tzOffset)
    .toISOString()
    .slice(0, 16);
  return localISO;
}

export function UpdateVisitorLogDialog({ visitor }: { visitor: any }) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const defaultValues = {
    personId: visitor?.idPerson?.toString(),
    idCompany: visitor?.idCompany?.toString(),
    visitPurpose: visitor?.visitPurpose ?? "",
    entryTime: toLocalInputValue(visitor?.entryTime),
    exitTime: toLocalInputValue(visitor?.exitTime),
    observation: visitor?.observation ?? "",
    savedPerson: visitor?.person ?? null,
  };

  const form = useForm({ defaultValues });

  const onSubmit = async (data: any) => {
    try {
      if (!data.savedPerson) {
        return toast.error("Debe seleccionar una persona");
      }

      await upateVisitorLogService(Number(visitor.id), {
        idPerson: Number(data.personId),
        idCompany: Number(data.idCompany),

        ...(form.formState.dirtyFields.visitPurpose && {
          visitPurpose: data.visitPurpose,
        }),
        ...(form.formState.dirtyFields.entryTime && {
          entryTime: data.entryTime,
        }),
        ...(form.formState.dirtyFields.exitTime && {
          exitTime: data.exitTime,
        }),
        ...(form.formState.dirtyFields.observation && {
          observation: data.observation,
        }),
        status: true,
      });

      await queryClient.refetchQueries({
        queryKey: ["visitor-log"],
      });

      form.reset(defaultValues);

      setOpen(false);

      toast.success("Registro de Visita creado exitosamente");
    } catch (error: any) {
      console.error("Error al crear persona:", error);
      if (error.response) {
        try {
          const { data } = await error.response.json();
          toast.error(data || "Error al crear la visita");
        } catch {
          toast.error("Error al crear el registro de visita");
        }
      } else {
        toast.error("Error de conexión. Por favor, intente nuevamente.");
      }
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) form.reset();
      }}
    >
      <Tooltip>
        <TooltipTrigger asChild>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline" className="p-0">
              <EditIcon className="h-4 w-4" />
              <span className="sr-only">Editar registro de visita</span>
            </Button>
          </DialogTrigger>
        </TooltipTrigger>
        <TooltipContent
          side="top"
          align="center"
          sideOffset={5}
          avoidCollisions
        >
          Editar Registro de Visita
        </TooltipContent>
      </Tooltip>
      <DialogContent className="max-h-screen overflow-y-auto min-w-[45vw]">
        <DialogHeader>
          <DialogTitle>Nueva Visita</DialogTitle>
          <DialogDescription>
            Complete la información de la persona. Los campos marcados con (*)
            son obligatorios.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-8 grid grid-cols-1 gap-2"
          >
            <VisitorLogFormFields />
            <div className="flex justify-end col-span-2">
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Guardando..." : "Guardar"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
