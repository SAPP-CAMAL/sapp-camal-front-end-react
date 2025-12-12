import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FileCheck, Loader2, SearchIcon, User2Icon } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DialogDescription } from "@radix-ui/react-dialog";
import { Person, ResponsePeopleByFilter } from "@/features/people/domain";

import { getPeopleByFilterService } from "@/features/people/server/db/people.service";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { useDebouncedCallback } from "use-debounce";

import { useAllEquipmentHygieneControl } from "../hooks/use-biosecurity-equipments ";
import {
  saveHygieneControlService,
  updateHygieneControlService,
} from "../server/db/hygiene-control.service";
import { MappedHygieneControl } from "../domain/hygiene-control.types";

interface NewHygieneControlFormProps {
  trigger: React.ReactNode;
  isUpdate?: boolean;
  hygieneControlData?: MappedHygieneControl & { id?: number };
  onSuccess?: () => void;
}

export default function NewHygieneControlForm({
  trigger,
  isUpdate = false,
  onSuccess,
  hygieneControlData,
}: NewHygieneControlFormProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filterFullName, setFilterFullName] = useState("");
  const [filterIdentification, setFilterIdentification] = useState("");
  const [personData, setPersonData] = useState<Person[]>([]);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [debouncedFullName, setDebouncedFullName] = useState("");
  const [debouncedIdentification, setDebouncedIdentification] = useState("");
  const [selectedObservations, setSelectedObservations] = useState("");
  const { data: groupedData, isSuccess } = useAllEquipmentHygieneControl(open);

  const initializeFormWithData = (data: any) => {
    const person: Person = {
      id: data.employeeId,
      fullName: data.employeeFullName,
    };

    setSelectedPerson(person);
    setFilterFullName(data.employeeFullName);
    setFilterIdentification("");
    setSelectedObservations(data.commentary);
  };

  const updateDebouncedFullName = useDebouncedCallback((value: string) => {
    setDebouncedFullName(value);
  }, 500);

  const updateDebouncedIdentification = useDebouncedCallback(
    (value: string) => {
      setDebouncedIdentification(value);
    },
    500
  );

  const query = useQuery<ResponsePeopleByFilter>({
    queryKey: ["people", debouncedFullName, debouncedIdentification],
    queryFn: () =>
      getPeopleByFilterService({
        ...(debouncedIdentification.trim() !== "" && {
          identificacion: debouncedIdentification,
        }),
        ...(debouncedFullName.trim().length >= 2 && {
          fullName: debouncedFullName,
        }),
        isEmployee: true,
      }),
    enabled:
      debouncedFullName.trim().length >= 2 ||
      debouncedIdentification.trim().length >= 3,
  });

  useEffect(() => {
    if (query?.data?.data?.items) {
      setPersonData(query.data.data.items);
    }
  }, [query?.data?.data?.items]);

  useEffect(() => {
    if (!isUpdate) {
      if (
        debouncedFullName.trim().length < 2 &&
        debouncedIdentification.trim().length < 3
      ) {
        setPersonData([]);
        setSelectedPerson(null);
        return;
      }

      if (query?.data?.data?.items) {
        setPersonData(query.data.data.items);
      }
    }
  }, [
    query?.data?.data?.items,
    debouncedFullName,
    debouncedIdentification,
    isUpdate,
  ]);

  useEffect(() => {
    updateDebouncedFullName(filterFullName);
  }, [filterFullName]);

  useEffect(() => {
    updateDebouncedIdentification(filterIdentification);
  }, [filterIdentification]);

  useEffect(() => {
    if (open && isUpdate && hygieneControlData) {
      initializeFormWithData(hygieneControlData);
    }
  }, [open, isUpdate, hygieneControlData]);

  useEffect(() => {
    if (!open) return;
    if (!isUpdate) return;
    if (!hygieneControlData) return;
    if (!isSuccess || !groupedData?.length) return;

    const checked: Record<number, boolean> = {};

    groupedData.forEach((group: any) => {
      const category = group.equipmentTypeDescription;
      const selectedDescriptions =
        hygieneControlData.detailsHygieneGrouped[category] || [];

      group.items.forEach((item: any) => {
        if (selectedDescriptions.includes(item.description)) {
          checked[item.idSettingHygiene] = true;
        }
      });
    });

    setCheckedItems(checked);
  }, [open, isUpdate, hygieneControlData, isSuccess, groupedData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedPerson) {
      toast.error("Debe seleccionar una persona");
      return;
    }

    setIsSubmitting(true);

    try {
      if (isUpdate) {
        await updateHygieneControlService(hygieneControlData?.id ?? 1, {
          idEmployee: hygieneControlData?.employeeId ?? 0,
          status: true,
          settingHygieneIds: Object.entries(checkedItems)
            .filter(([_, isChecked]) => isChecked)
            .map(([id]) => Number(id)),
          commentary: selectedObservations,
        });
        toast.success("Registro actualizado correctamente");
      } else {
        await saveHygieneControlService({
          idEmployee: selectedPerson.idEmployee ?? 0,
          status: true,
          settingHygieneIds: Object.entries(checkedItems)
            .filter(([_, isChecked]) => isChecked)
            .map(([id]) => Number(id)),
          commentary: selectedObservations,
        });
        toast.success("Registro creado exitosamente");
      }

      resetForm();
      onSuccess?.();
      setOpen(false);
    } catch (error: any) {
      const errorMessage =
        error?.response?.status === 404
          ? "La persona ya se encuentra registrada."
          : "Error al guardar";

      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
      resetForm();
    }
  };

  const resetForm = () => {
    setFilterFullName("");
    setFilterIdentification("");
    setSelectedPerson(null);
    setPersonData([]);
    setSelectedObservations("");
    setCheckedItems({});
  };

  const [checkedItems, setCheckedItems] = React.useState<
    Record<number, boolean>
  >({});

  const toggleItem = (id: number) => {
    setCheckedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        if (!newOpen) {
          resetForm();
        }
        setOpen(newOpen);
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>

      <DialogContent className="min-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isUpdate
              ? "Editar Control de Higiene"
              : "Ingreso Control de Higiene"}
          </DialogTitle>
          <DialogDescription>
            {isUpdate ? "Modifique la información." : "Complete el formulario."}
          </DialogDescription>
        </DialogHeader>

        {/* Selección de Empleado */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User2Icon className="h-5 w-5 text-gray-700" />
              Seleccionar Empleado
            </CardTitle>
            <CardDescription>
              {isUpdate
                ? "El empleado está bloqueado en modo edición."
                : "Busque y seleccione el empleado."}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {/* Campos de búsqueda */}
            {!isUpdate && (
              <>
                <Label className="font-semibold">Buscar Empleado</Label>
                <div className="grid grid-cols-2 gap-x-4 w-full mt-4">
                  {/* Buscar por nombre */}
                  <div className="relative">
                    <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 z-10 h-5 w-5" />
                    <Input
                      type="text"
                      placeholder="Buscar por nombre..."
                      className="pl-10 pr-3 w-full"
                      value={filterFullName}
                      onChange={(e) => {
                        setFilterFullName(e.target.value);
                        updateDebouncedFullName(e.target.value);
                      }}
                      disabled={isUpdate}
                    />
                  </div>

                  {/* Buscar por identificación */}
                  <div className="relative">
                    <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 z-10 h-5 w-5" />
                    <Input
                      type="text"
                      placeholder="Número de Identificación..."
                      className="pl-10 pr-3 w-full"
                      value={filterIdentification}
                      onChange={(e) => {
                        setFilterIdentification(e.target.value);
                        updateDebouncedIdentification(e.target.value);
                      }}
                      disabled={isUpdate}
                    />
                  </div>
                </div>
              </>
            )}
            {!selectedPerson &&
              personData?.length === 0 &&
              (debouncedFullName || debouncedIdentification) && (
                <div className="mt-4 p-4 border border-gray-200 rounded-md text-center text-sm text-gray-500 bg-muted/20">
                  No se encontraron resultados para la búsqueda.
                </div>
              )}

            {/* Lista de empleados */}
            {!selectedPerson && personData?.length > 0 && (
              <div className="w-full mt-4 max-h-[300px] overflow-y-auto border border-gray-200 rounded-md p-3 bg-white shadow-sm">
                <div
                  className={`grid gap-2 ${
                    personData.length === 1
                      ? "grid-cols-1"
                      : personData.length === 2
                      ? "sm:grid-cols-2"
                      : "sm:grid-cols-2 md:grid-cols-3"
                  }`}
                >
                  {personData.map((person: Person) => (
                    <div
                      key={person.id}
                      onClick={() => setSelectedPerson(person)}
                      className="cursor-pointer p-3 rounded-lg border hover:bg-muted transition-colors flex items-center justify-between"
                    >
                      <div>
                        <p className="font-medium">{person.fullName}</p>
                        {person.identification && (
                          <p className="text-xs text-gray-500">
                            {person.identification}
                          </p>
                        )}
                      </div>
                      <Button size="sm" variant="secondary">
                        Seleccionar
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Persona seleccionada */}
            {selectedPerson && (
              <div className="w-full mt-4">
                <div className="rounded-xl px-3 py-2 flex justify-between items-center bg-muted border">
                  <div>
                    <p className="font-semibold">{selectedPerson.fullName}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="default">Seleccionado</Badge>
                    {!isUpdate && (
                      <button
                        onClick={() => setSelectedPerson(null)}
                        className="text-xs text-muted-foreground hover:text-foreground"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Control de Vestuario */}
        <Card
          className={`transition-opacity duration-200 ${
            selectedPerson ? "opacity-100" : "opacity-50 pointer-events-none"
          }`}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileCheck className="h-5 w-5 text-gray-700" />
              Control de Higiene
            </CardTitle>
            <CardDescription>
              Seleccione equipamiento de higiene.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Equipments */}

            <div className="flex flex-col gap-4">
              {groupedData?.map((group) => {
                const selectedCount = group.items.filter(
                  (item) => checkedItems[item.id]
                ).length;

                return (
                  <div
                    key={group.equipmentTypeId}
                    className="rounded-md border bg-white shadow-sm"
                  >
                    {/* Cabecera */}
                    <div className="px-4 py-3 text-sm font-medium bg-muted/30 border-b flex justify-between items-center">
                      <span>{group.equipmentTypeDescription}</span>
                      <span className="text-xs px-2 py-0.5 bg-gray-200 rounded">
                        {selectedCount} / {group.items.length}
                      </span>
                    </div>

                    {/* Ítems */}
                    <div className="p-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                      {group.items.map((item) => (
                        <div
                          key={item.idSettingHygiene}
                          className="flex items-center space-x-2 p-2 rounded hover:bg-muted/30 transition-colors"
                        >
                          <input
                            type="checkbox"
                            id={`item-${item.idSettingHygiene}`}
                            className="h-5 w-5 rounded border-gray-300 cursor-pointer accent-[var(--primary)]"
                            checked={!!checkedItems[item.idSettingHygiene]}
                            onChange={() => toggleItem(item.idSettingHygiene)}
                          />
                          <label
                            htmlFor={`item-${item.idSettingHygiene}`}
                            className="text-sm cursor-pointer flex-1"
                          >
                            {item.description}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Observaciones */}
            <div className="flex flex-col">
              <Label className="text-sm font-semibold">Observación</Label>
              <Input
                type="text"
                placeholder="Ingrese Observación..."
                className="pl-10 pr-3 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 h-10"
                value={selectedObservations}
                onChange={(e) => {
                  setSelectedObservations(e.target.value);
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Botones de acción */}
        <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
          <Button
            variant="outline"
            type="button"
            onClick={() => {
              resetForm();
              setOpen(false);
            }}
          >
            Cancelar
          </Button>

          <Button
            onClick={handleSubmit}
            className="bg-primary hover:bg-gray-800"
            disabled={isSubmitting || !selectedPerson}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                {isUpdate ? "Actualizando..." : "Creando..."}
              </>
            ) : isUpdate ? (
              "Actualizar Registro"
            ) : (
              "Crear Registro"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
