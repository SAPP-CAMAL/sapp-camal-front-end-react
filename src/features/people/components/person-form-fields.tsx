"use client";

import { Button } from "@/components/ui/button";
import { PlusIcon, XIcon } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useFieldArray, useFormContext } from "react-hook-form";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useCatalogue } from "@/features/catalogues/hooks/use-catalogue";
import { validateDocumentTypeService } from "../server/db/people.service";

export function NewPeopleFields({
  isUpdate = false,
  updatePersonButton,
  updatePositionsButton,
  isUpdateVisitorLog = false,
  onDeleteEmployee,
  onSlaughterhouseChange,
}: {
  isUpdate?: boolean;
  updatePersonButton?: React.ReactNode;
  updatePositionsButton?: React.ReactNode;
  isUpdateVisitorLog?: boolean;
  onDeleteEmployee?: (employeeId: number) => Promise<void>;
  onSlaughterhouseChange?: (checked: boolean) => void;
}) {
  const catalogueCharges = useCatalogue("CARGOS");
  const catalogueIdentityTypes = useCatalogue("TID");
  const catalogueGenders = useCatalogue("GEN");

  const form = useFormContext();
  const positionsFiledArray = useFieldArray({
    control: form.control,
    name: "positions",
  });

  const isPersonalCamal = form.watch("slaughterhouse");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<{
    index: number;
    employeeId?: number;
  } | null>(null);

  const handleDeleteClick = (index: number, employeeId?: number) => {
    setEmployeeToDelete({ index, employeeId });
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!employeeToDelete) return;

    try {
      // Si tiene employeeId, eliminar del backend
      if (employeeToDelete.employeeId && onDeleteEmployee) {
        await onDeleteEmployee(employeeToDelete.employeeId);
        toast.success("Cargo eliminado exitosamente");
      }
      
      // Eliminar del formulario
      positionsFiledArray.remove(employeeToDelete.index);
      
      setDeleteDialogOpen(false);
      setEmployeeToDelete(null);
    } catch (error: any) {
      console.log({ error });
      toast.error("Ocurrió un error al eliminar el cargo");
    }
  };

  const defaultPositions = isUpdate
    ? form.formState?.defaultValues?.positions?.map((position: any) =>
        Number(position.catalogueId)
      )
    : [];

  const currentPositions = [
    ...positionsFiledArray.fields.map((position: any) =>
      Number(position.catalogueId)
    ),
    defaultPositions,
  ];

  return (
    <>
      <FormField
        control={form.control}
        name="identificationType"
        rules={{
          required: {
            value: true,
            message: "El tipo de identificación es requerido",
          },
        }}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tipo de Identificación *</FormLabel>
            <Select
              onValueChange={(value) => {
                field.onChange(value);
                form.setValue("identification", "");
              }}
              defaultValue={field.value}
            >
              <FormControl>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccione un tipo de identificación" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {catalogueIdentityTypes.data?.data.map(
                  (identityType, index) => (
                    <SelectItem
                      key={index}
                      value={String(identityType.catalogueId)}
                    >
                      {identityType.name}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="identification"
        rules={{
          required: {
            value: true,
            message: "El número de documento es requerido",
          },
          validate: {
            validateDocumentTypeService: async (value, formData) => {
              const currentValue = catalogueIdentityTypes?.data?.data.find(
                (data) =>
                  data.catalogueId === Number(formData.identificationType)
              );

              const isCedula = currentValue?.code === "CED";
              const isRUCJ = currentValue?.code === "RUCJ";
              const isRUCN = currentValue?.code === "RUCN";

              if (!currentValue) return false;

              if (isCedula && value.length !== 10)
                return "El número de documento debe tener 10 caracteres";
              if (isRUCJ && value.length !== 13)
                return "El número de documento debe tener 13 caracteres";

              if (isRUCN && value.length !== 13)
                return "El número de documento debe tener 13 caracteres";

              try {
                const response = await validateDocumentTypeService(currentValue.code, value);
                return !!response?.data?.isValid;
              } catch (error: any) {
                const { message } = await error.response.json();
                return message;
              }
            },
          },
        }}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Número de Documento *</FormLabel>
            <FormControl>
              <Input {...field} className="border-gray-200" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="firstName"
        rules={{
          required: {
            value: true,
            message: "El campo nombres es requerido",
          },
        }}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nombres *</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="lastName"
        rules={{
          required: {
            value: true,
            message: "El campo apellidos es requerido",
          },
        }}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Apellidos *</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />


      <FormField
        control={form.control}
        name="genderId"
        rules={{
          required: {
            value: true,
            message: "El género es requerido",
          },
        }}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Género *</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccione un género" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {catalogueGenders.data?.data.map((gender, index) => (
                  <SelectItem key={index} value={String(gender.catalogueId)}>
                    {gender.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="mobileNumber"
        rules={{
          required: {
            value: true,
            message: "El campo número de teléfono es requerido",
          },
        }}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Número de Teléfono *</FormLabel>
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
          required: {
            value: true,
            message: "El campo de estado es requerido",
          },
        }}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Estado *</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccione un Estado" />
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

      <FormField
        control={form.control}
        name="address"
        render={({ field }) => (
          <FormItem className="col-span-2">
            <FormLabel>Dirección Domiciliaria</FormLabel>
            <FormControl>
              <Textarea {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {updatePersonButton}

      {
        !isUpdateVisitorLog &&
        <div className="border-t border-gray-200 col-span-2">
          <div className="flex gap-x-2 mt-4">
            <FormField
              control={form.control}
              name="slaughterhouse"
              render={({ field }) => (
                <FormItem className="col-span-2 flex gap-x-2">
                  <FormControl>
                    <Checkbox
                      id="camal-1"
                      checked={field.value}
                      onCheckedChange={(checked) => {
                        field.onChange(checked);
                        if (onSlaughterhouseChange) {
                          onSlaughterhouseChange(checked as boolean);
                        }
                      }}
                    />
                  </FormControl>
                  <FormLabel htmlFor="camal-1">Es personal del Camal</FormLabel>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {isPersonalCamal && (
            <div className="bg-gray-50 border border-gray-200 px-4 mt-4 rounded-md">
              <div className="flex justify-between my-2">
                <Label>Cargos del Personal del Camal</Label>
                <Button
                  type="button"
                  onClick={() =>
                    positionsFiledArray.append({
                      catalogueId: "",
                      suitable: false,
                      suitableWithLimitatios: "",
                      observations: "",
                    })
                  }
                  disabled={positionsFiledArray.fields.length === 1}
                >
                  <PlusIcon />
                  Agregar Cargo
                </Button>
              </div>
              <div className="h-96 overflow-y-auto flex flex-col gap-3">
                {positionsFiledArray.fields.length === 0 ? (
                  <p className="text-sm text-center my-6">
                    No hay cargos asignados. Haga clic en &quot;Agregar
                    Cargo&quot; para añadir uno.
                  </p>
                ) : (
                  positionsFiledArray.fields.map((position, index) => {
                    return (
                      <div
                        className="border rounded-md p-3 bg-white"
                        key={position.id}
                      >
                        <section className="flex justify-between">
                          <Label>Cargo del personal del Camal</Label>
                          <Button
                            variant="link"
                            type="button"
                            onClick={() => handleDeleteClick(index, (position as any).employeeId)}
                          >
                            <XIcon className="text-red-500" />
                          </Button>
                        </section>
                        <div className="space-y-4 mt-4">
                          <FormField
                            control={form.control}
                            name={`positions.${index}.catalogueId`}
                            rules={{
                              required: {
                                value: true,
                                message: "El cargo es requerido",
                              },
                            }}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Nombre del Cargo</FormLabel>
                                <Select
                                  onValueChange={(value) => {
                                    // console.log(value, position);

                                    // // @ts-ignore
                                    // if(position.catalogueId) return field.onChange(value);

                                    // positionsFiledArray.update(index, {
                                    //   catalogueId: Number(value),
                                    //   suitable: false,
                                    //   suitableLimitations: "",
                                    //   suitableObservation: "",
                                    // });

                                    return field.onChange(value);
                                  }}
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger className="w-full">
                                      <SelectValue placeholder="Seleccione un cargo" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {catalogueCharges.data?.data.map(
                                      (charge, index) => (
                                        <SelectItem
                                          key={index}
                                          disabled={currentPositions.includes(
                                            charge.catalogueId
                                          )}
                                          value={String(charge.catalogueId)}
                                        >
                                          {charge.name}
                                        </SelectItem>
                                      )
                                    )}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`positions.${index}.suitable`}
                            render={({ field }) => (
                              <FormItem className="flex items-center space-x-2">
                                <FormControl>
                                  <Checkbox
                                    id={`suitable-${index}`}
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                                <FormLabel htmlFor={`suitable-${index}`}>
                                  Apto para este cargo
                                </FormLabel>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`positions.${index}.suitableLimitations`}
                            rules={{
                              required: {
                                value: true,
                                message:
                                  "El campo de limitaciones es requerido",
                              },
                            }}
                            render={({ field }) => (
                              <FormItem className="col-span-2">
                                <FormLabel>Apto con Limitaciones</FormLabel>
                                <FormControl>
                                  <Textarea {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`positions.${index}.suitableObservation`}
                            rules={{
                              required: {
                                value: true,
                                message:
                                  "El campo de observaciones es requerido",
                              },
                            }}
                            render={({ field }) => (
                              <FormItem className="col-span-2">
                                <FormLabel>Observaciones de Aptitud</FormLabel>
                                <FormControl>
                                  <Textarea {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
              {updatePositionsButton}
            </div>
          )}
        </div>
      }

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Está seguro de eliminar este cargo?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El cargo será eliminado permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
