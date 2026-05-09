"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";
import { format } from "date-fns";
import { FileSpreadsheet, FileText, Calendar } from "lucide-react";
import { downloadAntemortemAgrocalidadReport } from "../utils/download-antemortem-report";
import { toast } from "sonner";

interface AntemortemAgrocalidadModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedLineId: number | null;
}

export function AntemortemAgrocalidadModal({
  isOpen,
  onOpenChange,
  selectedLineId,
}: AntemortemAgrocalidadModalProps) {
  const [startDate, setStartDate] = useState<Date | null>(new Date());
  const [endDate, setEndDate] = useState<Date | null>(new Date());
  const [isDownloading, setIsDownloading] = useState<boolean>(false);

  // Resetear fechas al cerrar el modal
  useEffect(() => {
    if (!isOpen) {
      const today = new Date();
      setStartDate(new Date(today.getFullYear(), today.getMonth(), today.getDate()));
      setEndDate(new Date(today.getFullYear(), today.getMonth(), today.getDate()));
    }
  }, [isOpen]);

  const handleDownload = async (type: "EXCEL" | "PDF") => {
    if (!startDate || !endDate || selectedLineId === null) {
      toast.error("Por favor seleccione las fechas y la línea");
      return;
    }

    try {
      setIsDownloading(true);
      const startStr = format(startDate, "yyyy-MM-dd");
      const endStr = format(endDate, "yyyy-MM-dd");

      await toast.promise(
        downloadAntemortemAgrocalidadReport(startStr, endStr, selectedLineId, type),
        {
          loading: `Generando reporte ${type}...`,
          success: `Reporte ${type} descargado correctamente`,
          error: "Error al descargar el reporte",
        }
      );
      onOpenChange(false);
    } catch (error) {
      console.error(error);
    } finally {
      setIsDownloading(false);
    }
  };

  const isButtonDisabled = !startDate || !endDate || isDownloading;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Reporte Agrocalidad
          </DialogTitle>
          <DialogDescription>
            Seleccione el rango de fechas para generar el reporte de Antemortem Agrocalidad.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="startDate" className="text-sm font-medium">
                Fecha Inicio
              </Label>
              <DatePicker
                id="startDate"
                selected={startDate}
                onChange={(date) => setStartDate(date)}
                maxDate={endDate || undefined}
                inputClassName="w-full"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="endDate" className="text-sm font-medium">
                Fecha Fin
              </Label>
              <DatePicker
                id="endDate"
                selected={endDate}
                onChange={(date) => setEndDate(date)}
                minDate={startDate || undefined}
                inputClassName="w-full"
              />
            </div>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            className="flex-1 border-green-600 text-green-600 hover:bg-green-50 hover:text-green-700"
            disabled={isButtonDisabled}
            onClick={() => handleDownload("EXCEL")}
          >
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Excel
          </Button>
          <Button
            variant="outline"
            className="flex-1 border-red-600 text-red-600 hover:bg-red-50 hover:text-red-700"
            disabled={isButtonDisabled}
            onClick={() => handleDownload("PDF")}
          >
            <FileText className="mr-2 h-4 w-4" />
            PDF
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
