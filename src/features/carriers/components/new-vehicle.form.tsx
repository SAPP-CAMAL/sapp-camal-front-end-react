import React, { useState } from "react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, XIcon } from "lucide-react";
import { TransportType } from "@/features/vehicles/domain/vehicle-detail-service";
import { toast } from "sonner";
import { createVehicleService } from "@/features/vehicles/server/db/vehicle.service";

export interface VehicleData {
  plate: string;
  vehicleTypeId: string;
  brand: string;
  model: string;
  color: string;
  year: number;
}

interface CreateVehicleFormProps {
  onGetVehicleById?: (vehicleId: number) => void;
  onCancel: () => void;
  vehicleTypes: any[];
  selectedTransportIds?: number[];
  onSubmit?: () => void;
}

export function CreateVehicleForm({
  onGetVehicleById,
  onCancel,
  vehicleTypes,
}: CreateVehicleFormProps) {
  const initialState = {
    plate: "",
    vehicleTypeId: "",
    brand: "",
    model: "",
    color: "",
    year: new Date().getFullYear(),
  };
  const [vehicleData, setVehicleData] = useState(initialState);

  // Reinicia el formulario cada vez que cambian los tipos de vehículo
  React.useEffect(() => {
    setVehicleData((prev) => ({
      ...initialState,
      plate: prev.plate, // Mantén la placa si el usuario ya la escribió
    }));
  }, [vehicleTypes]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: string, value: string | number) => {
    setVehicleData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const resetForm = () => {
    setVehicleData({
      plate: "",
      vehicleTypeId: "",
      brand: "",
      model: "",
      color: "",
      year: new Date().getFullYear(),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!vehicleData.plate.trim()) {
      toast.error("La plate es obligatoria");
      return;
    }

    if (!vehicleData.vehicleTypeId) {
      toast.error("Debe seleccionar un tipo de vehículo");
      return;
    }

    const plateRegex = /^[A-Z]{3}-\d{3,4}$/;
    if (!plateRegex.test(vehicleData.plate.toUpperCase())) {
      toast.error("Formato de plate inválido. Use el formato ABC-123");
      return;
    }

    setIsSubmitting(true);

    try {
      const vehicle = await createVehicleService({
        vehicleDetailId: Number(vehicleData.vehicleTypeId),
        plate: vehicleData.plate.toUpperCase().replace(/-/g, ""),
        brand: vehicleData.brand.trim(),
        model: vehicleData.model.trim(),
        color: vehicleData.color.trim(),
        manufactureYear: vehicleData.year,
      });

      if (vehicle.code === 201) {
        toast.success("Vehículo creado exitosamente");
        onGetVehicleById?.(vehicle.data.id);
        handleCancel();
      } else {
        toast.error(vehicle.message || "Error al crear el vehículo");
      }
    } catch (error) {
      toast.error("Error al crear el vehículo");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    resetForm();
    onCancel?.();
  };

  const handleplateChange = (value: string) => {
    let formatted = value.toUpperCase().replace(/[^A-Z0-9]/g, "");

    if (formatted.length > 3) {
      formatted = formatted.slice(0, 3) + "-" + formatted.slice(3, 7);
    }

    handleInputChange("plate", formatted);
  };

  const handleyearChange = (value: string) => {
    const year = parseInt(value);

    // Allow empty or partial input while typing
    if (value === "" || isNaN(year)) {
      handleInputChange("year", new Date().getFullYear());
      return;
    }

    handleInputChange("year", year);
  };

  return (
    <Card className="mt-4 border-2 border-gray-300">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center justify-between">
          Nuevo Vehículo
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleCancel}
            className="h-8 w-8 p-0"
            disabled={isSubmitting}
          >
            <XIcon className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {/* plate */}
            <div className="space-y-2">
              <Label htmlFor="plate" className="text-sm font-medium">
                Placa <span className="text-red-500">*</span>
              </Label>
              <Input
                id="plate"
                type="text"
                placeholder="ABC-123"
                value={vehicleData.plate}
                onChange={(e) => handleplateChange(e.target.value)}
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
                <SelectTrigger className="h-9 w-full">
                  <SelectValue placeholder="Seleccione el tipo" />
                </SelectTrigger>
                <SelectContent>
                  {vehicleTypes && vehicleTypes.length > 0 ? (
                    vehicleTypes
                      .filter(
                        (tipo) =>
                          tipo &&
                          typeof tipo.id !== "undefined" &&
                          tipo.id !== null &&
                          tipo.name &&
                          tipo.name !== ""
                      )
                      .map((tipo) => (
                        <SelectItem
                          key={String(tipo.id)}
                          value={String(tipo.id)}
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
                onChange={(e) => handleyearChange(e.target.value)}
                className="h-9"
                min="1900"
                max={new Date().getFullYear() + 1}
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t">
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
                  Creando...
                </>
              ) : (
                "Agregar"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
