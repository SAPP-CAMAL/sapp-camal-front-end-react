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
// import { createPersonService } from "../server/db/people.service";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { VisitorLogFormFields } from "./new-visitor-log-fields.form";
import { createVisitorLogService } from "../server/db/visitor-log.service";
import { useState } from "react";

export function NewVisitorLogForm() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const defaultValues = {
    personId: "",
    idCompany: "",
    visitPurpose: "",
    entryTime: "",
    exitTime: "",
    observation: "",
    savedPerson: null,
  };

  const form = useForm({ defaultValues });

  const onSubmit = async (data: any) => {
    try {
      console.log({ data });

      if(!data.savedPerson){
        return toast.error("Debe seleccionar una persona");
      }


      await createVisitorLogService({
        idPerson: Number(data.personId),
        idCompany: Number(data.idCompany),
        visitPurpose: data.visitPurpose,
        ...(!!data.entryTime && {
          entryTime: data.entryTime,
        }),
        ...(!!data.exitTime && {
          exitTime: data.exitTime,
        }),
        ...(!!data.observation && {
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
      <DialogTrigger asChild>
        <Button>
          <PlusIcon />
          Nueva Visita
        </Button>
      </DialogTrigger>
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
