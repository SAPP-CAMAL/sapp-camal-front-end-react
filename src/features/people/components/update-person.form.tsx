"use client";

import { useEffect } from "react";
import { EditIcon } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";

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
import { updatePersonService } from "../server/db/people.service";
import { NewPeopleFields } from "./person-form-fields";
import {
  getEmployeesByPersonIdService,
  updateEmployeeService,
} from "@/features/employees/server/db/employees.services";
import { useSearchParams } from "next/navigation";

export function UpdatePerson({ person }: { person: any }) {
  const searchParams = useSearchParams();

  const queryClient = useQueryClient();
  const defaultValues = {
    open: false,
    identificationType: String(person.identificationType.id),
    identification: person.identification,
    genderId: String(person.genderId),
    mobileNumber: person.mobileNumber,
    firstName: person.firstName,
    lastName: person.lastName,
    slaughterhouse: false,
    address: person.address,
    positions: [],
    status: person.status?.toString(),
  };
  const form = useForm<any>({ defaultValues });
  const personId = person.id;
  const open = form.watch("open");
  // const positions = useWatch({ name: "positions", control: form.control });

  useEffect(() => {
    if (open) {
      getEmployeesByPersonIdService(personId)
        .then((resp) => {
          if (resp.data.length === 0) return;

          form.reset({
            ...defaultValues,
            open: true,
            slaughterhouse: true,
            positions: resp.data.map((employee) => ({
              employeeId: employee.id,
              personId: employee.personId,
              catalogueId: String(employee.positionId),
              suitable: employee.suitable,
              suitableLimitations: employee.suitableLimitations,
              suitableObservation: employee.suitableObservation,
            })),
          });
        })
        .catch((error) => console.log(error));
    }
  }, [open, person]);

  const onSubmit = async (data: any) => {
    try {
      if (!form.formState.isDirty) return;

      const shouldUpdatePerson =
        form.formState.dirtyFields.identification ||
        form.formState.dirtyFields.identificationType ||
        form.formState.dirtyFields.genderId ||
        form.formState.dirtyFields.mobileNumber ||
        form.formState.dirtyFields.firstName ||
        form.formState.dirtyFields.lastName ||
        form.formState.dirtyFields.address ||
        form.formState.dirtyFields.status;

      if (shouldUpdatePerson) {
        await updatePersonService(person.id, {
          ...(form.formState.dirtyFields.identification && {
            identification: data.identification,
          }),
          ...(form.formState.dirtyFields.identificationType && {
            identificationTypeId: Number(data.identificationType),
          }),
          ...(form.formState.dirtyFields.genderId && {
            genderId: Number(data.genderId),
          }),
          ...(form.formState.dirtyFields.mobileNumber && {
            mobileNumber: data.mobileNumber,
          }),
          ...(form.formState.dirtyFields.firstName && {
            firstName: data.firstName,
          }),
          ...(form.formState.dirtyFields.lastName && {
            lastName: data.lastName,
          }),
          ...(form.formState.dirtyFields.address && {
            address: data.address,
          }),
          ...(form.formState.dirtyFields.status && {
            status: data.status === "true",
          }),
        });
      }

      console.log(form.formState.dirtyFields.positions);

      if (form.formState.dirtyFields.positions) {
        await Promise.all(
          data.positions.map((position: any) => {
            const changePositionId =
              form.formState.dirtyFields.positions?.[0]?.catalogueId;

            return updateEmployeeService(position.employeeId, {
              ...(changePositionId && {
                positionId: Number(position.catalogueId),
                personId,
              }),
              ...(form.formState.dirtyFields?.positions?.[0]?.suitable && {
                suitable: position.suitable,
              }),
              ...(form.formState.dirtyFields?.positions?.[0]
                ?.suitableLimitations && {
                suitableLimitations: position.suitableLimitations,
              }),
              ...(form.formState.dirtyFields?.positions?.[0]
                ?.suitableObservation && {
                suitableObservation: position.suitableObservation,
              }),
            });
          })
        );
      }

      form.reset({
        ...form.formState.defaultValues,
        open: false,
      });

      const searchParamsObject = Object.fromEntries(searchParams.entries());

      await queryClient.invalidateQueries({
        queryKey: ["people", searchParamsObject],
      });

      toast.success("Persona actualizada exitosamente");
    } catch (error: any) {
      console.log({ error });
      const { data } = await error.response.json();
      toast.error(data);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(open) => form.setValue("open", open)}>
      <DialogTrigger asChild>
        <Button variant={"outline"}>
          <EditIcon />
        </Button>
      </DialogTrigger>
      <DialogContent className="min-w-[80vw] min-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Editar Persona</DialogTitle>
          <DialogDescription>
            Complete la información de la persona. Los campos marcados con (*)
            son obligatorios.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="gap-y-4 grid grid-cols-2 gap-2"
          >
            <NewPeopleFields isUpdate />
            <div className="flex justify-end col-span-2">
              <Button
                type="submit"
                disabled={
                  form.formState.isSubmitting || !form.formState.isDirty
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
