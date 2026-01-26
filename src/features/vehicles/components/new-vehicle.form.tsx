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
import { Car, Loader2, ToggleLeftIcon, ToggleRightIcon } from "lucide-react";
import { toast } from "sonner";
import {
  createVehicleService,
  updateVehicleService,
} from "@/features/vehicles/server/db/vehicle.service";
import { getDetailVehicleByTransportIdService } from "@/features/vehicles/server/db/vehicle-detail.service";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DialogDescription } from "@radix-ui/react-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { TransportType } from "@/features/vehicles/domain/vehicle-detail-service";

export interface VehicleData {
  plate: string;
  vehicleTypeId: string;
  brand: string;
  model: string;
  color: string;
  year: number;
  transportTypeId?: string;
  status: boolean;
}

interface NewVehicleFormProps {
  vehicleTypes?: any[];
  transportsTypes: any[];
  trigger: React.ReactNode;
  isUpdate?: boolean;
  initialData?: VehicleData & { id?: number };
  onSuccess?: () => void;
}

export default function NewVehicleForm({
  vehicleTypes,
  transportsTypes,
  trigger,
  isUpdate = false,
  initialData,
  onSuccess,
}: NewVehicleFormProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isActive, setIsActive] = useState(initialData?.status);
  const [availableVehicleTypes, setAvailableVehicleTypes] = useState<
    TransportType[]
  >([]);
  const [isLoadingVehicleTypes, setIsLoadingVehicleTypes] = useState(false);
  const [vehicleData, setVehicleData] = useState<VehicleData>({
    plate: "",
    vehicleTypeId: "",
    brand: "",
    model: "",
    color: "",
    year: new Date().getFullYear(),
    transportTypeId: "",
    status: true,
  });

    // Seleccionar automáticamente el primer tipo de vehículo si no hay vehicleTypeId
    useEffect(() => {
      if (
        !vehicleData.vehicleTypeId &&
        availableVehicleTypes.length > 0 &&
        vehicleData.transportTypeId
      ) {
        setVehicleData((prev) => ({
          ...prev,
          vehicleTypeId: String(availableVehicleTypes[0].vehicleTypeId ?? availableVehicleTypes[0].id),
        }));
      }
    }, [availableVehicleTypes, vehicleData.vehicleTypeId, vehicleData.transportTypeId]);

  useEffect(() => {
    if (open) {
      if (isUpdate && initialData) {
        setVehicleData({
          plate: initialData.plate ?? "",
          vehicleTypeId: initialData.vehicleTypeId ?? "",
          brand: initialData.brand ?? "",
          model: initialData.model ?? "",
          color: initialData.color ?? "",
          year: initialData.year ?? new Date().getFullYear(),
          transportTypeId: initialData.transportTypeId ?? "",
          status: initialData.status ?? true,
        });
        setIsActive(initialData.status ?? true);
      } else {
        // Limpiar el formulario al abrir para nuevo registro
        setVehicleData({
          plate: "",
          vehicleTypeId: "",
          brand: "",
          model: "",
          color: "",
          year: new Date().getFullYear(),
          transportTypeId: "",
          status: true,
        });
        setIsActive(true);
      }
    }
  }, [open, isUpdate, initialData]);

  // Cargar tipos de vehículo cuando cambia el tipo de transporte
  useEffect(() => {
    const loadVehicleTypes = async () => {
      if (!vehicleData.transportTypeId) {
        setAvailableVehicleTypes([]);
        return;
      }

      setIsLoadingVehicleTypes(true);
      try {
        const response = await getDetailVehicleByTransportIdService(
          Number(vehicleData.transportTypeId)
        );

        // Eliminar duplicados basándose en el nombre (case-insensitive)
        const uniqueTypes = Array.from(
          new Map(
            (response.data || []).map((tipo) => [
              tipo.name.toUpperCase().trim(), // Key: nombre en mayúsculas sin espacios
              tipo
            ])
          ).values()
        );

        setAvailableVehicleTypes(uniqueTypes);

        // Si estamos en modo edición y hay un vehicleTypeId, verificar que esté en la lista
        if (isUpdate && vehicleData.vehicleTypeId) {
          const vehicleTypeExists = uniqueTypes.some(
            (tipo) => String(tipo.id) === vehicleData.vehicleTypeId
          );

          // Si el tipo de vehículo actual no está en la lista, limpiarlo
          if (!vehicleTypeExists) {
            handleInputChange("vehicleTypeId", "");
          }
        }
      } catch (error) {
        console.error("Error loading vehicle types:", error);
        toast.error("Error al cargar tipos de vehículo");
        setAvailableVehicleTypes([]);
      } finally {
        setIsLoadingVehicleTypes(false);
      }
    };

    loadVehicleTypes();
  }, [vehicleData.transportTypeId]);

  const handleToggleStatus = () => {
    setIsActive(!isActive);
  };
  const handleInputChange = (field: keyof VehicleData, value: any) => {
    setVehicleData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCancel = () => {
    setOpen(false);
    setVehicleData({
      plate: "",
      vehicleTypeId: "",
      brand: "",
      model: "",
      color: "",
      year: new Date().getFullYear(),
      transportTypeId: "",
      status: true,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validar que se haya seleccionado tipo de transporte
      if (!vehicleData.transportTypeId) {
        toast.error("Debe seleccionar un tipo de transporte");
        setIsSubmitting(false);
        return;
      }

      // Validar que se haya seleccionado tipo de vehículo
      if (!vehicleData.vehicleTypeId) {
        toast.error("Debe seleccionar un tipo de vehículo");
        setIsSubmitting(false);
        return;
      }

      if (isUpdate && initialData?.id) {
        await updateVehicleService(initialData.id, {
          vehicleTypeId: Number(vehicleData.vehicleTypeId),
          transportTypeId: Number(vehicleData.transportTypeId),
          plate: (vehicleData.plate ?? "").toUpperCase(),
          brand: vehicleData.brand.trim(),
          model: vehicleData.model.trim(),
          color: vehicleData.color.trim(),
          manufactureYear: Number(vehicleData.year),
          status: isActive ?? vehicleData.status,
        });
        toast.success("Vehículo actualizado correctamente");
      } else {
        await createVehicleService({
          vehicleTypeId: Number(vehicleData.vehicleTypeId),
          transportTypeId: Number(vehicleData.transportTypeId),
          plate: (vehicleData.plate ?? "").toUpperCase().replace(/-/g, ""),
          brand: vehicleData.brand.trim(),
          model: vehicleData.model.trim(),
          color: vehicleData.color.trim(),
          manufactureYear: Number(vehicleData.year),
        });
        toast.success("Vehículo creado exitosamente");
      }

      handleCancel();
      // Esperar a que el modal se cierre antes de refetch
      setTimeout(() => {
        onSuccess?.();
      }, 200);
    } catch (error) {
      toast.error("Error al guardar el vehículo");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {isUpdate ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
          </TooltipTrigger>
          <TooltipContent
            side="top"
            align="center"
            sideOffset={5}
            avoidCollisions
          >
            Editar vehículo
          </TooltipContent>
        </Tooltip>
      ) : (
        <DialogTrigger asChild>{trigger}</DialogTrigger>
      )}

      <DialogContent className="w-[95vw] md:max-w-4xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">
            {isUpdate ? "Editar Vehículo" : "Registrar Nuevo Vehículo"}
          </DialogTitle>
          <DialogDescription className="text-sm">
            {isUpdate
              ? "Modifique la información del vehículo."
              : "Complete el formulario para registrar un nuevo vehículo en el sistema."}
          </DialogDescription>
        </DialogHeader>
        <Card className="border-0 shadow-none">
          <CardHeader className="pb-3 px-0 sm:px-2">
            <CardTitle className="text-base sm:text-lg flex items-center gap-2">
              <Car className="h-4 w-4 sm:h-5 sm:w-5 text-gray-700" />
              Información del Vehículo
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Complete la información del nuevo vehículo.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-0 sm:px-2">
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              <div className="w-full">
                <Label className="text-xs sm:text-sm font-medium">
                  Tipo de Transporte <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={vehicleData.transportTypeId}
                  onValueChange={(value) => {
                    handleInputChange("transportTypeId", value);
                    // Limpiar el tipo de vehículo cuando cambia el transporte
                    handleInputChange("vehicleTypeId", "");
                  }}
                  required
                  disabled={isSubmitting}
                >
                  <SelectTrigger className="h-9 w-full text-xs sm:text-sm">
                    <SelectValue placeholder="Seleccione el tipo de transporte" />
                  </SelectTrigger>
                  <SelectContent
                    position="popper"
                    sideOffset={5}
                    className="max-h-[200px] overflow-y-auto"
                  >
                    {transportsTypes?.length ? (
                      // Eliminar duplicados por nombre (case-insensitive)
                      Array.from(
                        new Map(
                          transportsTypes.map((tipo: any) => [
                            tipo.name.toUpperCase().trim(), // Key: nombre en mayúsculas
                            tipo
                          ])
                        ).values()
                      ).map((tipo: any) => (
                        <SelectItem
                          key={`transport-type-${tipo.catalogueId}`}
                          value={String(tipo.catalogueId)}
                        >
                          {tipo.name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-data" disabled>
                        No hay tipos disponibles
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              {isUpdate && (
                <div className="w-full">
                  <Label className="text-xs sm:text-sm font-medium">
                    Estado <span className="text-red-500">*</span>
                  </Label>
                  <div className="rounded-xl px-2 sm:px-3 py-2 bg-muted border mt-2">
                    <button
                      type="button"
                      onClick={handleToggleStatus}
                      className="flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors w-full justify-between"
                    >
                      <span
                        className={`text-sm sm:text-base ${
                          isActive ? "font-bold" : "text-gray-400"
                        }`}
                      >
                        {isActive ? "Activo" : "Inactivo"}
                      </span>
                      {isActive ? (
                        <ToggleRightIcon className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
                      ) : (
                        <ToggleLeftIcon className="w-6 h-6 sm:w-8 sm:h-8 text-gray-500" />
                      )}
                    </button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                <div className="space-y-2">
                  <Label htmlFor="plate" className="text-xs sm:text-sm font-medium">
                    Placa <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="plate"
                    type="text"
                    placeholder="ABC-123"
                    value={vehicleData.plate}
                    onChange={(e) =>
                      handleInputChange("plate", e.target.value.toUpperCase())
                    }
                    className="h-9 uppercase text-xs sm:text-sm"
                    maxLength={8}
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs sm:text-sm font-medium">
                    Tipo de Vehículo <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={vehicleData.vehicleTypeId}
                    onValueChange={(value) =>
                      handleInputChange("vehicleTypeId", value)
                    }
                    required
                    disabled={
                      isSubmitting ||
                      isLoadingVehicleTypes ||
                      !vehicleData.transportTypeId
                    }
                  >
                    <SelectTrigger className="h-9 text-xs sm:text-sm w-full">
                      <SelectValue
                        placeholder={
                          !vehicleData.transportTypeId
                            ? "Primero seleccione tipo de transporte"
                            : isLoadingVehicleTypes
                            ? "Cargando..."
                            : "Seleccione el tipo"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent
                      position="popper"
                      sideOffset={5}
                      className="max-h-[200px] overflow-y-auto"
                    >
                      {availableVehicleTypes?.length ? (
                        availableVehicleTypes.map((tipo) => (
                          <SelectItem key={`vehicle-type-${tipo.id}`} value={String(tipo.vehicleTypeId)}>
                            {tipo.name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-data" disabled>
                          {!vehicleData.transportTypeId
                            ? "Seleccione primero un tipo de transporte"
                            : "No hay tipos disponibles"}
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="brand" className="text-xs sm:text-sm font-medium">
                    Marca
                  </Label>
                  <Input
                    id="brand"
                    type="text"
                    placeholder="Toyota"
                    value={vehicleData.brand}
                    onChange={(e) => handleInputChange("brand", e.target.value)}
                    className="h-9 text-xs sm:text-sm"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                <div className="space-y-2">
                  <Label htmlFor="model" className="text-xs sm:text-sm font-medium">
                    Modelo
                  </Label>
                  <Input
                    id="model"
                    type="text"
                    placeholder="Hilux"
                    value={vehicleData.model}
                    onChange={(e) => handleInputChange("model", e.target.value)}
                    className="h-9 text-xs sm:text-sm"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="color" className="text-xs sm:text-sm font-medium">
                    Color
                  </Label>
                  <Input
                    id="color"
                    type="text"
                    placeholder="Blanco"
                    value={vehicleData.color}
                    onChange={(e) => handleInputChange("color", e.target.value)}
                    className="h-9 text-xs sm:text-sm"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="year" className="text-xs sm:text-sm font-medium">
                    Año
                  </Label>
                  <Input
                    id="year"
                    type="number"
                    placeholder="2025"
                    value={vehicleData.year}
                    onChange={(e) =>
                      handleInputChange("year", Number(e.target.value))
                    }
                    className="h-9 text-xs sm:text-sm"
                    min={1900}
                    max={new Date().getFullYear() + 1}
                    disabled={isSubmitting}
                  />
                </div>
              </div>
              <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  className="h-9 sm:h-7 px-3 text-xs sm:text-sm w-full sm:w-auto"
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="h-9 sm:h-7 px-3 text-xs sm:text-sm bg-black hover:bg-gray-800 w-full sm:w-auto"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                      {isUpdate ? "Actualizando..." : "Creando..."}
                    </>
                  ) : isUpdate ? (
                    "Actualizar"
                  ) : (
                    "Agregar"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
}
