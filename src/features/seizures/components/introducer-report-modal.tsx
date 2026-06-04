"use client";

import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { SearchIntroducersInput } from "@/features/introducer/components/search-introducers-input";
import { FileText, Loader2, User, Check, Mail, IdCard, Tag, CalendarDays } from "lucide-react";
import { toast } from "sonner";
import { downloadIntroducerReportService } from "../server/seizures.service";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  startDate: string;
  endDate: string;
  introducersList: any[];
  isLoading?: boolean;
}

export function IntroducerReportModal({
  open,
  onOpenChange,
  startDate,
  endDate,
  introducersList,
  isLoading = false,
}: Props) {
  const [searchQuery, setSearchQuery] = useState({
    fullName: "",
    identification: "",
    brandName: "",
  });
  const [selectedIntroducer, setSelectedIntroducer] = useState<number | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const filteredIntroducers = useMemo(() => {
    return introducersList.filter((introducer) => {
      const matchFullName =
        !searchQuery.fullName ||
        introducer.fullName.toLowerCase().includes(searchQuery.fullName.toLowerCase());
      const matchIdentification =
        !searchQuery.identification ||
        introducer.identification.toLowerCase().includes(searchQuery.identification.toLowerCase());
      const matchBrand =
        !searchQuery.brandName ||
        introducer.brands.some((brand: any) =>
          brand.name.toLowerCase().includes(searchQuery.brandName.toLowerCase())
        );
      return matchFullName && matchIdentification && matchBrand;
    });
  }, [introducersList, searchQuery]);

  const formatAppliedDate = (value: string) => {
    if (!value) return "-";
    const parsed = parseISO(value);
    if (Number.isNaN(parsed.getTime())) return value;
    return format(parsed, "dd/MM/yyyy", { locale: es });
  };

  const handleGenerateReport = async () => {
    if (!selectedIntroducer) {
      toast.error("Seleccione un introductor");
      return;
    }

    if (!startDate || !endDate) {
      toast.error("Seleccione el rango de fechas en los filtros principales");
      return;
    }

    setIsDownloading(true);
    try {
      await downloadIntroducerReportService(
        selectedIntroducer,
        startDate,
        endDate
      );
      toast.success("Reporte generado correctamente");
      onOpenChange(false);
      setSelectedIntroducer(null);
      setSearchQuery({
        fullName: "",
        identification: "",
        brandName: "",
      });
    } catch (error: any) {
      const errorMessage = error?.message || "Error al generar el reporte";
      toast.error(errorMessage);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <FileText className="h-5 w-5" />
            Acta Introductor
          </DialogTitle>
          <DialogDescription className="text-sm">
            Busque y seleccione un introductor para generar el reporte
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 overflow-y-auto flex-1 px-1">
          <div className="rounded-lg border border-teal-200 bg-teal-50/70 px-3 py-2.5 text-teal-900">
            <div className="flex items-start gap-2">
              <CalendarDays className="h-4 w-4 mt-0.5 shrink-0 text-teal-700" />
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wide text-teal-800">
                  Rango aplicado
                </p>
                <p className="text-sm leading-5 font-medium wrap-break-word">
                  {formatAppliedDate(startDate)} - {formatAppliedDate(endDate)}
                </p>
              </div>
            </div>
          </div>

          {/* Campos de Búsqueda */}
          <SearchIntroducersInput
            fullName={{
              label: "Nombre Completo",
              placeholder: "Buscar por nombre...",
              onChange: (value) =>
                setSearchQuery((prev) => ({ ...prev, fullName: value })),
            }}
            identification={{
              label: "Identificación",
              placeholder: "Buscar por identificación...",
              onChange: (value) =>
                setSearchQuery((prev) => ({ ...prev, identification: value })),
            }}
            brand={{
              label: "Marca",
              placeholder: "Buscar por marca...",
              onChange: (value) =>
                setSearchQuery((prev) => ({ ...prev, brandName: value })),
            }}
            showLabel={true}
            showInputIcon={true}
          />

          <div className="space-y-3">
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredIntroducers.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <User className="h-16 w-16 mx-auto mb-3 opacity-30" />
                <p className="font-medium text-base">No se encontraron introductores</p>
                <p className="text-sm mt-1">Intente con otros criterios de búsqueda</p>
              </div>
            ) : (
              <>
                <div className="text-sm text-muted-foreground px-1">
                  {filteredIntroducers.length} {filteredIntroducers.length === 1 ? 'resultado encontrado' : 'resultados encontrados'}
                </div>
                <div className="space-y-2 max-h-100 overflow-y-auto pr-2">
                  {filteredIntroducers.map((introducer) => (
                    <Card
                      key={introducer.id}
                      className={`p-3 sm:p-4 cursor-pointer transition-all hover:shadow-md relative ${
                        selectedIntroducer === introducer.id
                          ? "border-primary border-2 bg-primary/5"
                          : "border hover:border-primary/50"
                      }`}
                      onClick={() => setSelectedIntroducer(introducer.id)}
                    >
                      {selectedIntroducer === introducer.id && (
                        <div className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-primary text-white rounded-full p-1">
                          <Check className="h-3 w-3 sm:h-4 sm:w-4" />
                        </div>
                      )}
                      
                      <div className="space-y-2 pr-8">
                        <div className="flex items-start gap-2">
                          <User className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-sm sm:text-base wrap-break-word">
                              {introducer.fullName}
                            </h3>
                          </div>
                        </div>

                        <div className="grid gap-2 text-xs sm:text-sm pl-7">
                          <div className="flex items-center gap-2">
                            <IdCard className="h-4 w-4 text-muted-foreground shrink-0" />
                            <span className="text-muted-foreground">CI:</span>
                            <span className="font-medium break-all">{introducer.identification}</span>
                          </div>

                          {introducer.email && (
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                              <span className="text-muted-foreground">Email:</span>
                              <span className="font-medium break-all">{introducer.email}</span>
                            </div>
                          )}

                          {introducer.brands && introducer.brands.length > 0 && (
                            <div className="flex items-start gap-2">
                              <Tag className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                              <span className="text-muted-foreground">Marcas:</span>
                              <div className="flex flex-wrap gap-1 flex-1">
                                {introducer.brands.map((brand, idx) => (
                                  <Badge key={idx} variant="secondary" className="text-xs">
                                    {brand.name}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false);
              setSelectedIntroducer(null);
            }}
            disabled={isDownloading}
            className="w-full sm:w-auto"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleGenerateReport}
            disabled={!selectedIntroducer || isDownloading}
            className="w-full sm:w-auto"
          >
            {isDownloading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Generando...
              </>
            ) : (
              <>
                <FileText className="h-4 w-4 mr-2" />
                Generar Reporte PDF
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
