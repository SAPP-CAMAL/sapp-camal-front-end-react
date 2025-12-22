"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TransportConditionsFilters } from "../domain";
import {
  getTransportConditionsService,
  getCurrentDate,
  downloadTransportConditionsReport,
} from "../server/db/transport-conditions.service";
import { getAllSpecies } from "@/features/specie/server/db/specie.service";
import { Specie } from "@/features/specie/domain";
import {
  Filter,
  FileUp,
  RotateCcw,
  Search,
  ChevronDown,
  FileSpreadsheet,
  FileText,
  Check,
  X,
  Truck,
  Calendar,
  CalendarDays,
  PawPrint,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { useIsMobile } from "@/hooks/use-mobile";
import { DatePicker } from "@/components/ui/date-picker";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

export function TransportConditionsManagement() {
  const initialFilters: TransportConditionsFilters = {
    startDate: getCurrentDate(),
    endDate: getCurrentDate(),
    specieId: null,
  };

  const [filters, setFilters] = useState<TransportConditionsFilters>(initialFilters);
  const [apiData, setApiData] = useState<any[]>([]);
  const [species, setSpecies] = useState<Specie[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const isMobile = useIsMobile();

  // Cargar especies
  useEffect(() => {
    const loadSpecies = async () => {
      try {
        const response = await getAllSpecies();
        if (response.data) {
          setSpecies(Array.isArray(response.data) ? response.data : [response.data]);
        }
      } catch (error) {
        console.error("Error cargando especies:", error);
      }
    };
    loadSpecies();
  }, []);

  // Cargar datos
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const data = await getTransportConditionsService(filters);
        setApiData(data);
      } catch (error) {
        console.error("Error cargando datos:", error);
        toast.error("Error al cargar los datos");
        setApiData([]);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [filters]);

  const handleFilterChange = useCallback(
    (name: keyof TransportConditionsFilters, value: string | number | null) => {
      setFilters((prev) => ({
        ...prev,
        [name]: value,
      }));
    },
    []
  );

  const clearFilters = useCallback(() => {
    setFilters(initialFilters);
  }, []);

  const handleDownloadReport = async (type: "EXCEL" | "PDF") => {
    toast.promise(
      (async () => {
        const { blob, filename } = await downloadTransportConditionsReport(filters, type);
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      })(),
      {
        loading: "Generando reporte...",
        success: `Reporte ${type} descargado correctamente`,
        error: "Error al descargar el reporte",
      }
    );
  };

  const totals = useMemo(
    () => ({
      registros: apiData.length,
    }),
    [apiData]
  );

  // Vista móvil/tablet
  const MobileCard = ({ item }: { item: any }) => (
    <Card className="mb-3 sm:mb-4">
      <CardContent className="p-3 sm:p-4 space-y-2 sm:space-y-3">
        <div className="flex justify-between items-start border-b pb-2 sm:pb-3">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-green-600" />
            <div className="font-semibold text-sm">
              {item.entryDate ? format(parseISO(item.entryDate), "dd/MM/yyyy") : "N/A"}
            </div>
          </div>
          {item.ownMobilization ? (
            <Badge variant="default" className="bg-green-100 text-green-800 text-xs">
              <Check className="h-3 w-3 mr-1" /> Mov. Propia
            </Badge>
          ) : (
            <Badge variant="secondary" className="text-xs">
              <X className="h-3 w-3 mr-1" /> Sin Mov. Propia
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
          <div className="flex items-center gap-2">
            <Truck className="h-4 w-4 text-muted-foreground" />
            <div className="flex-1 min-w-0">
              <div className="text-xs text-muted-foreground">Transportista</div>
              <div className="text-sm font-medium truncate">{item.carrierName || "N/A"}</div>
            </div>
          </div>

          <div className="bg-muted/50 rounded-lg p-2 sm:p-3 space-y-1.5 sm:space-y-2 sm:col-span-2">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-xs text-muted-foreground block">Tipo de Cama</span>
                <Badge variant="secondary" className="text-xs mt-0.5">{item.bedType || "N/A"}</Badge>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block">Condiciones de Arribo</span>
                <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-200 text-xs mt-0.5">
                  {item.arrivalConditions || "N/A"}
                </Badge>
              </div>
            </div>
          </div>

          {item.observations && (
            <div className="sm:col-span-2">
              <div className="text-xs text-muted-foreground">Observaciones</div>
              <div className="text-sm text-muted-foreground/80">{item.observations}</div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-3 sm:space-y-4 px-1 sm:px-0">
      <section>
        <h1 className="font-semibold text-lg sm:text-xl">Condiciones de Transporte</h1>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Registro detallado de las condiciones de transporte de animales
        </p>
      </section>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground opacity-50" />
            Filtros
          </CardTitle>
          <CardDescription>Filtra los registros según tus necesidades</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 items-end">
            {/* Fecha Inicio */}
            <div className="flex flex-col gap-1 min-w-0">
              <label className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                <CalendarDays className="h-3.5 w-3.5 text-green-600" />
                Fecha Inicio
              </label>
              <DatePicker
                inputClassName="bg-secondary w-full"
                iconClassName="text-muted-foreground"
                dateFormat="dd/MM/yyyy"
                selected={parseISO(filters.startDate)}
                onChange={(date) => {
                  if (!date) return;
                  handleFilterChange("startDate", format(date, "yyyy-MM-dd"));
                }}
              />
            </div>

            {/* Fecha Fin */}
            <div className="flex flex-col gap-1 min-w-0">
              <label className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                <CalendarDays className="h-3.5 w-3.5 text-green-600" />
                Fecha Fin
              </label>
              <DatePicker
                inputClassName="bg-secondary w-full"
                iconClassName="text-muted-foreground"
                dateFormat="dd/MM/yyyy"
                selected={parseISO(filters.endDate)}
                onChange={(date) => {
                  if (!date) return;
                  handleFilterChange("endDate", format(date, "yyyy-MM-dd"));
                }}
              />
            </div>

            {/* Especie */}
            <div className="flex flex-col gap-1 min-w-0 sm:col-span-2 lg:col-span-1">
              <label className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                <PawPrint className="h-3.5 w-3.5 text-green-600" />
                Especie
              </label>
              <Select
                value={filters.specieId?.toString() || ""}
                onValueChange={(value) =>
                  handleFilterChange("specieId", value ? parseInt(value) : null)
                }
              >
                <SelectTrigger className="bg-secondary w-full">
                  <SelectValue placeholder="Selecciona una especie" />
                </SelectTrigger>
                <SelectContent>
                  {species.map((specie) => (
                    <SelectItem key={specie.id} value={specie.id.toString()}>
                      {specie.description || specie.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Botones */}
            <div className="flex flex-col sm:flex-row lg:flex-col gap-2 sm:col-span-2 lg:col-span-1">
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                  <Button
                    className="w-full"
                    disabled={isLoading || apiData.length === 0}
                  >
                    <FileUp className="h-4 w-4" />
                    <span className="ml-2">Reporte</span>
                    <ChevronDown className="h-3 w-3 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem
                    onClick={() => handleDownloadReport("EXCEL")}
                    className="cursor-pointer"
                  >
                    <FileSpreadsheet className="h-4 w-4 mr-2 text-green-600" />
                    <span>Descargar Excel</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleDownloadReport("PDF")}
                    className="cursor-pointer"
                  >
                    <FileText className="h-4 w-4 mr-2 text-red-600" />
                    <span>Descargar PDF</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button variant="outline" onClick={clearFilters} className="w-full">
                <RotateCcw className="h-4 w-4 mr-2" />
                Limpiar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Total */}
      <Card>
        <CardContent className="py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm text-muted-foreground">Total de registros</span>
            <span className="text-xl sm:text-2xl font-bold text-emerald-600">{totals.registros}</span>
          </div>
        </CardContent>
      </Card>

      {/* Tabla */}
      {isMobile ? (
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                <p className="text-sm text-muted-foreground">Cargando datos...</p>
              </div>
            </div>
          ) : apiData.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <div className="flex flex-col items-center gap-3">
                  <div className="rounded-full bg-muted p-3">
                    <Search className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div className="text-center">
                    <h3 className="font-medium text-muted-foreground mb-1">
                      No se encontraron registros
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Intenta ajustar los filtros o cambiar las fechas de búsqueda
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            apiData.map((item) => <MobileCard key={item.id} item={item} />)
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border">
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                  <p className="text-sm text-muted-foreground">Cargando datos...</p>
                </div>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-center whitespace-nowrap">
                      <span className="text-xs font-semibold">Fecha de Ingreso</span>
                    </TableHead>
                    <TableHead className="text-center whitespace-nowrap">
                      <span className="text-xs font-semibold">Transportista</span>
                    </TableHead>
                    <TableHead className="text-center whitespace-nowrap">
                      <span className="text-xs font-semibold">Tipo de Cama</span>
                    </TableHead>
                    <TableHead className="text-center whitespace-nowrap">
                      <span className="text-xs font-semibold">Condiciones de Arribo</span>
                    </TableHead>
                    <TableHead className="text-center whitespace-nowrap">
                      <span className="text-xs font-semibold">Movilización Propia</span>
                    </TableHead>
                    <TableHead className="text-center whitespace-nowrap">
                      <span className="text-xs font-semibold">Observaciones</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {apiData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-12">
                        <div className="flex flex-col items-center gap-3">
                          <div className="rounded-full bg-muted p-3">
                            <Search className="h-6 w-6 text-muted-foreground" />
                          </div>
                          <div className="text-center">
                            <h3 className="font-medium text-muted-foreground mb-1">
                              No se encontraron registros
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              Intenta ajustar los filtros o cambiar las fechas de búsqueda
                            </p>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    apiData.map((item) => (
                      <TableRow key={item.id} className="hover:bg-muted/50 transition-colors">
                        <TableCell className="text-center text-sm">
                          {item.entryDate
                            ? format(parseISO(item.entryDate), "dd/MM/yyyy")
                            : "N/A"}
                        </TableCell>
                        <TableCell className="text-center text-sm font-medium">
                          {item.carrierName || "N/A"}
                        </TableCell>
                        <TableCell className="text-center text-sm">
                          <Badge variant="secondary">{item.bedType || "N/A"}</Badge>
                        </TableCell>
                        <TableCell className="text-center text-sm">
                          <Badge
                            variant="outline"
                            className="bg-blue-50 text-blue-800 border-blue-200"
                          >
                            {item.arrivalConditions || "N/A"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          {item.ownMobilization ? (
                            <div className="flex items-center justify-center">
                              <Check className="h-5 w-5 text-green-600" />
                            </div>
                          ) : (
                            <div className="flex items-center justify-center">
                              <X className="h-5 w-5 text-red-500" />
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-center text-sm max-w-xs truncate">
                          {item.observations || "-"}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default TransportConditionsManagement;
