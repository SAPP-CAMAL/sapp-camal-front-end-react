"use client";

import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Search,
  Scale,
  Download,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  FileText,
  Calendar,
  PawPrint,
  Activity,
  AlertCircle,
  Hash,
  User,
  Tag,
  Layers,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";

import { useLines } from "@/features/postmortem/hooks/use-lines";
import { useWeighingStages } from "@/features/animal-weighing/hooks";
import { useWeighingReport } from "../hooks/use-weighing-report";
import { downloadWeighingPdfReport } from "../server";
import type { WeighingReportFilters } from "../domain";
import {
  getLocalDateString,
  parseLocalDateString,
} from "@/features/postmortem/utils/postmortem-helpers";
import { useDebouncedCallback } from "use-debounce";
import { Badge } from "@/components/ui/badge";
import { PerformanceReportModal } from "./performance-report-modal";
import { subDays } from "date-fns";

export function WeighingReportManagement() {
  // Estados de filtros
  const [startDate, setStartDate] = useState<string>(
    getLocalDateString(subDays(new Date(), 1))
  );
  const [endDate, setEndDate] = useState<string>(getLocalDateString());
  const [selectedLineId, setSelectedLineId] = useState<string>("");
  const [selectedSpecieId, setSelectedSpecieId] = useState<number | null>(null);
  const [weighingStageId, setWeighingStageId] = useState<string>("");
  const [brandSearch, setBrandSearch] = useState("");
  const [debouncedBrandSearch, setDebouncedBrandSearch] = useState("");

  // Estados de paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Estados de UI
  const [isDownloading, setIsDownloading] = useState(false);
  const [isPerformanceModalOpen, setIsPerformanceModalOpen] = useState(false);
  const [expandedBrands, setExpandedBrands] = useState<Map<string, number>>(new Map());
  const [expandedBrandsDesktop, setExpandedBrandsDesktop] = useState<Map<string, number>>(new Map());

  // Datos de la API
  const { data: lines, isLoading: isLoadingLines } = useLines();
  const { data: weighingStagesData, isLoading: isLoadingWeighingStages } =
    useWeighingStages();

  // Debounce para el buscador de marca
  const debounceSearch = useDebouncedCallback((text: string) => {
    setDebouncedBrandSearch(text);
    setCurrentPage(1);
  }, 800);

  // Configurar filtros para la consulta
  const reportFilters = useMemo((): WeighingReportFilters | null => {
    if (!startDate || !endDate || !selectedSpecieId || !weighingStageId) {
      return null;
    }
    return {
      idWeighingStage: parseInt(weighingStageId),
      idSpecie: selectedSpecieId,
      startDate,
      endDate,
      brandName: debouncedBrandSearch || undefined,
      specieName: selectedLineId && lines ? lines.find(line => line.id?.toString() === selectedLineId)?.description?.toLowerCase() : undefined,
    };
  }, [startDate, endDate, selectedSpecieId, weighingStageId, debouncedBrandSearch, selectedLineId, lines]);

  const {
    data: reportData,
    isLoading: isLoadingReport,
    isFetching,
  } = useWeighingReport(reportFilters);

  // Seleccionar Bovinos por defecto
  useEffect(() => {
    if (lines && lines.length > 0 && !selectedLineId) {
      const bovinosLine = lines.find((line) =>
        line.description.toLowerCase().includes("bovino")
      );
      if (bovinosLine) {
        setSelectedLineId(bovinosLine.id.toString());
        setSelectedSpecieId(bovinosLine.idSpecie);
      }
    }
  }, [lines, selectedLineId]);

  // Seleccionar primer tipo de pesaje disponible
  useEffect(() => {
    if (weighingStagesData?.data && weighingStagesData.data.length > 0 && !weighingStageId) {
      setWeighingStageId(weighingStagesData.data[0].id.toString());
    }
  }, [weighingStagesData, weighingStageId]);

  // Datos a mostrar
  const displayData = useMemo(() => {
    return reportData?.data ?? [];
  }, [reportData]);

  // Datos paginados
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return displayData.slice(startIndex, endIndex);
  }, [displayData, currentPage, itemsPerPage]);

  const totalPages = Math.max(1, Math.ceil(displayData.length / itemsPerPage));

  // Manejar cambio de línea/especie
  const handleLineChange = (lineId: string) => {
    setSelectedLineId(lineId);
    const selectedLine = lines?.find((l) => l.id.toString() === lineId);
    if (selectedLine) {
      setSelectedSpecieId(selectedLine.idSpecie);
    }
    setCurrentPage(1);
  };

  // Descargar reporte PDF
  const handleDownloadPdf = async () => {
    if (!reportFilters) {
      toast.error("Seleccione los filtros requeridos");
      return;
    }

    try {
      setIsDownloading(true);
      const { blob, filename } = await downloadWeighingPdfReport(reportFilters);

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();

      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success("Reporte descargado exitosamente");
    } catch (error) {
      toast.error("Error al descargar el reporte");
    } finally {
      setIsDownloading(false);
    }
  };

  // Verificar si faltan filtros requeridos
  const missingFilters = !selectedSpecieId || !weighingStageId;

  // Función para expandir marca (mostrar 10 más)
  const expandBrand = (brandKey: string, totalAnimals: number) => {
    setExpandedBrands((prev) => {
      const newMap = new Map(prev);
      const currentShown = newMap.get(brandKey) || 4;
      const newShown = Math.min(currentShown + 10, totalAnimals);
      newMap.set(brandKey, newShown);
      return newMap;
    });
  };

  // Función para colapsar marca (volver a 4)
  const collapseBrand = (brandKey: string) => {
    setExpandedBrands((prev) => {
      const newMap = new Map(prev);
      newMap.delete(brandKey);
      return newMap;
    });
  };

  // Función para expandir marca en desktop (mostrar 10 más)
  const expandBrandDesktop = (brandKey: string, totalAnimals: number) => {
    setExpandedBrandsDesktop((prev) => {
      const newMap = new Map(prev);
      const currentShown = newMap.get(brandKey) || 10;
      const newShown = Math.min(currentShown + 10, totalAnimals);
      newMap.set(brandKey, newShown);
      return newMap;
    });
  };

  // Función para colapsar marca en desktop (volver a 10)
  const collapseBrandDesktop = (brandKey: string) => {
    setExpandedBrandsDesktop((prev) => {
      const newMap = new Map(prev);
      newMap.delete(brandKey);
      return newMap;
    });
  };

  return (
    <div>
      {/* Header */}
      <section className="mb-4 flex flex-col sm:flex-row justify-between gap-4">
        <div className="py-0 px-2">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <FileText className="h-5 w-5 text-teal-600" />
            Reporte de Pesajes
          </h2>
          <p className="text-gray-600 text-sm mt-1">
            Generación de reportes de pesaje por rango de fechas
          </p>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                disabled={isDownloading || !reportFilters}
                className="bg-teal-600 hover:bg-teal-700 text-white"
              >
                {isDownloading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Descargando...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Descargar Reporte
                  </>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem
                onClick={handleDownloadPdf}
                disabled={isDownloading || !reportFilters}
                className="cursor-pointer"
              >
                <FileText className="mr-2 h-4 w-4 text-red-600" />
                <div className="flex flex-col">
                  <span className="font-medium">Reporte Pesaje</span>
                  <span className="text-xs text-gray-500">Descargar en PDF</span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  if (!debouncedBrandSearch || debouncedBrandSearch.trim().length === 0) {
                    toast.error("Debe buscar por marca antes de generar el reporte de rendimiento");
                    return;
                  }
                  setIsPerformanceModalOpen(true);
                }}
                disabled={!reportFilters}
                className="cursor-pointer"
              >
                <TrendingUp className="mr-2 h-4 w-4 text-teal-600" />
                <div className="flex flex-col">
                  <span className="font-medium">Reporte Rendimiento</span>
                  <span className="text-xs text-gray-500">Configurar parámetros</span>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </section>

      {/* Filtros */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="flex gap-2 items-center text-base">
            Filtros de Búsqueda
          </CardTitle>
          <CardDescription>
            Filtre los reportes por fecha, especie, tipo de pesaje o busque por
            nombre de marca
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
            {/* Fecha Inicio */}
            <div className="flex flex-col w-full">
              <label className="mb-1 text-sm font-medium text-gray-700 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                Fecha Inicio
              </label>
              <DatePicker
                selected={parseLocalDateString(startDate)}
                onSelect={(date) =>
                  date && setStartDate(getLocalDateString(date))
                }
                inputClassName="h-10 w-full border border-gray-300 rounded-md shadow-sm"
              />
            </div>

            {/* Fecha Fin */}
            <div className="flex flex-col w-full">
              <label className="mb-1 text-sm font-medium text-gray-700 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                Fecha Fin
              </label>
              <DatePicker
                selected={parseLocalDateString(endDate)}
                onSelect={(date) =>
                  date && setEndDate(getLocalDateString(date))
                }
                inputClassName="h-10 w-full border border-gray-300 rounded-md shadow-sm"
              />
            </div>

            {/* Tipo de Especie */}
            <div className="flex flex-col w-full">
              <label className="mb-1 text-sm font-medium text-gray-700 flex items-center gap-2">
                <PawPrint className="h-4 w-4 text-primary" />
                Especie
              </label>
              <Select
                value={selectedLineId}
                onValueChange={handleLineChange}
                disabled={isLoadingLines}
              >
                <SelectTrigger className="h-10 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
                  <SelectValue placeholder="Seleccione especie" />
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

            {/* Tipo de Pesaje */}
            <div className="flex flex-col w-full">
              <label className="mb-1 text-sm font-medium text-gray-700 flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" />
                Tipo de Pesaje
              </label>
              <Select
                value={weighingStageId}
                onValueChange={(value) => {
                  setWeighingStageId(value);
                  setCurrentPage(1);
                }}
                disabled={isLoadingWeighingStages}
              >
                <SelectTrigger className="h-10 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
                  <SelectValue placeholder="Seleccione uno" />
                </SelectTrigger>
                <SelectContent>
                  {weighingStagesData?.data?.map((stage) => (
                    <SelectItem key={stage.id} value={stage.id.toString()}>
                      {stage.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Buscador por Marca */}
            <div className="flex flex-col w-full">
              <label className="mb-1 text-sm font-medium text-gray-700 flex items-center gap-2">
                <Search className="h-4 w-4 text-primary" />
                Buscar Marca
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 z-10 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Nombre de marca..."
                  value={brandSearch}
                  className="pl-10 pr-3 h-10 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2"
                  onChange={(e) => {
                    setBrandSearch(e.target.value);
                    debounceSearch(e.target.value);
                  }}
                />
                {isFetching && brandSearch && (
                  <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-gray-400" />
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mensaje si faltan filtros */}
      {missingFilters && (
        <Card className="mb-4 border-amber-200 bg-amber-50">
          <CardContent className="py-4">
            <div className="flex items-center gap-3 text-amber-700">
              <AlertCircle className="h-5 w-5" />
              <span className="text-sm">
                Seleccione <strong>Especie</strong> y{" "}
                <strong>Tipo de Pesaje</strong> para cargar el reporte.
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabla de Resultados - Desktop */}
      <Card className="hidden md:block">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-teal-600 hover:bg-teal-600/90">
                  <TableHead className="w-[60px] text-center font-semibold text-white border-r border-teal-500/30">
                    <div className="flex items-center justify-center gap-2">
                      <Hash className="h-4 w-4" />
                      NRO.
                    </div>
                  </TableHead>
                  <TableHead className="w-[280px] font-semibold text-white border-r border-teal-500/30">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      INTRODUCTOR
                    </div>
                  </TableHead>
                  <TableHead className="w-[120px] font-semibold text-center text-white border-r border-teal-500/30">
                    <div className="flex items-center justify-center gap-2">
                      <Calendar className="h-4 w-4" />
                      FECHA FAENA
                    </div>
                  </TableHead>
                  <TableHead className="w-[150px] font-semibold text-center text-white border-r border-teal-500/30">
                    <div className="flex items-center justify-center gap-2">
                      <Tag className="h-4 w-4" />
                      MARCA
                    </div>
                  </TableHead>
                  <TableHead className="w-[180px] font-semibold text-center text-white border-r border-teal-500/30">
                    <div className="flex items-center justify-center gap-2">
                      <Layers className="h-4 w-4" />
                      ETAPA PRODUCTIVA
                    </div>
                  </TableHead>
                  <TableHead className="text-right font-semibold text-white">
                    <div className="flex items-center justify-end gap-2 px-4">
                      <Scale className="h-4 w-4" />
                      PESO NETO (LB)
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingReport ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-40 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
                        <span className="text-gray-500">Cargando datos...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : missingFilters ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-40 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <Scale className="h-12 w-12 text-gray-300" />
                        <span className="text-gray-500">
                          Configure los filtros para ver el reporte
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : paginatedData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-40 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <Scale className="h-12 w-12 text-gray-300" />
                        <span className="text-gray-500">
                          No se encontraron registros
                        </span>
                        <span className="text-xs text-gray-400">
                          Ajuste los filtros o el rango de fechas
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedData.map((row, introducerIndex) => {
                    let isFirstRowOfIntroducer = true;
                    const rows: React.ReactNode[] = [];

                    // Calcular el total de filas visibles para este introductor
                    let totalVisibleRows = 0;
                    row.brands.forEach((brandGroup) => {
                      const brandKey = `${row.id}-${brandGroup.brandId}`;
                      const shownCount = expandedBrandsDesktop.get(brandKey) || 10;
                      const totalAnimals = brandGroup.animals.length;
                      const showExpandButton = totalAnimals > 10;
                      const visibleAnimals = Math.min(shownCount, totalAnimals);
                      
                      totalVisibleRows += visibleAnimals;
                      if (showExpandButton && visibleAnimals < totalAnimals) {
                        totalVisibleRows += 1; // Fila del botón de expansión
                      } else if (showExpandButton && visibleAnimals === totalAnimals) {
                        totalVisibleRows += 1; // Fila del botón de colapsar
                      }
                    });

                    row.brands.forEach((brandGroup, brandIndex) => {
                      const brandKey = `${row.id}-${brandGroup.brandId}`;
                      const shownCount = expandedBrandsDesktop.get(brandKey) || 10;
                      const totalAnimals = brandGroup.animals.length;
                      const showExpandButton = totalAnimals > 10;
                      const animalsToShow = brandGroup.animals.slice(0, shownCount);
                      const hasMore = shownCount < totalAnimals;

                      animalsToShow.forEach((animal, animalIndex) => {
                        const isFirstAnimalOfBrand = animalIndex === 0;

                        rows.push(
                          <TableRow
                            key={`${row.id}-${brandGroup.brandId}-${animal.id}`}
                            className="border-b hover:bg-gray-50 transition-colors"
                          >
                            {/* NRO - Solo en la primera fila del introductor */}
                            {isFirstRowOfIntroducer && (
                              <TableCell
                                className="text-center font-medium text-gray-600 align-middle bg-gray-50/50 border-r"
                                rowSpan={totalVisibleRows}
                              >
                                {(currentPage - 1) * itemsPerPage +
                                  introducerIndex +
                                  1}
                              </TableCell>
                            )}

                            {/* INTRODUCTOR - Solo en la primera fila del introductor */}
                            {isFirstRowOfIntroducer && (
                              <TableCell
                                className="align-middle bg-gray-50/50 border-r"
                                rowSpan={totalVisibleRows}
                              >
                                <div className="flex flex-col gap-1 pl-2">
                                  <span className="font-semibold text-gray-900 uppercase">
                                    {row.introducer.fullName}
                                  </span>
                                </div>
                              </TableCell>
                            )}

                            {/* FECHA FAENA - Solo en la primera fila del introductor */}
                            {isFirstRowOfIntroducer && (
                              <TableCell
                                className="align-middle text-center bg-gray-50/50 border-r"
                                rowSpan={totalVisibleRows}
                              >
                                <div className="flex flex-col items-center gap-1">
                                  <span className="text-sm font-medium text-gray-700">
                                    {new Date(row.introducer.slaughterDate).toLocaleDateString("es-EC")}
                                  </span>
                                </div>
                              </TableCell>
                            )}

                            {/* MARCA - Solo en la primera fila de cada marca */}
                            {isFirstAnimalOfBrand && (
                              <TableCell
                                className="align-middle text-center border-r"
                                rowSpan={animalsToShow.length}
                              >
                                <Badge
                                  variant="outline"
                                  className="bg-blue-50 text-blue-700 border-blue-200 font-medium"
                                >
                                  {brandGroup.brandName}
                                </Badge>
                              </TableCell>
                            )}

                            {/* ETAPA PRODUCTIVA + CÓDIGO - Cada animal */}
                            <TableCell className="align-middle text-center border-r">
                              <div className="flex flex-col items-center gap-1">
                                <Badge
                                  variant="secondary"
                                  className="bg-amber-50 text-amber-700 border-amber-200"
                                >
                                  {animal.productiveStage}
                                </Badge>
                                <span className="text-xs text-gray-500">
                                  Cód: {animal.code}
                                </span>
                              </div>
                            </TableCell>

                            {/* PESO NETO - Cada animal */}
                            <TableCell className="text-right align-middle pr-4">
                              <span className="font-bold text-emerald-600 text-lg">
                                {animal.netWeight.toFixed(2)}
                              </span>
                              <span className="text-gray-500 text-sm ml-1">
                                LB
                              </span>
                            </TableCell>
                          </TableRow>
                        );

                        isFirstRowOfIntroducer = false;
                      });

                      // Agregar fila de expansión si hay más de 10 animales
                      if (showExpandButton) {
                        rows.push(
                          <TableRow
                            key={`${brandKey}-expand`}
                            className="bg-blue-50 hover:bg-blue-100 transition-colors"
                          >
                            <TableCell colSpan={6} className="text-center py-3">
                              <div className="flex items-center justify-center gap-3">
                                {hasMore && (
                                  <button
                                    onClick={() => expandBrandDesktop(brandKey, totalAnimals)}
                                    className="inline-flex items-center gap-2 text-blue-700 font-medium text-sm hover:text-blue-800 transition-colors"
                                  >
                                    <ChevronDown className="h-4 w-4 transition-transform" />
                                    Ver 10 más ({totalAnimals - shownCount} restantes)
                                  </button>
                                )}
                                {!hasMore && (
                                  <button
                                    onClick={() => collapseBrandDesktop(brandKey)}
                                    className="inline-flex items-center gap-2 text-blue-700 font-medium text-sm hover:text-blue-800 transition-colors"
                                  >
                                    <ChevronDown className="h-4 w-4 rotate-180 transition-transform" />
                                    Mostrar menos
                                  </button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      }
                    });

                    return rows;
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Paginación */}
          {displayData.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t">
              <span className="text-sm text-gray-600">
                Mostrando{" "}
                <span className="font-medium">
                  {Math.min((currentPage - 1) * itemsPerPage + 1, displayData.length)}
                </span>{" "}
                a{" "}
                <span className="font-medium">
                  {Math.min(currentPage * itemsPerPage, displayData.length)}
                </span>{" "}
                de <span className="font-medium">{displayData.length}</span>{" "}
                introductores
              </span>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Anterior
                </Button>

                <div className="flex items-center gap-1">
                  {Array.from(
                    { length: Math.min(5, totalPages) },
                    (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }

                      return (
                        <Button
                          key={pageNum}
                          variant={
                            currentPage === pageNum ? "default" : "outline"
                          }
                          size="sm"
                          onClick={() => setCurrentPage(pageNum)}
                          className={
                            currentPage === pageNum
                              ? "bg-primary text-primary-foreground"
                              : ""
                          }
                        >
                          {pageNum}
                        </Button>
                      );
                    }
                  )}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                  }
                  disabled={currentPage === totalPages}
                >
                  Siguiente
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Vista de Cards - Mobile/Tablet */}
      <div className="md:hidden space-y-4">
        {isLoadingReport ? (
          <Card>
            <CardContent className="py-12">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
                <span className="text-gray-500">Cargando datos...</span>
              </div>
            </CardContent>
          </Card>
        ) : missingFilters ? (
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="py-8">
              <div className="flex flex-col items-center gap-3 text-amber-700">
                <Scale className="h-12 w-12" />
                <span className="text-sm text-center">
                  Configure los filtros para ver el reporte
                </span>
              </div>
            </CardContent>
          </Card>
        ) : paginatedData.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="flex flex-col items-center gap-3">
                <Scale className="h-12 w-12 text-gray-300" />
                <span className="text-gray-500">No se encontraron registros</span>
                <span className="text-xs text-gray-400 text-center">
                  Ajuste los filtros o el rango de fechas
                </span>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {paginatedData.map((row, introducerIndex) => (
              <Card key={row.id} className="overflow-hidden">
                <CardHeader className="bg-teal-600 text-white p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Hash className="h-4 w-4" />
                        <span className="text-sm font-medium">
                          NRO. {(currentPage - 1) * itemsPerPage + introducerIndex + 1}
                        </span>
                      </div>
                      <h3 className="font-bold text-base uppercase">
                        {row.introducer.fullName}
                      </h3>
                      <div className="flex items-center gap-1 mt-1 text-xs opacity-90">
                        <Calendar className="h-3 w-3" />
                        <span>
                          Faena: {new Date(row.introducer.slaughterDate).toLocaleDateString("es-EC")}
                        </span>
                      </div>
                    </div>
                    <User className="h-5 w-5 opacity-80" />
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {row.brands.map((brandGroup) => {
                    const brandKey = `${row.id}-${brandGroup.brandId}`;
                    const shownCount = expandedBrands.get(brandKey) || 4;
                    const totalAnimals = brandGroup.animals.length;
                    const showExpandButton = totalAnimals > 4;
                    const animalsToShow = brandGroup.animals.slice(0, shownCount);
                    const hasMore = shownCount < totalAnimals;

                    return (
                      <div key={brandGroup.brandId} className="border-b last:border-b-0">
                        <div className="bg-blue-50 px-4 py-2 border-b">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Tag className="h-4 w-4 text-blue-600" />
                              <span className="font-semibold text-blue-700">
                                {brandGroup.brandName}
                              </span>
                            </div>
                            {showExpandButton && (
                              <span className="text-xs text-blue-600 font-medium">
                                {totalAnimals} animales
                              </span>
                            )}
                          </div>
                        </div>
                        {animalsToShow.map((animal) => (
                          <div
                            key={animal.id}
                            className="p-4 border-b last:border-b-0 hover:bg-gray-50 transition-colors"
                          >
                            <div className="space-y-3">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1">
                                  <Badge
                                    variant="secondary"
                                    className="bg-amber-50 text-amber-700 border-amber-200 mb-2"
                                  >
                                    {animal.productiveStage}
                                  </Badge>
                                  <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Layers className="h-3 w-3" />
                                    <span>Código: {animal.code}</span>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                                    <Scale className="h-3 w-3" />
                                    <span>Peso Neto</span>
                                  </div>
                                  <div className="font-bold text-emerald-600 text-xl">
                                    {animal.netWeight.toFixed(2)}
                                    <span className="text-sm text-gray-500 ml-1">LB</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                        {showExpandButton && (
                          <button
                            onClick={() => {
                              if (hasMore) {
                                expandBrand(brandKey, totalAnimals);
                              } else {
                                collapseBrand(brandKey);
                              }
                            }}
                            className="w-full py-3 px-4 bg-blue-50 hover:bg-blue-100 transition-colors flex items-center justify-center gap-2 text-blue-700 font-medium text-sm"
                          >
                            {hasMore ? (
                              <>
                                <ChevronDown className="h-4 w-4 transition-transform" />
                                Ver 10 más ({totalAnimals - shownCount} restantes)
                              </>
                            ) : (
                              <>
                                <ChevronDown className="h-4 w-4 rotate-180 transition-transform" />
                                Mostrar menos
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            ))}

            {/* Paginación Mobile */}
            {displayData.length > 0 && (
              <Card>
                <CardContent className="p-4">
                  <div className="space-y-4">
                    <div className="text-sm text-gray-600 text-center">
                      Mostrando{" "}
                      <span className="font-medium">
                        {Math.min((currentPage - 1) * itemsPerPage + 1, displayData.length)}
                      </span>{" "}
                      a{" "}
                      <span className="font-medium">
                        {Math.min(currentPage * itemsPerPage, displayData.length)}
                      </span>{" "}
                      de <span className="font-medium">{displayData.length}</span>
                    </div>

                    <div className="flex items-center justify-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="flex-1 max-w-[120px]"
                      >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Anterior
                      </Button>

                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
                          let pageNum;
                          if (totalPages <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage <= 2) {
                            pageNum = i + 1;
                          } else if (currentPage >= totalPages - 1) {
                            pageNum = totalPages - 2 + i;
                          } else {
                            pageNum = currentPage - 1 + i;
                          }

                          return (
                            <Button
                              key={pageNum}
                              variant={currentPage === pageNum ? "default" : "outline"}
                              size="sm"
                              onClick={() => setCurrentPage(pageNum)}
                              className={`w-10 h-10 p-0 ${
                                currentPage === pageNum
                                  ? "bg-teal-600 text-white hover:bg-teal-700"
                                  : ""
                              }`}
                            >
                              {pageNum}
                            </Button>
                          );
                        })}
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        className="flex-1 max-w-[120px]"
                      >
                        Siguiente
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>

      {/* Modal de Reporte de Rendimiento */}
      <PerformanceReportModal
        open={isPerformanceModalOpen}
        onOpenChange={setIsPerformanceModalOpen}
        filters={
          reportFilters
            ? {
                idWeighingStage: reportFilters.idWeighingStage,
                idSpecie: reportFilters.idSpecie,
                startDate: reportFilters.startDate,
                endDate: reportFilters.endDate,
                brandName: debouncedBrandSearch || undefined,
              }
            : null
        }
      />
    </div>
  );
}
