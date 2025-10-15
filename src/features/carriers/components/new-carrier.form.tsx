"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@radix-ui/react-label";
import { useQuery } from "@tanstack/react-query";
import {
  Loader2,
  PlusIcon,
  SearchIcon,
  ToggleLeftIcon,
  ToggleRightIcon,
  Truck,
  XIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { CreateVehicleForm } from "./new-vehicle.form";
import { parseAsInteger, useQueryStates } from "nuqs";
import { getPeopleByFilterService } from "@/features/people/server/db/people.service";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Person, ResponsePeopleByFilter } from "@/features/people/domain";
import {
  getVehicleByFilterService,
  getVehicleByIdService,
} from "@/features/vehicles/server/db/vehicle.service";
import { useCatalogue } from "@/features/catalogues/hooks/use-catalogue";
import { capitalizeText } from "@/lib/utils";
import { getDetailVehicleByTransportIdService } from "@/features/vehicles/server/db/vehicle-detail.service";
import {
  TransportType,
  Vehicle,
} from "@/features/vehicles/domain/vehicle-detail-service";
import {
  createShippingService,
  updateShippingService,
} from "../server/carriers.service";
import { Separator } from "@/components/ui/separator";
import { toCapitalize } from "@/lib/toCapitalize";

interface NewCarrierProps {
  shipping?: any;
  isUpdate?: boolean;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSuccess?: () => void;
}

