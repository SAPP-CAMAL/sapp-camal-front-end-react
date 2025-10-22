"use client";

import { useEffect } from "react";
import { EditIcon, SaveIcon, BriefcaseIcon } from "lucide-react";
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
  createEmployeeService,
} from "@/features/employees/server/db/employees.services";
import { useSearchParams } from "next/navigation";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toCapitalize } from "@/lib/toCapitalize";

export function UpdatePerson({ person }: { person: any }) {
  const searchParams = useSearchParams();

  const queryClient = useQueryClient();
  const defaultValues = {
    open: false,
    identificationType: String(person.identificationType.id),
    identification: person.identification ?? "",
    genderId: String(person.genderId),
    mobileNumber: person.mobileNumber ?? "",
    firstName: toCapitalize(person.firstName ?? "", true),
    lastName: toCapitalize(person.lastName ?? "", true),
    slaughterhouse: false,
    address: person.address ?? "",
    positions: [],
    status: person.status?.toString() ?? "",
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

  const onSubmitPersonInfo = async (data: any) => {
    try {
      const shouldUpdatePerson =
        form.formState.dirtyFields.identification ||
        form.formState.dirtyFields.identificationType ||
        form.formState.dirtyFields.genderId ||
        form.formState.dirtyFields.mobileNumber ||
        form.formState.dirtyFields.firstName ||
        form.formState.dirtyFields.lastName ||
        form.formState.dirtyFields.address ||
        form.formState.dirtyFields.status;

      if (!shouldUpdatePerson) {
        toast.info("No hay cambios en la información personal");
        return;
      }

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

      form.reset({
        ...form.getValues(),
        open: true,
      });

      const searchParamsObject = Object.fromEntries(searchParams.entries());

      await queryClient.invalidateQueries({
        queryKey: ["people", searchParamsObject],
      });

      toast.success("Información personal actualizada exitosamente");
    } catch (error: any) {
      console.log({ error });
      if (error.response) {
        try {
          const { data } = await error.response.json();
          toast.error(
            data || "Ocurrió un error al actualizar la información personal"
          );
        } catch {
          toast.error("Ocurrió un error al actualizar la información personal");
        }
      } else {
        toast.error("Error de conexión. Por favor, intente nuevamente.");
      }
    }
  };

  const onSubmitPositions = async (data: any) => {
    try {
      if (!form.formState.dirtyFields.positions && !data.slaughterhouse) {
        toast.info("No hay cambios en los cargos");
        return;
      }

      await Promise.all(
        data.positions.map((position: any, index: number) => {
          // Si el cargo tiene employeeId, actualizar; si no, crear nuevo
          if (position.employeeId) {
            const changePositionId =
              form.formState.dirtyFields.positions?.[index]?.catalogueId;

            return updateEmployeeService(position.employeeId, {
              ...(changePositionId && {
                positionId: Number(position.catalogueId),
              }),
              ...(form.formState.dirtyFields?.positions?.[index]?.suitable && {
                suitable: position.suitable,
              }),
              ...(form.formState.dirtyFields?.positions?.[index]
                ?.suitableLimitations && {
                suitableLimitations: position.suitableLimitations,
              }),
              ...(form.formState.dirtyFields?.positions?.[index]
                ?.suitableObservation && {
                suitableObservation: position.suitableObservation,
              }),
            });
          } else {
            // Crear nuevo empleado
            return createEmployeeService({
              personId,
              positionId: Number(position.catalogueId),
              suitable: position.suitable,
              suitableLimitations: position.suitableLimitations,
              suitableObservation: position.suitableObservation,
            });
          }
        })
      );

      form.reset({
        ...form.getValues(),
        open: true,
      });

      const searchParamsObject = Object.fromEntries(searchParams.entries());

      await queryClient.invalidateQueries({
        queryKey: ["people", searchParamsObject],
      });

      toast.success("Cargos actualizados exitosamente");
    } catch (error: any) {
      console.log({ error });
      if (error.response) {
        try {
          const { data } = await error.response.json();
          toast.error(data || "Ocurrió un error al actualizar los cargos");
        } catch {
          toast.error("Ocurrió un error al actualizar los cargos");
        }
      } else {
        toast.error("Error de conexión. Por favor, intente nuevamente.");
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={(open) => form.setValue("open", open)}>
      <Tooltip>
        <TooltipTrigger asChild>
          <DialogTrigger asChild>
            <Button variant={"outline"}>
              <EditIcon />
            </Button>
          </DialogTrigger>
        </TooltipTrigger>
        <TooltipContent
          side="top"
          align="center"
          sideOffset={5}
          avoidCollisions
        >
          Editar persona
        </TooltipContent>
      </Tooltip>

      <DialogContent className="max-h-screen overflow-y-auto min-w-[45vw]">
        <DialogHeader>
          <DialogTitle>Editar Persona</DialogTitle>
          <DialogDescription>
            Complete la información de la persona. Los campos marcados con (*)
            son obligatorios.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form className="gap-y-4 grid grid-cols-2 gap-2">
            <NewPeopleFields
              isUpdate
              updatePersonButton={
                <div className="col-span-2 border-t pt-4 flex justify-end">
                  <Button
                    type="button"
                    onClick={form.handleSubmit(onSubmitPersonInfo)}
                    disabled={
                      form.formState.isSubmitting ||
                      !(
                        form.formState.dirtyFields.identification ||
                        form.formState.dirtyFields.identificationType ||
                        form.formState.dirtyFields.genderId ||
                        form.formState.dirtyFields.mobileNumber ||
                        form.formState.dirtyFields.firstName ||
                        form.formState.dirtyFields.lastName ||
                        form.formState.dirtyFields.address ||
                        form.formState.dirtyFields.status
                      )
                    }
                  >
                    <SaveIcon className="mr-2 h-4 w-4" />
                    {form.formState.isSubmitting
                      ? "Actualizando..."
                      : "Actualizar Información"}
                  </Button>
                </div>
              }
              updatePositionsButton={
                form.watch("slaughterhouse") &&
                form.watch("positions")?.length > 0 ? (
                  <div className="col-span-2 mt-4 flex justify-end">
                    <Button
                      type="button"
                      onClick={form.handleSubmit(onSubmitPositions)}
                      disabled={
                        form.formState.isSubmitting ||
                        (!form.formState.dirtyFields.positions &&
                          form
                            .watch("positions")
                            ?.every((p: any) => p.employeeId))
                      }
                    >
                      <BriefcaseIcon className="mr-2 h-4 w-4" />
                      {form.formState.isSubmitting
                        ? "Actualizando..."
                        : "Actualizar Cargo"}
                    </Button>
                  </div>
                ) : null
              }
            />
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
