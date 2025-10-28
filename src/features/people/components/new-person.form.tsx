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
import { createPersonService } from "../server/db/people.service";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { createEmployeeService } from "@/features/employees/server/db/employees.services";
import { NewPeopleFields } from "./person-form-fields";

export function NewPerson({
  isUpdateVisitorLog = false
}: {
  isUpdateVisitorLog?: boolean;
}) {
  const queryClient = useQueryClient();

  const defaultValues = {
    open: false,
    identificationType: "",
    identification: "",
    genderId: "",
    mobileNumber: "",
    firstName: "",
    lastName: "",
    slaughterhouse: false,
    positions: [],
    address: "",
    status: "true",
  };

  const form = useForm({ defaultValues });

  const onSubmit = async (data: any) => {
    try {
      const person = await createPersonService({
        code: "",
        identification: data.identification,
        identificationTypeId: Number(data.identificationType),
        genderId: Number(data.genderId),
        mobileNumber: data.mobileNumber,
        firstName: data.firstName,
        lastName: data.lastName,
        fullName: `${data.firstName ?? ""} ${data.lastName ?? ""}`,
        address: data.address,
        affiliationDate: new Date(),
        status: data.status === "true",
      });

      const employeeMap = data?.positions.map((position: any) => {
        return createEmployeeService({
          personId: person.data.id,
          positionId: Number(position.catalogueId),
          suitable: position.suitable,
          suitableLimitations: position.suitableLimitations,
          suitableObservation: position.suitableObservation,
        });
      });

      await Promise.all(employeeMap);

      form.reset(defaultValues);

      await queryClient.invalidateQueries({
        queryKey: ["people"],
      });

      toast.success("Persona creada exitosamente");
    } catch (error: any) {
      console.error("Error al crear persona:", error);
      if (error.response) {
        try {
          const { data } = await error.response.json();
          toast.error(data || "Error al crear la persona");
        } catch {
          toast.error("Error al crear la persona");
        }
      } else {
        toast.error("Error de conexión. Por favor, intente nuevamente.");
      }
    }
  };

  return (
    <Dialog
      open={form.watch("open")}
      onOpenChange={(open) => form.setValue("open", open)}
    >
      <DialogTrigger asChild>
        <Button type="button">
          <PlusIcon />
          Nueva Persona
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-screen overflow-y-auto min-w-[45vw]">
        <DialogHeader>
          <DialogTitle>Nueva Persona</DialogTitle>
          <DialogDescription>
            Complete la información de la persona. Los campos marcados con (*)
            son obligatorios.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-8 grid grid-cols-2 gap-2"
          >
            <NewPeopleFields
              isUpdateVisitorLog={isUpdateVisitorLog}
            />
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
