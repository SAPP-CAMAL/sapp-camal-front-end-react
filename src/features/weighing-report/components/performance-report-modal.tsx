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
import { Slider } from "@/components/ui/slider";
import { Loader2, FileText, Scale, Ruler, Tag } from "lucide-react";
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
  const [brandName, setBrandName] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: unitMeasuresData, isLoading: isLoadingUnits } = useUnitMeasures();

  // Seleccionar la primera unidad por defecto
  useEffect(() => {
    if (unitMeasuresData?.data && unitMeasuresData.data.length > 0 && !selectedUnitMeasure) {
      setSelectedUnitMeasure(unitMeasuresData.data[0].id);
    }
  }, [unitMeasuresData, selectedUnitMeasure]);

  // Inicializar brandName con el valor de los filtros si existe
  useEffect(() => {
    if (open && filters?.brandName) {
      setBrandName(filters.brandName);
    } else if (open && !filters?.brandName) {
      setBrandName("");
    }
  }, [open, filters?.brandName]);

  const handleGenerate = async () => {
    if (!filters || !selectedUnitMeasure) {
      toast.error("Faltan parámetros requeridos");
      return;
    }

    if (!brandName || brandName.trim().length === 0) {
      toast.error("El nombre de la marca es obligatorio");
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
        brandName: brandName.trim(),
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
            Configure los parámetros para generar el reporte de rendimiento
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-6 py-2 sm:py-4">
          {/* Nombre de Marca */}
          <div className="space-y-2 sm:space-y-3">
            <Label className="text-sm sm:text-base font-semibold flex items-center gap-2">
              <Tag className="h-4 w-4 text-primary" />
              Nombre de Marca
              <span className="text-red-500">*</span>
            </Label>
            <Input
              type="text"
              placeholder="Ingrese el nombre de la marca"
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              className="w-full h-10 sm:h-11"
            />
            <p className="text-xs text-gray-500">
              Campo obligatorio para generar el reporte
            </p>
          </div>

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

          {/* Peso Inicial */}
          <div className="space-y-2 sm:space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm sm:text-base font-semibold flex items-center gap-2">
                <Scale className="h-4 w-4 text-primary" />
                Peso Total de Animales
              </Label>
              <span className="text-base sm:text-lg font-bold text-teal-600">
                {initialWeight} {selectedUnit?.code || ""}
              </span>
            </div>
            <div className="py-2 sm:py-3">
              <Slider
                value={[initialWeight]}
                onValueChange={(values: number[]) => setInitialWeight(values[0])}
                min={0}
                max={1000}
                step={10}
                className="w-full cursor-pointer"
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>0 {selectedUnit?.code || ""}</span>
              <span>500 {selectedUnit?.code || ""}</span>
              <span>1000 {selectedUnit?.code || ""}</span>
            </div>
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
            disabled={isGenerating || !selectedUnitMeasure || !brandName.trim()}
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
