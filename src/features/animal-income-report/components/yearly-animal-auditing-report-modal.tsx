"use client";

import { useEffect, useState } from "react";
import { Loader2, FileDown } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getYearlyAnimalAuditingReport } from "../server/db/animal-income-report.service";

interface YearlyAnimalAuditingReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const getCurrentYear = () => new Date().getFullYear().toString();

export function YearlyAnimalAuditingReportModal({ isOpen, onClose }: YearlyAnimalAuditingReportModalProps) {
  const [year, setYear] = useState(getCurrentYear());
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setYear(getCurrentYear());
    }
  }, [isOpen]);

  const handleGenerate = async () => {
    const normalizedYear = year.trim();

    if (!/^\d{4}$/.test(normalizedYear)) {
      toast.error("Ingrese un año válido de 4 dígitos");
      return;
    }

    setIsGenerating(true);
    try {
      const { blob, filename } = await getYearlyAnimalAuditingReport(normalizedYear);
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
      toast.success("Reporte anual generado correctamente");
      onClose();
    } catch (error) {
      console.error("Error generating yearly animal auditing report:", error);
      toast.error("No se pudo generar el reporte anual");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[92vw] sm:max-w-sm md:max-w-md">
        <DialogHeader>
          <DialogTitle>Generar reporte de faenamiento</DialogTitle>
          <DialogDescription>
            Indique el año del reporte anual de faenamiento por especies.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 py-2">
          <Label htmlFor="animal-auditing-year">Año</Label>
          <Input
            id="animal-auditing-year"
            type="number"
            inputMode="numeric"
            min={1900}
            max={2100}
            step={1}
            className="max-w-40"
            value={year}
            onChange={(event) => setYear(event.target.value)}
            placeholder="2026"
          />
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={isGenerating}>
            Cancelar
          </Button>
          <Button type="button" onClick={handleGenerate} disabled={isGenerating} className="bg-primary text-primary-foreground hover:bg-primary/90">
            {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileDown className="mr-2 h-4 w-4" />}
            Generar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}