"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { SearchIntroducersInput } from "@/features/introducer/components/search-introducers-input";
import { useIntroducersPaginatedList } from "@/features/introducer/hooks/use-introducers-paginated-list";
import { FileText, Loader2, User, Check, Mail, IdCard, Tag, CalendarDays } from "lucide-react";
import { toast } from "sonner";
import { downloadIntroducerReportService } from "../server/seizures.service";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { default as BaseDatePicker } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "@/components/ui/react-datepicker-custom-styles.css";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function IntroducerReportModal({ open, onOpenChange }: Props) {
  const [filters, setFilters] = useState({
    fullName: "",
    identification: "",
    brandName: "",
    page: 1,
    limit: 10,
  });
  const [selectedIntroducer, setSelectedIntroducer] = useState<number | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [startDate, setStartDate] = useState<Date | null>(new Date());
  const [endDate, setEndDate] = useState<Date | null>(new Date());

  const { data: introducersData, isLoading } = useIntroducersPaginatedList(filters);
  const introducers = introducersData?.data?.items ?? [];

  const handleGenerateReport = async () => {
    if (!selectedIntroducer) {
      toast.error("Seleccione un introductor");
      return;
    }

    if (!startDate || !endDate) {
      toast.error("Seleccione el rango de fechas");
      return;
    }

    setIsDownloading(true);
    try {
      await downloadIntroducerReportService(
        selectedIntroducer,
        format(startDate, "yyyy-MM-dd"),
        format(endDate, "yyyy-MM-dd")
      );
      toast.success("Reporte generado correctamente");
      onOpenChange(false);
      setSelectedIntroducer(null);
      setFilters({
        fullName: "",
        identification: "",
        brandName: "",
        page: 1,
        limit: 10,
      });
      setStartDate(new Date());
      setEndDate(new Date());
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
          {/* Filtros de Fecha */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-3 border-b">
            <div className="flex flex-col w-full">
              <label className="mb-1 text-sm font-medium text-gray-700">
                Fecha Inicio
              </label>
              <BaseDatePicker
                selected={startDate}
                onChange={(date: Date | null) => setStartDate(date)}
                dateFormat="dd/MM/yyyy"
                locale={es}
                showIcon
                isClearable
                icon={
                  <CalendarDays className="text-muted-foreground h-4 w-4" />
                }
                placeholderText="Desde"
                wrapperClassName="w-full"
                className="flex w-full min-w-0 rounded-md border border-gray-300 bg-background px-3 py-1 text-sm shadow-xs transition-[color,box-shadow] outline-none h-10 focus:ring-2"
                popperClassName="z-50"
                popperPlacement="bottom-start"
              />
            </div>

            <div className="flex flex-col w-full">
              <label className="mb-1 text-sm font-medium text-gray-700">
                Fecha Fin
              </label>
              <BaseDatePicker
                selected={endDate}
                onChange={(date: Date | null) => setEndDate(date)}
                dateFormat="dd/MM/yyyy"
                locale={es}
                showIcon
                isClearable
                icon={
                  <CalendarDays className="text-muted-foreground h-4 w-4" />
                }
                placeholderText="Hasta"
                wrapperClassName="w-full"
                className="flex w-full min-w-0 rounded-md border border-gray-300 bg-background px-3 py-1 text-sm shadow-xs transition-[color,box-shadow] outline-none h-10 focus:ring-2"
                popperClassName="z-50"
                popperPlacement="bottom-start"
              />
            </div>
          </div>

          {/* Campos de Búsqueda */}
          <SearchIntroducersInput
            fullName={{
              label: "Nombre Completo",
              placeholder: "Buscar por nombre...",
              onChange: (value) =>
                setFilters((prev) => ({ ...prev, fullName: value, page: 1 })),
            }}
            identification={{
              label: "Identificación",
              placeholder: "Buscar por identificación...",
              onChange: (value) =>
                setFilters((prev) => ({ ...prev, identification: value, page: 1 })),
            }}
            brand={{
              label: "Marca",
              placeholder: "Buscar por marca...",
              onChange: (value) =>
                setFilters((prev) => ({ ...prev, brandName: value, page: 1 })),
            }}
            showLabel={true}
            showInputIcon={true}
          />

          <div className="space-y-3">
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : introducers.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <User className="h-16 w-16 mx-auto mb-3 opacity-30" />
                <p className="font-medium text-base">No se encontraron introductores</p>
                <p className="text-sm mt-1">Intente con otros criterios de búsqueda</p>
              </div>
            ) : (
              <>
                <div className="text-sm text-muted-foreground px-1">
                  {introducers.length} {introducers.length === 1 ? 'resultado encontrado' : 'resultados encontrados'}
                </div>
                <div className="space-y-2 max-h-100 overflow-y-auto pr-2">
                  {introducers.map((introducer) => (
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
              setStartDate(new Date());
              setEndDate(new Date());
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
