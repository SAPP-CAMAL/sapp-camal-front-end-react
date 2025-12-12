import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChevronDown,
  FileCheck,
  Loader2,
  SearchIcon,
  User2Icon,
} from "lucide-react";
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
import { getAllObservationsService } from "../server/db/observations.service";
import { capitalizeText } from "@/lib/utils";
import { useBiosecurityEquipments } from "../hooks/use-biosecurity-equipments ";
import { MappedLockerRoomControl } from "../domain/locker-room-control.types";
import {
  saveLockerRoomControlService,
  updateLockerRoomControlService,
} from "../server/db/locker-room-control.service";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { BiosecurityLines } from "../domain/biosecurityLines.types";

interface NewAddresseesFormProps {
  trigger: React.ReactNode;
  isUpdate?: boolean;
  lockerRoomData?: MappedLockerRoomControl & { id?: number };
  biosecurityLines: BiosecurityLines[];
  onSuccess?: () => void;
  selectedLine: string;
  setSelectedLine: any;
}

export default function NewLockerRoomControlForm({
  trigger,
  isUpdate = false,
  onSuccess,
  lockerRoomData,
  biosecurityLines,
  selectedLine,
  setSelectedLine,
}: NewAddresseesFormProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filterFullName, setFilterFullName] = useState("");
  const [filterIdentification, setFilterIdentification] = useState("");
  const [personData, setPersonData] = useState<Person[]>([]);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [debouncedFullName, setDebouncedFullName] = useState("");
  const [debouncedIdentification, setDebouncedIdentification] = useState("");
  const [selectedObservations, setSelectedObservations] = useState<string[]>(
    []
  );
  const { groupedData, isLoading, isError } = useBiosecurityEquipments(
    Number(selectedLine)
  );
  const initializeFormWithData = (data: any) => {
    const person: Person = {
      id: data.idEmployee,
      fullName: data.employeeFullName,
    };

    setSelectedPerson(person);
    setFilterFullName(data.employeeFullName);
    setFilterIdentification("");
    setSelectedLine(data.biosecurityLine?.toString());
    setSelectedObservations(
      data.observationsLocker.map((obs: any) => String(obs.idObservation))
    );
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

  const ObservationsList = useQuery({
    queryKey: ["observations"],
    queryFn: getAllObservationsService,
    enabled: open,
  });

  useEffect(() => {
    if (query?.data?.data?.items) {
      setPersonData(query.data.data.items);
    }
  }, [query?.data?.data?.items]);

  useEffect(() => {
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
  }, [query?.data?.data?.items, debouncedFullName, debouncedIdentification]);

  useEffect(() => {
    updateDebouncedFullName(filterFullName);
  }, [filterFullName]);

  useEffect(() => {
    updateDebouncedIdentification(filterIdentification);
  }, [filterIdentification]);

  useEffect(() => {
    if (open && isUpdate && lockerRoomData) {
      initializeFormWithData(lockerRoomData);
    }
  }, [open, isUpdate, lockerRoomData]);

  useEffect(() => {
    if (isUpdate && lockerRoomData && Object.keys(groupedData).length > 0) {
      const checked: Record<number, boolean> = {};

      // Recorremos el objeto agrupado que viene de la API
      Object.entries(groupedData).forEach(([category, items]: any) => {
        const selectedDescriptions =
          lockerRoomData.detailsLockerGrouped[category] || [];

        items.forEach((item: any) => {
          if (selectedDescriptions.includes(item.equipment.description)) {
            checked[item.id] = true;
          }
        });
      });

      setCheckedItems(checked);
    }
  }, [groupedData, lockerRoomData, isUpdate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedPerson) {
      toast.error("Debe seleccionar una persona");
      return;
    }

    setIsSubmitting(true);

    try {
      if (isUpdate) {
        await updateLockerRoomControlService(lockerRoomData?.id ?? 1, {
          idEmployee: lockerRoomData?.employeeId ?? 0,
          status: true,
          settingEquipmentLines: Object.entries(checkedItems)
            .filter(([_, isChecked]) => isChecked)
            .map(([id]) => ({
              idSettingEquipmentLine: Number(id),
            })),
          observations: selectedObservations.map((id) => ({
            idObservation: Number(id),
          })),
        });
        toast.success("Registro actualizado correctamente");
      } else {
        await saveLockerRoomControlService({
          idEmployee: selectedPerson.idEmployee ?? 0,
          status: true,
          settingEquipmentLines: Object.entries(checkedItems)
            .filter(([_, isChecked]) => isChecked)
            .map(([id]) => ({
              idSettingEquipmentLine: Number(id),
            })),
          observations: selectedObservations.map((id) => ({
            idObservation: Number(id),
          })),
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
    //setSelectedLine("");
    setSelectedObservations([]);
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
            {isUpdate ? "Editar Vestuario" : "Ingreso Control de Vestuario"}
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
              Control de Vestuario
            </CardTitle>
            <CardDescription>
              Seleccione la línea de bioseguridad, observaciones y el detalle
              del vestuario.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Línea */}
            <div className="flex flex-col">
              <Label className="text-sm font-semibold">Línea</Label>
              <Select
                value={selectedLine}
                onValueChange={(value) => setSelectedLine(value)}
              >
                <SelectTrigger className="h-10 w-full border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500">
                  <SelectValue placeholder="Seleccione una línea" />
                </SelectTrigger>
                <SelectContent>
                  {biosecurityLines?.map((line, index) => (
                    <SelectItem key={index} value={String(line.id)}>
                      {capitalizeText(line.name)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Equipos agrupados */}
            <div className="flex flex-col gap-4">
              {Object.entries(groupedData).map(([category, items]: any) => {
                const selectedCount = items.filter(
                  (item: any) => checkedItems[item.id]
                ).length;

                return (
                  <div
                    key={category}
                    className="rounded-md border bg-white shadow-sm"
                  >
                    <div className="px-4 py-3 text-sm font-medium bg-muted/30 border-b flex justify-between items-center">
                      <span>{category}</span>
                      <span className="text-xs px-2 py-0.5 bg-gray-200 rounded">
                        {selectedCount} / {items.length}
                      </span>
                    </div>

                    <div className="p-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {items.map((item: any) => (
                        <div
                          key={item.id}
                          className="flex items-center space-x-2 p-2 rounded hover:bg-muted/30 transition-colors"
                        >
                          <input
                            type="checkbox"
                            id={`item-${item.id}`}
                            className="h-5 w-5 rounded border-gray-300 cursor-pointer accent-[var(--primary)]"
                            checked={!!checkedItems[item.id]}
                            onChange={() => toggleItem(item.id)}
                          />
                          <label
                            htmlFor={`item-${item.id}`}
                            className="text-sm cursor-pointer flex-1"
                          >
                            {item.equipment.description}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Observaciones */}
            {Object.entries(groupedData).length > 0 && (
              <div className="flex flex-col">
                <Label className="text-sm font-semibold">Observaciones</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      className="justify-between w-full"
                    >
                      {selectedObservations.length > 0
                        ? `${selectedObservations.length} seleccionadas`
                        : "Seleccione observaciones"}
                      <ChevronDown className="h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>

                  <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-2">
                    <div className="flex flex-col space-y-1 max-h-60 overflow-y-auto">
                      {ObservationsList.data?.data.map((observation: any) => (
                        <div
                          key={observation.id}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            id={`obs-${observation.id}`}
                            checked={selectedObservations.includes(
                              String(observation.id)
                            )}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedObservations((prev) => [
                                  ...prev,
                                  String(observation.id),
                                ]);
                              } else {
                                setSelectedObservations((prev) =>
                                  prev.filter(
                                    (id) => id !== String(observation.id)
                                  )
                                );
                              }
                            }}
                          />
                          <label
                            htmlFor={`obs-${observation.id}`}
                            className="text-sm cursor-pointer select-none"
                          >
                            {observation.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            )}
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