export function NewCarrier({
  shipping,
  isUpdate,
  trigger,
  onOpenChange,
  open,
  onSuccess,
}: NewCarrierProps) {
  const catalogueTransportsType = useCatalogue("TTR");
  const catalogueVehiclesType = useCatalogue("TVH");
  const [selectedTransportIds, setSelectedTransportIds] = useState<number[]>(
    []
  );
  const [filterFullName, setfilterFullName] = useState("");
  const [filterIdentification, setfilterIdentification] = useState("");

  const [searchParams, setSearchParams] = useQueryStates(
    {
      page: parseAsInteger.withDefault(1),
      limit: parseAsInteger.withDefault(10),
    },
    {
      history: "push",
    }
  );

  const defaultValues = {
    open: false,
  };

  const form = useForm({ defaultValues });
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [showCreateVehicle, setShowCreateVehicle] = useState(false);
  const [vehiclesList, setVehiclesList] = useState<Vehicle[]>([]);
  const [personData, setPersonData] = useState<Person[]>([]);
  const [filterPlate, setFilterPlate] = useState("");
  const [isCreatingShipping, setIsCreatingShipping] = useState(false);
  const [isActive, setIsActive] = useState(shipping?.status);
  const [vehicleTypes, setVehicleTypes] = useState<
    Record<number, TransportType[]>
  >({});
  const [loadingVehicles, setLoadingVehicles] = useState<
    Record<number, boolean>
  >({});
  const query = useQuery<ResponsePeopleByFilter>({
    queryKey: ["people", searchParams],
    queryFn: () =>
      getPeopleByFilterService({
        page: searchParams.page,
        limit: searchParams.limit,
        ...(filterIdentification != "" && {
          identificacion: filterIdentification,
        }),
        ...(filterFullName.length > 2 && {
          fullName: filterFullName,
        }),
      }),
    enabled: false,
  });

  const queryVehicle = useQuery({
    queryKey: ["vehicle", searchParams],
    queryFn: () =>
      getVehicleByFilterService({
        page: searchParams.page,
        limit: searchParams.limit,
        ...(filterPlate.trim().length >= 3 && { plate: filterPlate.trim() }),
        status: true,
      }),
    enabled: false,
  });

  const onSubmit = async (vehicleId: number) => {
    try {
      const vehicle = await getVehicleByIdService(vehicleId);
      setVehiclesList((prev) => [...prev, vehicle.data]);
    } catch (error: any) {
      toast.error("Error al actualizar la lista");
    }
  };

  const handleShippingCreate = async () => {
    if (!selectedPerson?.id || !vehiclesList || vehiclesList.length === 0) {
      toast.error("Seleccione una persona y al menos un vehículo");
      return;
    }

    try {
      setIsCreatingShipping(true);

      const shippingsToCreate = vehiclesList.map((vehicle) => ({
        personId: selectedPerson.id,
        vehicleId: vehicle.id,
      }));

      await createShippingService(shippingsToCreate);

      toast.success(`Se crearon ${vehiclesList.length} envíos exitosamente`);
      setFilterPlate("");
      setSelectedPerson(null);
      setSelectedTransportIds([]);
      setVehiclesList([]);
      form.setValue("open", false);
    } catch (error: any) {
      console.error("Error creating shippings:", error);

      let errorMessage = "Error al crear los envíos";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      toast.error(errorMessage);
    } finally {
      setIsCreatingShipping(false);
    }
  };

  const handleSgippingUpdate = async () => {
    if (shipping?.status === isActive) {
      toast.warning("No se han registrado cambios");
      return;
    }
    try {
      setIsCreatingShipping(true);
      await updateShippingService(shipping.id, isActive);
      toast.success(`Transportista actualizado exitosamente`);
      setFilterPlate("");
      setSelectedPerson(null);
      setSelectedTransportIds([]);
      setVehiclesList([]);
      onOpenChange?.(false);
      form.setValue("open", false);
      onSuccess?.();
    } catch (error: any) {
      let errorMessage = "Error al actualizar";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      toast.error(errorMessage);
    } finally {
      setIsCreatingShipping(false);
    }
  };

  const handleCancelVehicle = () => {
    setShowCreateVehicle(false);
  };

  const handleToggleStatus = () => {
    setIsActive(!isActive);
  };

  const getTransportName = (transportId: number): string => {
    const transport = catalogueTransportsType.data?.data.find(
      (t) => t.catalogueId === transportId
    );
    return transport
      ? transport.name.toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase())
      : "";
  };

  useEffect(() => {
    const hasSearch =
      filterFullName.trim() !== "" || filterIdentification.trim() !== "";
    if (hasSearch) {
      query.refetch();
    } else {
      setSelectedPerson(null);
    }
    if (filterPlate.trim() !== "") {
      queryVehicle.refetch();
    }
  }, [filterFullName, filterIdentification, filterPlate]);

  useEffect(() => {
    const fetchAllVehicleTypes = async () => {
      for (const transportId of selectedTransportIds) {
        if (!vehicleTypes[transportId]) {
          try {
            setLoadingVehicles((prev) => ({
              ...prev,
              [transportId]: true,
            }));

            const response = await getDetailVehicleByTransportIdService(
              transportId
            );
            const data: TransportType[] = response.data;

            setVehicleTypes((prev) => ({
              ...prev,
              [transportId]: data,
            }));
          } catch (error) {
            console.error("Error fetching vehicle types:", error);
          } finally {
            setLoadingVehicles((prev) => ({
              ...prev,
              [transportId]: false,
            }));
          }
        }
      }
    };

    if (selectedTransportIds.length > 0) {
      fetchAllVehicleTypes();
    }
  }, [selectedTransportIds]);

  useEffect(() => {
    if (queryVehicle?.data?.data?.items) {
      setVehiclesList(queryVehicle.data.data.items);
    }
  }, [queryVehicle?.data?.data?.items]);

  useEffect(() => {
    if (query?.data?.data?.items) {
      setPersonData(query.data.data.items);
    }
  }, [query?.data?.data?.items]);

  const handleCheckboxChange = (catalogueId: number, isChecked: boolean) => {
    if (isChecked) {
      setSelectedTransportIds((prev) => [...prev, catalogueId]);
    } else {
      setSelectedTransportIds((prev) =>
        prev.filter((id) => id !== catalogueId)
      );
      setVehicleTypes((prev) => {
        const newState = { ...prev };
        delete newState[catalogueId];
        return newState;
      });
      setLoadingVehicles((prev) => {
        const newState = { ...prev };
        delete newState[catalogueId];
        return newState;
      });
    }
  };

  const getAllVehicleTypes = (): TransportType[] => {
    return Object.values(vehicleTypes).flat();
  };

  const handlePlateInput = (value: string) => {
    let formatted = value.toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (formatted.length > 7) {
      formatted = formatted.slice(0, 7);
    }
    if (formatted.length > 3) {
      formatted = formatted.slice(0, 3) + "-" + formatted.slice(3);
    }
    setFilterPlate(formatted);
  };

  return (
    <Dialog
      open={open ?? form.watch("open")}
      onOpenChange={(newOpen) => {
        setSearchParams({
          page: 1,
          limit: 10,
        });
        setFilterPlate("");
        setVehiclesList([]);
        setSelectedTransportIds([]);
        setfilterFullName("");
        setfilterIdentification("");
        setPersonData([]);
        onOpenChange?.(newOpen);
        form.setValue("open", newOpen);
      }}
    >
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="min-w-6xl max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>
            {isUpdate ? "Editar Transportista" : "Crear Nuevo Transportista"}
          </DialogTitle>
          <DialogDescription>
            {isUpdate
              ? "Modifique la información del transportista."
              : "Complete el formulario para registrar un nuevo transportista en el sistema."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex gap-2 items-center">
                <Truck /> Información del Transportista
              </CardTitle>
              <CardDescription>
                {isUpdate
                  ? "Información del transportista seleccionado."
                  : " Busque y seleccione la persona que actuará como transportista."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!isUpdate && (
                <>
                  <Label htmlFor="" className="font-semibold">
                    Buscar Persona
                  </Label>

                  <div className="grid grid-cols-2 gap-x-4 w-full mt-4">
                    <div className="flex flex-col w-full">
                      <div className="relative">
                        <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 z-10 h-5 w-5" />
                        <Input
                          type="text"
                          placeholder="Buscar por nombre..."
                          className="pl-10 pr-3 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 h-10"
                          value={filterFullName}
                          onChange={(e) => {
                            setfilterFullName(e.target.value);
                          }}
                        />
                      </div>
                    </div>

                    <div className="flex flex-col w-full">
                      <div className="relative">
                        <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 z-10 h-5 w-5" />
                        <Input
                          type="text"
                          placeholder="Número de Identificación..."
                          className="pl-10 pr-3 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 h-10"
                          value={filterIdentification}
                          onChange={(e) => {
                            setfilterIdentification(e.target.value);
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}

              {!isUpdate &&
                !selectedPerson &&
                personData &&
                personData?.length > 0 && (
                  <div className="grid gap-x-4 w-full mt-4">
                    <Card>
                      <ScrollArea className="max-h-64">
                        <CardContent className="flex flex-col gap-2">
                          {personData?.map((person: Person) => {
                            return (
                              <div
                                key={person.id}
                                onClick={() => setSelectedPerson(person)}
                                className="cursor-pointer rounded-xl px-3 py-2 transition-colors flex justify-between items-center hover:bg-muted"
                              >
                                <div>
                                  <p className="font-semibold">
                                    {person.fullName}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    {person.identification} •{" "}
                                    {person.mobileNumber}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </CardContent>
                      </ScrollArea>
                    </Card>
                  </div>
                )}

              {selectedPerson && (
                <div className="w-full mt-4">
                  <div className="rounded-xl px-3 py-2 transition-colors flex justify-between items-center bg-muted border">
                    <div>
                      <p className="font-semibold">{selectedPerson.fullName}</p>
                      <p className="text-sm text-foreground">
                        {selectedPerson.identification} •{" "}
                        {selectedPerson.mobileNumber}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="default">Seleccionada</Badge>
                      <button
                        onClick={() => setSelectedPerson(null)}
                        className="text-xs text-muted-foreground hover:text-foreground"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {isUpdate && (
                <div className="w-full mt-4">
                  <div className="rounded-xl px-3 py-2 transition-colors flex justify-between items-center bg-muted border">
                    <div>
                      <p className="font-semibold">
                        {shipping.person.fullName}
                      </p>
                      <p className="text-sm text-foreground">
                        {shipping.person.identification}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="default">Seleccionada</Badge>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex gap-2 items-center">
                <Truck /> Configuración de Vehículo para Transporte
              </CardTitle>
              <CardDescription>
                {isUpdate
                  ? "Información del vehículo asignado al transportista"
                  : "Configure los vehículos que utilizará para el transporte."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {!isUpdate && (
                <>
                  <div className="space-y-3">
                    <Label className="text-base font-medium">
                      Vehículo para transportar
                    </Label>
                    <div className="flex items-center gap-x-6">
                      {catalogueTransportsType.data?.data.map(
                        (transport, index) => (
                          <Label
                            key={index}
                            className="flex items-center gap-x-2 cursor-pointer"
                          >
                            <Checkbox
                              onCheckedChange={(checked: boolean) =>
                                handleCheckboxChange(
                                  transport.catalogueId,
                                  checked
                                )
                              }
                              checked={selectedTransportIds.includes(
                                transport.catalogueId
                              )}
                            />
                            {capitalizeText(transport.name)}
                          </Label>
                        )
                      )}
                    </div>
                  </div>
                </>
              )}

              {selectedTransportIds.length > 0 && (
                <div className="space-y-4 pt-2 border-t border-gray-100">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-base font-medium">
                        Buscar Vehículo Existente
                      </Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowCreateVehicle(true)}
                        className="flex items-center gap-2"
                        disabled={showCreateVehicle}
                      >
                        <PlusIcon className="h-4 w-4" />
                        Crear Nuevo Vehículo
                      </Button>
                    </div>

                    <div className="relative">
                      <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5" />
                      <Input
                        type="text"
                        placeholder="Buscar por placa"
                        className="pl-10 pr-3 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2"
                        value={filterPlate}
                        onChange={(e) => handlePlateInput(e.target.value)}
                      />
                    </div>
                  </div>

                  {vehiclesList && vehiclesList?.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-base font-medium">
                        Vehículos Agregados
                      </Label>
                      <div className="space-y-2">
                        {vehiclesList.map((vehicle, index) => (
                          <div
                            key={index}
                            className="bg-gray-50 p-3 rounded-md border border-gray-200"
                          >
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-4">
                                <p className="font-medium">
                                  {vehicle.plate} -{" "}
                                  {vehicle.brand + "-" + vehicle.model}
                                </p>
                                <p className="text-sm text-foreground">
                                  {vehicle.vehicleDetail?.vehicleType?.name} •{" "}
                                  {vehicle.color} • {vehicle.manufactureYear} •{" "}
                                  {vehicle.vehicleDetail?.transportType?.name}
                                </p>
                                <p>
                                  <Badge variant="default">Activo</Badge>
                                </p>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  setVehiclesList((prev) =>
                                    prev.filter((_, i) => i !== index)
                                  )
                                }
                                className="text-xs text-muted-foreground hover:text-foreground"
                              >
                                <XIcon className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedTransportIds.length > 0 && (
                    <div className="space-y-2">
                      {selectedTransportIds.map((transportId) => (
                        <div key={transportId}>
                          {loadingVehicles[transportId] ? (
                            <Label className="text-sm text-gray-500">
                              <span className="font-medium">
                                Cargando vehículos...
                              </span>
                            </Label>
                          ) : vehicleTypes[transportId] ? (
                            <Label className="text-sm text-gray-500">
                              <span className="font-medium">
                                Vehículos disponibles para{" "}
                                {getTransportName(transportId).toLowerCase()}:
                              </span>{" "}
                              {catalogueVehiclesType.data?.data
                                .map((vehicle) =>
                                  toCapitalize(vehicle.name ?? "", true)
                                )
                                .join(", ")}
                            </Label>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  )}

                  {showCreateVehicle && (
                    <CreateVehicleForm
                      onCancel={handleCancelVehicle}
                      vehicleTypes={catalogueVehiclesType.data?.data ?? []}
                      onGetVehicleById={onSubmit}
                    />
                  )}
                </div>
              )}

              {isUpdate && (
                <>
                  <div className="w-full mt-4">
                    <p className="font-semibold">Tipo de Transporte</p>
                    <div className="rounded-xl px-3 py-2 transition-colors flex justify-between items-center bg-muted border">
                      <div className="flex items-center gap-2">
                        <Badge variant={"outline"}>
                          {shipping.vehicle?.vehicleDetail?.transportType?.name}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="w-full mt-4">
                    <p className="font-semibold mb-2">
                      Información del Vehículo
                    </p>
                    <div
                      className={`rounded-xl px-3 py-2 transition-colors bg-muted border ${
                        !isActive ? "opacity-50" : ""
                      }`}
                    >
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div>
                          <Label className="text-gray-500">Placa:</Label>
                          <p className="font-semibold">
                            {shipping.vehicle.plate}
                          </p>
                        </div>
                        <div>
                          <Label className="text-gray-500">Marca:</Label>
                          <p className="font-semibold">
                            {shipping.vehicle.brand}
                          </p>
                        </div>
                        <div>
                          <Label className="text-gray-500">Modelo:</Label>
                          <p className="font-semibold">
                            {shipping.vehicle.model}
                          </p>
                        </div>
                        <div>
                          <Label className="text-gray-500">Año:</Label>
                          <p className="font-semibold">
                            {shipping.vehicle.manufactureYear}
                          </p>
                        </div>
                        <div>
                          <Label className="text-gray-500">Color:</Label>
                          <p className="font-semibold">
                            {shipping.vehicle.color}
                          </p>
                        </div>
                      </div>

                      <Separator className="my-4" />

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">Estado:</span>
                          <Badge
                            className="text-sm px-3 py-1 rounded-full"
                            variant={isActive ? "tertiary" : "outline"}
                          >
                            {isActive ? "Activo" : "Inactivo"}
                          </Badge>
                        </div>

                        <button
                          onClick={handleToggleStatus}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 hover:bg-none transition-colors"
                        >
                          <span
                            className={`${
                              !isActive ? "font-bold" : "text-gray-400"
                            }`}
                          >
                            Inactivo
                          </span>
                          {isActive ? (
                            <ToggleRightIcon className="w-8 h-8 text-green-500" />
                          ) : (
                            <ToggleLeftIcon className="w-8 h-8 text-gray-500" />
                          )}

                          <span
                            className={`${
                              isActive ? "font-bold" : "text-gray-400"
                            }`}
                          >
                            Activo
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end gap-x-2 pt-4 border-t border-gray-100 flex-shrink-0">
          <Button
            type="button"
            variant={"outline"}
            disabled={form.formState.isSubmitting}
            onClick={() => {
              setSearchParams({
                page: 1,
                limit: 10,
              });
              setFilterPlate("");
              setSelectedPerson(null);
              setSelectedTransportIds([]);
              setVehiclesList([]);
              setPersonData([]);
              setfilterFullName("");
              setfilterIdentification("");
              form.setValue("open", false);
            }}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            className="bg-black hover:bg-gray-800"
            disabled={isCreatingShipping}
            onClick={isUpdate ? handleSgippingUpdate : handleShippingCreate}
          >
            {isCreatingShipping ? (
              <>
                <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                {isUpdate ? "Actualizando..." : "Creando..."}
              </>
            ) : isUpdate ? (
              "Actualizar Transportista"
            ) : (
              "Crear Transportista"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
