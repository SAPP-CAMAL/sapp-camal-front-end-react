"use client";

import React, { useMemo, useState, useEffect, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Calendar,
  FilterIcon,
  Layers,
  Loader2,
  ShieldCheck,
  Droplets,
  Wine,
  User,
  Save,
  FileText,
  Clock,
  ClipboardList,
  AlertCircle,
} from "lucide-react";

import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

import { useLines } from "@/features/postmortem/hooks/use-lines";
import {
  type CleaningAreaDateRecord,
  type CleaningAreaSection,
  type ApiAreaStructure,
} from "../domain";
import {
  getCleaningDisinfectionRecordByLineDateService,
} from "../server/db/cleaning-area-report.service";
import {
  getCleaningAreaStructureService,
} from "../server/db/cleaning-area-structure.service";
import {
  saveCleaningDisinfectionRecordService,
  updateCleaningDisinfectionRecordService,
  generateCleaningDisinfectionReportService,
  getReportCodeByCodeService,
  type CleaningDisinfectionDetail,
} from "../server/db/save-cleaning-area-report.service";
import {
  getLocalDateString,
  parseLocalDateString,
} from "@/features/postmortem/utils/postmortem-helpers";

// ─── constantes ────────────────────────────────────────────────────────────────
const CLEAN_TYPES_LIMPIEZA = ["LD", "LP"] as const;
const CLEAN_TYPES_VIDRIO = ["VQ", "PQ", "NA"] as const;

function emptyCleanEntry() {
  return { LD: false, LP: false, VQ: false, PQ: false, NA: false, URL: false };
}

// Editable checkbox cell
function EditableCheckCell({ 
  checked, 
  onClick 
}: { 
  checked: boolean; 
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`w-full h-full flex items-center justify-center cursor-pointer transition-all hover:scale-105 py-1
        ${checked 
          ? "bg-emerald-100 hover:bg-emerald-200" 
          : "hover:bg-gray-100"
        }`}
    >
      <span
        className={`inline-flex items-center justify-center w-5 h-5 text-sm rounded transition-all
          ${checked 
            ? "text-emerald-700 font-bold" 
            : "text-gray-400"
          }`}
      >
        {checked ? "✓" : "○"}
      </span>
    </div>
  );
}

// ─── build merged sections ─────────────────────────────────────────────────────
function buildMergedSections(
  date: string,
  apiAreas: ApiAreaStructure[] | undefined,
  recordData: any
): CleaningAreaSection[] {
  if (!date || !apiAreas) return [];

  const recordId = recordData?.id;
  const details = recordData?.details || [];

  return apiAreas.map((apiArea) => ({
    id: apiArea.idArea,
    area: apiArea.areaCatalogName,
    items: apiArea.structures.map((structure) => {
      // Buscar si hay datos guardados para esta estructura
      const savedDetail = details.find((d: any) => d.idAreaStructure === structure.id);

      const record: CleaningAreaDateRecord = savedDetail
        ? {
            date,
            cleaningType: {
              LD: savedDetail.ldClean,
              LP: savedDetail.lpClean,
              VQ: false,
              PQ: false,
              NA: savedDetail.vpNa,
              URL: false,
            },
            glassPlastic: {
              LD: false,
              LP: false,
              VQ: savedDetail.vqBroken,
              PQ: savedDetail.pqBroken,
              NA: savedDetail.vpNa,
              URL: false,
            },
            cleanedBy: savedDetail.luminoUrl ? savedDetail.luminoUrl.toString() : undefined,
            recordId: recordId, // Guardar el ID del registro principal para actualización
            detailId: savedDetail.id, // Guardar el ID del detalle para actualización
          }
        : {
            date,
            cleaningType: emptyCleanEntry(),
            glassPlastic: emptyCleanEntry(),
            cleanedBy: undefined,
            recordId: recordId, // Incluir recordId incluso si no hay datos para esta estructura
            detailId: undefined,
          };

      return {
        id: structure.id,
        name: structure.catalogName,
        records: [record],
      };
    }),
  }));
}

const DATE_COL_SPAN = CLEAN_TYPES_LIMPIEZA.length + CLEAN_TYPES_VIDRIO.length + 1; // limpieza + vidrio + luminometría

