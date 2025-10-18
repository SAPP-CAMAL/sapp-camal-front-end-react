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
  vehicleTypes: any[];
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

  useEffect(() => {
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
    }
  }, [isUpdate, initialData]);

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
      if (isUpdate && initialData?.id) {
        await updateVehicleService(initialData.id, {
          vehicleDetailId: Number(vehicleData.vehicleTypeId),
          plate: vehicleData.plate.toUpperCase(),
          brand: vehicleData.brand.trim(),
          model: vehicleData.model.trim(),
          color: vehicleData.color.trim(),
          manufactureYear: Number(vehicleData.year),
          status: isActive ?? vehicleData.status,
        });
        toast.success("Vehículo actualizado correctamente");
      } else {
        await createVehicleService({
          vehicleDetailId: Number(vehicleData.vehicleTypeId),
          plate: vehicleData.plate.toUpperCase().replace(/-/g, ""),
          brand: vehicleData.brand.trim(),
          model: vehicleData.model.trim(),
          color: vehicleData.color.trim(),
          manufactureYear: Number(vehicleData.year),
        });
        toast.success("Vehículo creado exitosamente");
      }

      handleCancel();
      onSuccess?.();
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

      <DialogContent className="min-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isUpdate ? "Editar Vehículo" : "Registrar Nuevo Vehículo"}
          </DialogTitle>
          <DialogDescription>
            {isUpdate
              ? "Modifique la información del vehículo."
              : "Complete el formulario para registrar un nuevo vehículo en el sistema."}
          </DialogDescription>
        </DialogHeader>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Car className="h-5 w-5 text-gray-700" />
              Información del Vehículo
            </CardTitle>
            <CardDescription>
              Complete la información del nuevo vehículo.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="w-full">
                <Label className="text-sm font-medium">
                  Tipo de Transporte <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={vehicleData.transportTypeId}
                  onValueChange={(value) =>
                    handleInputChange("transportTypeId", value)
                  }
                  required
                  disabled={isSubmitting}
                >
                  <SelectTrigger className="h-9 w-full">
                    <SelectValue placeholder="Seleccione el tipo de transporte" />
                  </SelectTrigger>
                  <SelectContent>
                    {transportsTypes?.length ? (
                      transportsTypes.map((tipo: any) => (
                        <SelectItem
                          key={tipo.catalogueId}
                          value={String(tipo.catalogueId)}
                        >
                          {tipo.name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="" disabled>
                        No hay tipos disponibles
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              {isUpdate && (
                <div className="w-full">
                  <Label className="text-sm font-medium">
                    Estado <span className="text-red-500">*</span>
                  </Label>
                  <div className="rounded-xl px-3 py-2 bg-muted border mt-2">
                    <button
                      type="button"
                      onClick={handleToggleStatus}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors w-full justify-between"
                    >
                      <span
                        className={isActive ? "font-bold" : "text-gray-400"}
                      >
                        {isActive ? "Activo" : "Inactivo"}
                      </span>
                      {isActive ? (
                        <ToggleRightIcon className="w-8 h-8 text-primary" />
                      ) : (
                        <ToggleLeftIcon className="w-8 h-8 text-gray-500" />
                      )}
                    </button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="plate" className="text-sm font-medium">
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
                    className="h-9 uppercase"
                    maxLength={8}
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Tipo de Vehículo <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={vehicleData.vehicleTypeId}
                    onValueChange={(value) =>
                      handleInputChange("vehicleTypeId", value)
                    }
                    required
                    disabled={isSubmitting}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Seleccione el tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {vehicleTypes?.length ? (
                        vehicleTypes.map((tipo: any) => (
                          <SelectItem
                            key={tipo.catalogueId}
                            value={String(tipo.catalogueId)}
                          >
                            {tipo.name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="" disabled>
                          No hay tipos disponibles
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="brand" className="text-sm font-medium">
                    Marca
                  </Label>
                  <Input
                    id="brand"
                    type="text"
                    placeholder="Toyota"
                    value={vehicleData.brand}
                    onChange={(e) => handleInputChange("brand", e.target.value)}
                    className="h-9"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="model" className="text-sm font-medium">
                    Modelo
                  </Label>
                  <Input
                    id="model"
                    type="text"
                    placeholder="Hilux"
                    value={vehicleData.model}
                    onChange={(e) => handleInputChange("model", e.target.value)}
                    className="h-9"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="color" className="text-sm font-medium">
                    Color
                  </Label>
                  <Input
                    id="color"
                    type="text"
                    placeholder="Blanco"
                    value={vehicleData.color}
                    onChange={(e) => handleInputChange("color", e.target.value)}
                    className="h-9"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="year" className="text-sm font-medium">
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
                    className="h-9"
                    min={1900}
                    max={new Date().getFullYear() + 1}
                    disabled={isSubmitting}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2 ">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  className="h-7 px-3 text-sm"
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="h-7 px-3 text-sm bg-black hover:bg-gray-800"
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
