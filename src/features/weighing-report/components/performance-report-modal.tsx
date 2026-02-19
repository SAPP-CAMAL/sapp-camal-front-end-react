"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2, FileText, Scale, Ruler } from "lucide-react";
import { toast } from "sonner";
import { useUnitMeasures } from "../hooks";
import { generateProductivityReport } from "../server";
import type { PerformanceReportFilters } from "../domain";

interface PerformanceReportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: {
    idWeighingStage: number;
    idSpecie: number;
    startDate: string;
    endDate: string;
    brandName?: string; // Opcional en los filtros, pero se pedirá en el modal
  } | null;
}

export function PerformanceReportModal({
  open,
  onOpenChange,
  filters,
}: PerformanceReportModalProps) {
  const [selectedUnitMeasure, setSelectedUnitMeasure] = useState<number | null>(null);
  const [initialWeight, setInitialWeight] = useState<number>(100);
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: unitMeasuresData, isLoading: isLoadingUnits } = useUnitMeasures();

  // Seleccionar la primera unidad por defecto
  useEffect(() => {
    if (unitMeasuresData?.data && unitMeasuresData.data.length > 0 && !selectedUnitMeasure) {
      setSelectedUnitMeasure(unitMeasuresData.data[0].id);
    }
  }, [unitMeasuresData, selectedUnitMeasure]);

  const handleGenerate = async () => {
    if (!filters || !selectedUnitMeasure) {
      toast.error("Faltan parámetros requeridos");
      return;
    }

    if (!filters.brandName || filters.brandName.trim().length === 0) {
      toast.error("Debe buscar por marca en los filtros principales");
      return;
    }

    if (initialWeight <= 0) {
      toast.error("El peso total debe ser mayor a 0");
      return;
    }

    const selectedUnit = unitMeasuresData?.data.find(
      (unit) => unit.id === selectedUnitMeasure
    );

    if (!selectedUnit) {
      toast.error("Unidad de medida no encontrada");
      return;
    }

    try {
      setIsGenerating(true);

      const performanceFilters: PerformanceReportFilters = {
        idWeighingStage: filters.idWeighingStage,
        idSpecie: filters.idSpecie,
        startDate: filters.startDate,
        endDate: filters.endDate,
        brandName: filters.brandName.trim(),
        totalAnimalsWeight: initialWeight,
        measureUnit: selectedUnit.code,
        typeReport: "PDF",
      };

      const { blob, filename } = await generateProductivityReport(performanceFilters);

      // Descargar el archivo
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();

      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success("Reporte de rendimiento PDF generado exitosamente");
      onOpenChange(false);
    } catch (error) {
      toast.error("Error al generar el reporte de rendimiento");
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const selectedUnit = unitMeasuresData?.data.find(
    (unit) => unit.id === selectedUnitMeasure
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Scale className="h-5 w-5 text-teal-600" />
            Reporte de Rendimiento
          </DialogTitle>
          <DialogDescription className="text-sm">
            Configure los parámetros para generar el reporte de rendimiento.
            {!filters?.brandName && (
              <span className="block mt-2 text-amber-600 font-medium">
                ⚠️ Debe buscar por marca en los filtros principales
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-6 py-2 sm:py-4">
          {/* Unidad de Medida */}
          <div className="space-y-2 sm:space-y-3">
            <Label className="text-sm sm:text-base font-semibold flex items-center gap-2">
              <Ruler className="h-4 w-4 text-primary" />
              Unidad de Medida
            </Label>
            {isLoadingUnits ? (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                Cargando unidades...
              </div>
            ) : (
              <RadioGroup
                value={selectedUnitMeasure?.toString()}
                onValueChange={(value: string) => setSelectedUnitMeasure(parseInt(value))}
                className="gap-2 sm:gap-3"
              >
                {unitMeasuresData?.data.map((unit) => (
                  <label
                    key={unit.id}
                    htmlFor={`unit-${unit.id}`}
                    className="flex items-center space-x-3 border rounded-lg p-3 sm:p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <RadioGroupItem value={unit.id.toString()} id={`unit-${unit.id}`} />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm sm:text-base">{unit.name}</span>
                        <span className="text-xs sm:text-sm text-gray-500">
                          ({unit.code})
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {unit.description}
                      </p>
                    </div>
                  </label>
                ))}
              </RadioGroup>
            )}
          </div>

          {/* Peso Total de Animales */}
          <div className="space-y-2 sm:space-y-3">
            <Label className="text-sm sm:text-base font-semibold flex items-center gap-2">
              <Scale className="h-4 w-4 text-primary" />
              Peso Total de Animales
            </Label>
            <div className="relative">
              <Input
                type="number"
                min="0"
                step="0.01"
                placeholder="Ingrese el peso total"
                value={initialWeight}
                onChange={(e) => {
                  const value = parseFloat(e.target.value);
                  if (!isNaN(value) && value >= 0) {
                    setInitialWeight(value);
                  } else if (e.target.value === "") {
                    setInitialWeight(0);
                  }
                }}
                className="w-full h-10 sm:h-11 pr-16"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-500">
                {selectedUnit?.code || ""}
              </span>
            </div>
            <p className="text-xs text-gray-500">
              Ingrese el peso total de los animales (puede usar decimales)
            </p>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isGenerating}
            className="w-full sm:w-auto"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !selectedUnitMeasure || !filters?.brandName || initialWeight <= 0}
            className="bg-teal-600 hover:bg-teal-700 text-white w-full sm:w-auto"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generando...
              </>
            ) : (
              <>
                <FileText className="mr-2 h-4 w-4" />
                Generar Reporte
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
