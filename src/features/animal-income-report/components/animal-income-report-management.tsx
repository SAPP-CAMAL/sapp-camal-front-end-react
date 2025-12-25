"use client";

import { useState, useRef } from "react";
import { format } from "date-fns";
import { TrendingUp, PieChart as PieChartIcon, CalendarIcon, Table2, Menu, Printer, FileSpreadsheet, Maximize2 } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DatePicker } from "@/components/ui/date-picker";
import { useAnimalIncomeReport } from "../hooks/use-animal-income-report";
import { ChartModern } from "./chart-modern";
import { Chart3D } from "./chart-3d";
import { ChartHistory } from "./chart-history";
import { SpeciesDetailModal } from "./species-detail-modal";
import * as XLSX from "xlsx";
import { getFullCompanyName } from "@/config/env.config";

// Mapeo de nombres de especies a idSpecie
const SPECIES_ID_MAP: Record<string, number> = {
  BOVINO: 4,
  PORCINO: 3,
  "OVINO/CAPRINO": 5,
};

export function AnimalIncomeReportManagement() {
  const { dateRange, reportData, isLoading, fetchReport } = useAnimalIncomeReport();
  const [chartType, setChartType] = useState<"2d" | "3d">("2d");
  const [startDate, setStartDate] = useState<Date>(dateRange.from || new Date("2023-02-03"));
  const [endDate, setEndDate] = useState<Date>(dateRange.to || new Date());
  const [show3D, setShow3D] = useState(false);
  const chartRef = useRef<HTMLDivElement>(null);
  const printRef = useRef<HTMLDivElement>(null);

  // Estado para el modal de detalle
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSpecies, setSelectedSpecies] = useState<{ name: string; id: number } | null>(null);

  const handleSpeciesClick = (speciesName: string) => {
    const idSpecie = SPECIES_ID_MAP[speciesName];
    if (idSpecie) {
      setSelectedSpecies({ name: speciesName, id: idSpecie });
      setModalOpen(true);
    }
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat("es-EC").format(value);
  };

  const handleDateChange = (from: Date, to: Date) => {
    fetchReport({ from, to });
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Reporte de Ingresos de Animales</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; color: #334155; }
            h1 { text-align: center; color: #0f172a; margin-bottom: 8px; font-size: 20px; text-transform: uppercase; }
            h2 { text-align: center; color: #64748b; font-size: 14px; font-weight: normal; margin-bottom: 32px; }
            .chart-img { display: block; margin: 0 auto; max-width: 100%; height: auto; border: 1px solid #e2e8f0; border-radius: 8px; }
            table { width: 100%; border-collapse: collapse; margin-top: 32px; font-size: 12px; }
            th, td { border: 1px solid #e2e8f0; padding: 10px; text-align: left; }
            th { background-color: #f8fafc; color: #475569; font-weight: 600; }
            .text-right { text-align: right; }
            .font-bold { font-weight: bold; }
            @media print { .no-print { display: none; } }
          </style>
        </head>
        <body>
          <h1>${getFullCompanyName()}</h1>
          <h2>Reporte de Ingresos por Especie (${format(startDate, "dd/MM/yyyy")} - ${format(endDate, "dd/MM/yyyy")})</h2>
          
          <div style="text-align: center; margin-bottom: 30px;">
             <p style="font-size: 14px; color: #334155;"><strong>Distribución de Ingresos</strong></p>
          </div>

          <table>
            <thead>
              <tr>
                <th>Especie</th>
                <th class="text-right">Cantidad</th>
                <th class="text-right">Porcentaje</th>
              </tr>
            </thead>
            <tbody>
              ${(reportData?.data || []).map(item => `
                <tr>
                  <td>${item.species}</td>
                  <td class="text-right">${formatNumber(item.quantity)}</td>
                  <td class="text-right">${item.percentage.toFixed(1)}%</td>
                </tr>
              `).join('')}
              <tr class="font-bold" style="background-color: #f8fafc;">
                <td>Total</td>
                <td class="text-right">${formatNumber(reportData?.total?.quantity || 0)}</td>
                <td class="text-right">100%</td>
              </tr>
            </tbody>
          </table>

          <div style="margin-top: 50px; text-align: center; font-size: 10px; color: #94a3b8;">
            Documento generado el ${format(new Date(), "dd/MM/yyyy HH:mm:ss")}
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  const handleDownloadXLS = () => {
    const dataToExport = reportData.data.map(item => ({
      Especie: item.species,
      Cantidad: item.quantity,
      Porcentaje: `${item.percentage.toFixed(1)}%`
    }));
    
    // Añadir fila de total
    dataToExport.push({
      Especie: 'TOTAL',
      Cantidad: reportData.total.quantity,
      Porcentaje: '100%'
    });

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Distribucion");
    XLSX.writeFile(workbook, `reporte-distribucion-especie-${format(startDate, "yyyyMMdd")}.xlsx`);
  };

  const handleFullScreen = () => {
    if (!chartRef.current) return;
    if (!document.fullscreenElement) {
      chartRef.current.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-3 sm:p-4 md:p-6 text-slate-900">
      <div ref={printRef} style={{ display: 'none' }} aria-hidden="true" />
      {/* Header Section */}
      <div className="mb-6 md:mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 leading-relaxed pb-3 mb-2">
              Reporte de Ingresos de Animales
            </h1>
            <p className="text-slate-500 text-sm sm:text-base lg:text-lg leading-relaxed pb-2">
              Análisis estadístico de ingresos por especie
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-2">
              <span className="text-slate-600 text-xs sm:text-sm whitespace-nowrap">Desde:</span>
              <DatePicker
                inputClassName="bg-white border-slate-200 text-slate-900 text-sm"
                selected={startDate}
                onChange={(date) => {
                  if (date) {
                    setStartDate(date);
                    handleDateChange(date, endDate);
                  }
                }}
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-600 text-xs sm:text-sm whitespace-nowrap">Hasta:</span>
              <DatePicker
                inputClassName="bg-white border-slate-200 text-slate-900 text-sm"
                selected={endDate}
                onChange={(date) => {
                  if (date) {
                    setEndDate(date);
                    handleDateChange(startDate, date);
                  }
                }}
              />
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
          <Card className="bg-white border-slate-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs sm:text-sm font-medium text-slate-600">
                Total Animales
              </CardTitle>
              <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-sky-500 flex-shrink-0" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-slate-900">
                {formatNumber(reportData.total.quantity)}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {reportData.data.length} especies registradas
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white border-slate-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs sm:text-sm font-medium text-slate-600">
                Período
              </CardTitle>
              <CalendarIcon className="h-4 w-4 sm:h-5 sm:w-5 text-amber-500 flex-shrink-0" />
            </CardHeader>
            <CardContent>
              <div className="text-base sm:text-lg font-bold text-slate-900">
                {reportData.startDate}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                hasta {reportData.endDate}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="grafico" className="space-y-4 md:space-y-6">
        <TabsList className="bg-slate-100 border border-slate-200 p-1 h-auto w-full sm:w-auto grid grid-cols-2 sm:flex">
          <TabsTrigger 
            value="grafico" 
            className="px-4 sm:px-6 py-2 text-sm data-[state=active]:bg-sky-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300"
          >
            <PieChartIcon className="h-4 w-4 mr-1 sm:mr-2" />
            <span className="text-xs sm:text-sm">Gráfico</span>
          </TabsTrigger>
          <TabsTrigger 
            value="tabla" 
            className="px-4 sm:px-6 py-2 text-sm data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300"
          >
          <Table2 className="h-4 w-4 mr-1 sm:mr-2"/>
            <span className="text-xs sm:text-sm">Tabla</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="grafico" className="space-y-4 md:space-y-6">
          <Card ref={chartRef} className="bg-white border-slate-200 shadow-sm overflow-hidden">
            <CardHeader className="space-y-3">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                <div className="flex-1">
                  <CardTitle className="text-slate-900 text-lg sm:text-xl lg:text-2xl">
                    Gráfico Estadístico
                  </CardTitle>
                  <CardDescription className="text-slate-500 text-xs sm:text-sm mt-1">
                    Distribución de ingresos por especie entre {reportData.startDate} y {reportData.endDate}
                  </CardDescription>
                </div>
                <div className="flex bg-slate-100 rounded-lg p-1 border border-slate-200 w-full sm:w-auto">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setChartType("2d");
                      setShow3D(false);
                    }}
                    className={`rounded-md px-3 sm:px-4 py-2 text-xs sm:text-sm flex-1 sm:flex-none transition-all duration-300 ${
                      chartType === "2d" 
                        ? "bg-teal-600 text-white shadow-md" 
                        : "text-slate-500 hover:text-slate-900 hover:bg-slate-200"
                    }`}
                  >
                    2D Moderno
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setChartType("3d");
                      setShow3D(true);
                    }}
                    className={`rounded-md px-3 sm:px-4 py-2 text-xs sm:text-sm flex-1 sm:flex-none transition-all duration-300 ${
                      chartType === "3d" 
                        ? "bg-teal-600 text-white shadow-md" 
                        : "text-slate-500 hover:text-slate-900 hover:bg-slate-200"
                    }`}
                  >
                    3D Interactivo
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-600">
                        <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuItem onClick={handlePrint} className="cursor-pointer text-sm">
                        <Printer className="mr-2 h-4 w-4" />
                        <span>Imprimir</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleDownloadXLS} className="cursor-pointer text-sm">
                        <FileSpreadsheet className="mr-2 h-4 w-4" />
                        <span>Descargar en XLS</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleFullScreen} className="cursor-pointer text-sm">
                        <Maximize2 className="mr-2 h-4 w-4" />
                        <span>Ver en pantalla completa</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-3 sm:p-6">
              {isLoading ? (
                <div className="h-[300px] sm:h-[400px] lg:h-[500px] flex items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-t-2 border-b-2 border-sky-500"></div>
                </div>
              ) : (
                <>
                  {chartType === "2d" && <ChartModern data={reportData.data} />}
                  {chartType === "3d" && show3D && <Chart3D data={reportData.data} key="chart-3d-stable" />}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tabla">
          <Card className="bg-white border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-slate-900 text-lg sm:text-xl lg:text-2xl">Tabla de Datos</CardTitle>
              <CardDescription className="text-slate-500 text-xs sm:text-sm">
                Detalle de ingresos por especie
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 sm:p-6">
              <div className="rounded-lg border border-slate-200 overflow-x-auto">
                <Table>
                  <TableHeader className="bg-slate-50">
                    <TableRow className="border-slate-200 hover:bg-slate-100">
                      <TableHead className="text-slate-700 font-semibold text-xs sm:text-sm whitespace-nowrap">Especies</TableHead>
                      <TableHead className="text-slate-700 font-semibold text-right text-xs sm:text-sm whitespace-nowrap">
                        Cantidad
                      </TableHead>
                      <TableHead className="text-slate-700 font-semibold text-right text-xs sm:text-sm whitespace-nowrap">
                        %
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reportData.data.map((item, index) => (
                      <TableRow
                        key={item.species}
                        className="border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
                        onClick={() => handleSpeciesClick(item.species)}
                      >
                        <TableCell className="font-medium text-slate-900 text-xs sm:text-sm">
                          <div className="flex items-center gap-2 sm:gap-3">
                            <div
                              className="w-2 h-2 sm:w-3 sm:h-3 rounded-full flex-shrink-0"
                              style={{
                                backgroundColor: [
                                  "#0f766e",
                                  "#14b8a6",
                                  "#f59e0b",
                                  "#ef4444",
                                  "#8b5cf6",
                                  "#ec4899",
                                ][index % 6],
                              }}
                            />
                            <span className="truncate hover:underline">{item.species}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right text-slate-600 text-xs sm:text-sm whitespace-nowrap">
                          {formatNumber(item.quantity)}
                        </TableCell>
                        <TableCell className="text-right text-slate-600 text-xs sm:text-sm">
                          <div className="flex items-center justify-end gap-2">
                            <span className="whitespace-nowrap">{item.percentage.toFixed(1)}%</span>
                            <div className="w-12 sm:w-16 h-2 bg-slate-200 rounded-full overflow-hidden hidden md:block">
                              <div
                                className="h-full bg-gradient-to-r from-sky-500 to-primary rounded-full transition-all duration-500"
                                style={{ width: `${item.percentage}%` }}
                              />
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="border-slate-200 bg-slate-50 font-bold">
                      <TableCell className="text-slate-900 text-xs sm:text-sm">Total</TableCell>
                      <TableCell className="text-right text-slate-900 text-xs sm:text-sm whitespace-nowrap">
                        {formatNumber(reportData.total.quantity)}
                      </TableCell>
                      <TableCell className="text-right text-slate-900 text-xs sm:text-sm">100%</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* History Chart */}
      <ChartHistory 
        data={reportData.historyData || []} 
        startDate={reportData.startDate} 
        endDate={reportData.endDate}
        tableData={reportData.data}
      />

      {/* Modal de detalle por especie */}
      {selectedSpecies && (
        <SpeciesDetailModal
          isOpen={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setSelectedSpecies(null);
          }}
          speciesName={selectedSpecies.name}
          idSpecie={selectedSpecies.id}
          startDate={format(startDate, "yyyy-MM-dd")}
          endDate={format(endDate, "yyyy-MM-dd")}
        />
      )}
    </div>
  );
}