export function CleaningAreaReportManagement() {
  const today = useMemo(() => getLocalDateString(), []);

  const [selectedDate, setSelectedDate] = useState<string>(today);
  const [selectedLineId, setSelectedLineId] = useState<string>(() => {
    try {
      return window.localStorage.getItem("cleaning-area-lineId") ?? "1";
    } catch {
      return "1";
    }
  });
  const [editedSections, setEditedSections] = useState<CleaningAreaSection[]>([]);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  const [startTime, setStartTime] = useState<string>("");
  const [endTime, setEndTime] = useState<string>("");
  const [observation, setObservation] = useState<string>("");
  const [correctiveAction, setCorrectiveAction] = useState<string>("");
  const [responsibleId, setResponsibleId] = useState<number>(1);
  const [responsibleName, setResponsibleName] = useState<string>("");

  // Hora fija de entrada a la página — nunca cambia
  const entryTimeRef = useRef<string>("");

  useEffect(() => {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    entryTimeRef.current = timeStr;
    setStartTime(timeStr);
    setEndTime(timeStr);
    try {
      const userStr = window.localStorage.getItem("user");
      if (userStr) {
        const userData = JSON.parse(userStr);
        setResponsibleId(userData.user?.id ?? 1);
        setResponsibleName(userData.user?.fullName ?? "");
      }
    } catch {
      // ignore
    }
  }, []);

  const { data: lines, isLoading: isLoadingLines } = useLines();

  const handleDateChange = (date: Date | null) => {
    if (!date) return;
    setSelectedDate(getLocalDateString(date));
  };

  const handleLineChange = (value: string) => {
    setSelectedLineId(value);
    try {
      window.localStorage.setItem("cleaning-area-lineId", value);
    } catch {
      // ignore
    }
  };

  const lineId = selectedLineId ? parseInt(selectedLineId) : undefined;

  const { data: structureData, isLoading: isLoadingStructure } = useQuery({
    queryKey: ["cleaning-area-structure", lineId],
    queryFn: () => getCleaningAreaStructureService(lineId),
    enabled: !!lineId && lineId > 0,
  });

  const { data: recordData, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["cleaning-disinfection-record", selectedDate, lineId],
    queryFn: () => getCleaningDisinfectionRecordByLineDateService(lineId!, selectedDate),
    enabled: !!selectedDate && !!lineId && lineId > 0,
  });

  const sections = useMemo(
    () => buildMergedSections(selectedDate, structureData?.data, recordData?.data),
    [selectedDate, structureData, recordData]
  );

  useEffect(() => {
    setEditedSections(sections);
  }, [sections]);

  // Poblar campos del registro cuando la API retorna datos existentes
  useEffect(() => {
    if (recordData?.data) {
      const rec = recordData.data;
      setStartTime((rec.startTime ?? "").slice(0, 5));
      setEndTime((rec.endTime ?? "").slice(0, 5));
      setObservation(rec.observation ?? "");
      setCorrectiveAction(rec.correctiveAction ?? "");
    } else if (recordData !== undefined) {
      // Query ejecutada pero sin registro — restaurar hora de entrada y limpiar campos opcionales
      const now = new Date();
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      setStartTime(entryTimeRef.current || currentTime);
      setEndTime(currentTime);
      setObservation("");
      setCorrectiveAction("");
    }
  }, [recordData]);

  const handleToggleCheck = (
    sectionId: number,
    itemId: number,
    field: 'cleaningType' | 'glassPlastic',
    key: string
  ) => {
    setEditedSections((prev) =>
      prev.map((section) => {
        if (section.id !== sectionId) return section;
        return {
          ...section,
          items: section.items.map((item) => {
            if (item.id !== itemId) return item;
            return {
              ...item,
              records: item.records.map((record) => ({
                ...record,
                [field]: {
                  ...record[field],
                  [key]: !record[field][key as keyof typeof record[typeof field]],
                },
              })),
            };
          }),
        };
      })
    );
  };

  const handleCleanedByChange = (
    sectionId: number,
    itemId: number,
    value: string
  ) => {
    const numericValue = value.replace(/\D/g, '').slice(0, 4);
    
    setEditedSections((prev) =>
      prev.map((section) => {
        if (section.id !== sectionId) return section;
        return {
          ...section,
          items: section.items.map((item) => {
            if (item.id !== itemId) return item;
            return {
              ...item,
              records: item.records.map((record) => ({
                ...record,
                cleanedBy: numericValue || undefined,
              })),
            };
          }),
        };
      })
    );
  };

  const handleSave = async () => {
    if (!lineId || !selectedDate) {
      toast.error("Debe seleccionar una línea y fecha");
      return;
    }

    try {
      const details: CleaningDisinfectionDetail[] = [];
      let existingRecordId: number | undefined;
      
      editedSections.forEach((section) => {
        section.items.forEach((item) => {
          const record = item.records[0];
          
          if (record.recordId && !existingRecordId) {
            existingRecordId = record.recordId;
          }
          
          const hasData = 
            record.cleaningType.LD ||
            record.cleaningType.LP ||
            record.glassPlastic.VQ ||
            record.glassPlastic.PQ ||
            record.glassPlastic.NA ||
            (record.cleanedBy && record.cleanedBy.trim() !== "");
          
          if (!hasData) return;
          
          const now = new Date();
          const dateTime = new Date(selectedDate);
          dateTime.setHours(now.getHours(), now.getMinutes(), now.getSeconds(), 0);
          
          const luminoValue = record.cleanedBy ? parseFloat(record.cleanedBy) : null;
          
          const detail: CleaningDisinfectionDetail = {
            idAreaStructure: item.id,
            inspectionDate: dateTime.toISOString(),
            ldClean: record.cleaningType.LD,
            lpClean: record.cleaningType.LP,
            vqBroken: record.glassPlastic.VQ,
            pqBroken: record.glassPlastic.PQ,
            luminoUrl: luminoValue,
            vpNa: record.glassPlastic.NA,
          };
          
          if (record.detailId) {
            detail.id = record.detailId;
          }
          
          details.push(detail);
        });
      });

      if (details.length === 0) {
        toast.warning("No hay datos para guardar");
        return;
      }

      const LINE_CODE_MAP: Record<number, string> = {
        1: "FOR-CCP-14-02",
        2: "FOR-CCP-14-03",
      };
      const reportCodeStr = LINE_CODE_MAP[lineId];
      let idCode: number = 1;
      if (reportCodeStr) {
        const reportCodeRes = await getReportCodeByCodeService(reportCodeStr);
        idCode = reportCodeRes.data.id;
      }

      const payload = {
        idLine: lineId,
        idCode,
        date: selectedDate,
        startTime: startTime || new Date().toTimeString().slice(0, 5),
        endTime: endTime || new Date().toTimeString().slice(0, 5),
        observation: observation.trim() || undefined,
        correctiveAction: correctiveAction.trim() || undefined,
        idResponsible: responsibleId,
        status: true,
        details,
      };

      let response;
      
      if (existingRecordId) {
        response = await updateCleaningDisinfectionRecordService(existingRecordId, payload);
      } else {
        response = await saveCleaningDisinfectionRecordService(payload);
      }

      if (response && (response.code === 200 || response.code === 201)) {
        const action = existingRecordId ? "actualizado" : "guardado";
        toast.success(`Datos ${action}s correctamente. ${details.length} item(s) procesado(s).`);
        refetch();
      } else {
        toast.error("Error al guardar los datos");
      }
    } catch (error: any) {
      let errorMessage = "Error al guardar los datos";
      if (error.response) {
        try {
          const errorBody = await error.response.json();
          errorMessage = errorBody.message || errorMessage;
        } catch (e) {
          // No se pudo parsear el error
        }
      }
      
      toast.error(errorMessage);
    }
  };

  const handleGenerateReport = async () => {
    if (!lineId || !selectedDate) {
      toast.error("Debe seleccionar una línea y fecha");
      return;
    }

    setIsGeneratingReport(true);
    try {
      const blob = await generateCleaningDisinfectionReportService(lineId, selectedDate);
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `reporte-limpieza-${selectedDate}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success("Reporte generado correctamente");
    } catch (error: any) {
      let errorMessage = "Error al generar el reporte";
      if (error.response) {
        try {
          const errorBody = await error.response.json();
          errorMessage = errorBody.message || errorMessage;
        } catch (e) {
          // No se pudo parsear el error
        }
      }
      
      toast.error(errorMessage);
    } finally {
      setIsGeneratingReport(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-emerald-600" />
          Control de Limpieza y Desinfección por Área
        </h2>
        <p className="text-gray-500 text-sm mt-1">
          Registro diario de limpieza de estructuras, materiales y utensilios
        </p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <FilterIcon className="h-4 w-4 text-primary" />
            Filtros de búsqueda
          </CardTitle>
          <CardDescription>
            Seleccione una fecha y una línea para visualizar el control de limpieza.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-end">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                <Calendar className="h-4 w-4 text-primary" />
                Fecha
              </label>
              <DatePicker
                selected={parseLocalDateString(selectedDate) ?? undefined}
                onChange={handleDateChange}
                inputClassName="h-10 w-full border border-gray-300 rounded-md shadow-sm"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                <Layers className="h-4 w-4 text-primary" />
                Línea
              </label>
              <Select
                value={selectedLineId}
                onValueChange={handleLineChange}
                disabled={isLoadingLines}
              >
                <SelectTrigger className="h-10 w-full border border-gray-300 rounded-md shadow-sm">
                  <SelectValue placeholder="Seleccione una línea" />
                </SelectTrigger>
                <SelectContent>
                  {lines?.map((line) => (
                    <SelectItem key={line.id} value={line.id.toString()}>
                      {line.description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-transparent select-none">
                Guardar
              </label>
              <Button
                className="h-10"
                onClick={handleSave}
                disabled={isLoading || isFetching || !selectedLineId}
              >
                <Save className="h-4 w-4 mr-1" />
                Guardar
              </Button>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-transparent select-none">
                Reporte
              </label>
              <Button
                variant="outline"
                className="h-10"
                onClick={handleGenerateReport}
                disabled={isGeneratingReport || !selectedLineId}
              >
                {isGeneratingReport ? (
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <FileText className="h-4 w-4 mr-1" />
                )}
                Reporte
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <ClipboardList className="h-4 w-4 text-primary" />
            Datos del registro
          </CardTitle>
          <CardDescription>
            Información general del registro de limpieza y desinfección.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Fila 1: campos de tiempo y responsable */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                <Clock className="h-4 w-4 text-primary" />
                Hora de inicio
              </label>
              <div className="relative">
                <Input
                  type="time"
                  value={startTime}
                  readOnly
                  className="h-10 bg-gray-50 text-gray-500 cursor-not-allowed pr-8"
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 font-medium select-none">
                  fijo
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                <Clock className="h-4 w-4 text-primary" />
                Hora de finalización
              </label>
              <Input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="h-10"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                <User className="h-4 w-4 text-primary" />
                Responsable
              </label>
              <div className="relative">
                <Input
                  value={responsibleName}
                  readOnly
                  className="h-10 bg-gray-50 text-gray-500 cursor-not-allowed pr-16"
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-emerald-600 font-semibold select-none bg-emerald-50 px-1.5 py-0.5 rounded">
                  usuario
                </span>
              </div>
            </div>
          </div>

          {/* Fila 2: campos de texto opcionales */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                <ClipboardList className="h-4 w-4 text-primary" />
                Observación
                <span className="text-[11px] text-gray-400 font-normal bg-gray-100 px-1.5 py-0.5 rounded">
                  opcional
                </span>
              </label>
              <Textarea
                value={observation}
                onChange={(e) => setObservation(e.target.value)}
                placeholder="Sin observaciones…"
                className="resize-none min-h-10"
                rows={2}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                <AlertCircle className="h-4 w-4 text-primary" />
                Acción correctiva
                <span className="text-[11px] text-gray-400 font-normal bg-gray-100 px-1.5 py-0.5 rounded">
                  opcional
                </span>
              </label>
              <Textarea
                value={correctiveAction}
                onChange={(e) => setCorrectiveAction(e.target.value)}
                placeholder="Sin acción correctiva…"
                className="resize-none min-h-10"
                rows={2}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {isLoadingStructure ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader2 className="animate-spin rounded-full h-8 w-8 text-emerald-600 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Cargando estructura…</p>
              </div>
            </div>
          ) : !selectedLineId || selectedLineId === "" ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Layers className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-sm text-gray-600 font-medium">Seleccione una línea para comenzar</p>
                <p className="text-xs text-gray-500 mt-1">Elija una línea de producción en los filtros</p>
              </div>
            </div>
          ) : isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader2 className="animate-spin rounded-full h-8 w-8 text-emerald-600 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Cargando datos…</p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table className="text-xs border-collapse w-full table-fixed">
                <TableHeader>
                  <TableRow className="bg-slate-700">
                    <TableHead
                      rowSpan={2}
                      className="border border-slate-500 text-center font-bold text-[8px] align-middle bg-slate-700 text-white w-24 sticky left-0 z-10 px-0.5 leading-tight"
                    >
                      <div>
                        ESTRUCTURA /<br />
                        MATERIALES /<br />
                        UTENSILIOS
                      </div>
                    </TableHead>
                    <TableHead
                      colSpan={CLEAN_TYPES_LIMPIEZA.length}
                      className="border border-slate-500 text-center font-bold text-[10px] bg-teal-600 text-white py-2"
                    >
                      <div className="flex items-center justify-center gap-1">
                        <Droplets className="h-3 w-3" />
                        TIPO LIMPIEZA
                      </div>
                    </TableHead>
                    <TableHead
                      colSpan={CLEAN_TYPES_VIDRIO.length}
                      className="border border-slate-500 text-center font-bold text-[10px] bg-purple-600 text-white py-2"
                    >
                      <div className="flex items-center justify-center gap-1">
                        <Wine className="h-3 w-3" />
                        VIDRIO/PLÁSTICO
                      </div>
                    </TableHead>
                    <TableHead
                      className="border border-slate-500 text-center font-bold text-[9px] bg-emerald-600 text-white py-2 w-12 align-middle"
                    >
                      <div className="flex items-center justify-center gap-1">
                        <User className="h-3 w-3" />
                        <span className="leading-tight">LUMINO-<br/>METRÍA</span>
                      </div>
                    </TableHead>
                  </TableRow>

                  <TableRow className="bg-slate-600">
                    {CLEAN_TYPES_LIMPIEZA.map((key) => (
                      <TableHead
                        key={`tipo-${key}`}
                        className="border border-slate-400 text-center font-bold text-[11px] bg-teal-200 px-0.5 py-1.5"
                        style={{ color: '#000000', fontWeight: 'bold' }}
                      >
                        {key}
                      </TableHead>
                    ))}
                    {CLEAN_TYPES_VIDRIO.map((key) => (
                      <TableHead
                        key={`vidrio-${key}`}
                        className="border border-slate-400 text-center font-bold text-[11px] bg-purple-200 px-0.5 py-1.5"
                        style={{ color: '#000000', fontWeight: 'bold' }}
                      >
                        {key}
                      </TableHead>
                    ))}
                    <TableHead
                      className="border border-slate-400 text-center font-bold text-[11px] bg-emerald-200 px-0.5 py-1.5"
                      style={{ color: '#000000', fontWeight: 'bold' }}
                    >
                      URL
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {editedSections.map((section) => (
                    <React.Fragment key={`section-${section.id}`}>
                      <TableRow className="bg-slate-700">
                        <TableCell
                          colSpan={1 + DATE_COL_SPAN}
                          className="text-center font-bold text-white text-[11px] py-1.5 border border-slate-500 sticky left-0"
                        >
                          {section.area}
                        </TableCell>
                      </TableRow>

                      {section.items.map((item) => {
                        const record = item.records[0];
                        return (
                          <TableRow
                            key={`item-${section.id}-${item.id}`}
                            className="hover:bg-slate-50 transition-colors"
                          >
                            <TableCell 
                              className="border border-slate-200 font-medium text-[9px] px-1 py-1 bg-white sticky left-0 z-10" 
                              title={item.name}
                            >
                              <div className="truncate">
                                {item.name}
                              </div>
                            </TableCell>

                            {CLEAN_TYPES_LIMPIEZA.map((key) => (
                              <TableCell
                                key={`tipo-${key}`}
                                className="border border-slate-200 text-center p-0 bg-teal-50/30"
                              >
                                <EditableCheckCell
                                  checked={record.cleaningType[key]}
                                  onClick={() => handleToggleCheck(section.id, item.id, 'cleaningType', key)}
                                />
                              </TableCell>
                            ))}

                            {CLEAN_TYPES_VIDRIO.map((key) => (
                              <TableCell
                                key={`vidrio-${key}`}
                                className="border border-slate-200 text-center p-0 bg-purple-50/30"
                              >
                                <EditableCheckCell
                                  checked={record.glassPlastic[key]}
                                  onClick={() => handleToggleCheck(section.id, item.id, 'glassPlastic', key)}
                                />
                              </TableCell>
                            ))}

                            <TableCell
                              className="border border-slate-200 text-center py-0.5 px-0.5 bg-emerald-50/30"
                            >
                              <input
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                maxLength={4}
                                value={record.cleanedBy ?? ""}
                                onChange={(e) => handleCleanedByChange(section.id, item.id, e.target.value)}
                                className="w-full text-center text-[9px] text-gray-700 font-medium bg-transparent border-0 focus:outline-none focus:ring-1 focus:ring-emerald-400 rounded px-0.5 py-0.5"
                                placeholder="0000"
                              />
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default CleaningAreaReportManagement;
