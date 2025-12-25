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
import { Input } from "@/components/ui/input";
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
  User,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Hash,
  IdCard,
  UserCircle,
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
    page: 1,
    limit: 10,
    startDate: getCurrentDate(),
    endDate: getCurrentDate(),
    idSpecie: null,
    code: "",
    identification: "",
    plate: "",
    fullName: "",
  };

  const [filters, setFilters] = useState<TransportConditionsFilters>(initialFilters);
  const [apiData, setApiData] = useState<any[]>([]);
  const [species, setSpecies] = useState<Specie[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);
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
        const response = await getTransportConditionsService(filters);
        setApiData(response.data);
        setTotalPages(response.totalPages);
        setTotalRecords(response.total);
      } catch (error) {
        console.error("Error cargando datos:", error);
        toast.error("Error al cargar los datos");
        setApiData([]);
        setTotalPages(0);
        setTotalRecords(0);
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

  const handlePageChange = useCallback((newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  }, []);

  const handleLimitChange = useCallback((newLimit: number) => {
    setFilters((prev) => ({ ...prev, limit: newLimit, page: 1 }));
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
      registros: totalRecords,
      totalAnimales: Array.isArray(apiData) 
        ? apiData.reduce((acc, item) => acc + (item.quantity || 0), 0)
        : 0,
    }),
    [apiData, totalRecords]
  );

  // Vista móvil/tablet
  const MobileCard = ({ item }: { item: any }) => (
    <Card className="mb-3 sm:mb-4">
      <CardContent className="p-3 sm:p-4 space-y-2 sm:space-y-3">
        <div className="flex justify-between items-start border-b pb-2 sm:pb-3">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            <div className="font-semibold text-sm">
              {item.issueDate ? format(parseISO(item.issueDate), "dd/MM/yyyy") : "N/A"}
            </div>
          </div>
          <Badge variant="outline" className="text-xs">
            {item.code || "N/A"}
          </Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
          {item.shipping?.person && (
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <div className="flex-1 min-w-0">
                <div className="text-xs text-muted-foreground">Transportista</div>
                <div className="text-sm font-medium truncate">{item.shipping.person.fullName}</div>
                <div className="text-xs text-muted-foreground">CI: {item.shipping.person.identification}</div>
              </div>
            </div>
          )}

          {item.shipping?.vehicle && (
            <div className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-muted-foreground" />
              <div className="flex-1 min-w-0">
                <div className="text-xs text-muted-foreground">Placa</div>
                <div className="text-sm font-medium">{item.shipping.vehicle.plate}</div>
              </div>
            </div>
          )}

          {item.conditionsTransport && item.conditionsTransport.length > 0 && (
            <div className="sm:col-span-2">
              <div className="text-xs text-muted-foreground mb-2">Condiciones de Transporte</div>
              <div className="space-y-2">
                {item.conditionsTransport.map((condition: any, idx: number) => (
                  <div key={idx} className="bg-blue-50 p-2 rounded text-xs space-y-1">
                    <div className="flex justify-between">
                      <span><span className="font-medium">Cama:</span> {condition.bedType?.description || "N/A"}</span>
                      <span>
                        {condition.ownMedium ? (
                          <Badge variant="default" className="bg-green-100 text-green-800 text-xs">
                            <Check className="h-3 w-3 mr-1" /> Medio Propio
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs">
                            <X className="h-3 w-3 mr-1" /> Sin Medio Propio
                          </Badge>
                        )}
                      </span>
                    </div>
                    <div><span className="font-medium">Llegada:</span> {condition.conditionsArrival?.description || "N/A"}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-muted/50 rounded-lg p-2 sm:p-3 sm:col-span-2">
            <div className="grid grid-cols-2 gap-2 text-center">
              <div>
                <div className="text-xs text-muted-foreground">Cantidad</div>
                <div className="text-lg font-bold text-emerald-600">{item.quantity || 0}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Origen</div>
                <div className="text-sm font-medium">{item.origin?.description || item.placeOrigin || "N/A"}</div>
              </div>
            </div>
          </div>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 items-end">
            <div className="flex flex-col gap-1 min-w-0">
              <label className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                <CalendarDays className="h-3.5 w-3.5 text-primary" />
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

            <div className="flex flex-col gap-1 min-w-0">
              <label className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                <CalendarDays className="h-3.5 w-3.5 text-primary" />
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

            <div className="flex flex-col gap-1 min-w-0">
              <label className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                <PawPrint className="h-3.5 w-3.5 text-primary" />
                Especie
              </label>
              <Select
                value={filters.idSpecie?.toString() || ""}
                onValueChange={(value) =>
                  handleFilterChange("idSpecie", value ? parseInt(value) : null)
                }
              >
                <SelectTrigger className="bg-secondary w-full">
                  <SelectValue placeholder="Seleccione una especie" />
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

            <div className="flex flex-col gap-1 min-w-0">
              <label className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                <Hash className="h-3.5 w-3.5 text-primary" />
                Código
              </label>
              <Input
                placeholder="Buscar por código..."
                value={filters.code || ""}
                onChange={(e) => handleFilterChange("code", e.target.value)}
                className="bg-secondary"
              />
            </div>

            <div className="flex flex-col gap-1 min-w-0">
              <label className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                <IdCard className="h-3.5 w-3.5 text-primary" />
                Identificación
              </label>
              <Input
                placeholder="CI del transportista..."
                value={filters.identification || ""}
                onChange={(e) => handleFilterChange("identification", e.target.value)}
                className="bg-secondary"
              />
            </div>

            <div className="flex flex-col gap-1 min-w-0">
              <label className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                <Truck className="h-3.5 w-3.5 text-primary" />
                Placa
              </label>
              <Input
                placeholder="Placa del vehículo..."
                value={filters.plate || ""}
                onChange={(e) => handleFilterChange("plate", e.target.value)}
                className="bg-secondary"
              />
            </div>

            <div className="flex flex-col gap-1 min-w-0">
              <label className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                <UserCircle className="h-3.5 w-3.5 text-primary" />
                Nombre Completo
              </label>
              <Input
                placeholder="Nombre del transportista..."
                value={filters.fullName || ""}
                onChange={(e) => handleFilterChange("fullName", e.target.value)}
                className="bg-secondary"
              />
            </div>

            <div className="flex flex-col sm:flex-row lg:flex-col gap-2 sm:col-span-2 lg:col-span-1">
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                  <Button className="w-full" disabled={isLoading || !Array.isArray(apiData) || apiData.length === 0}>
                    <FileUp className="h-4 w-4" />
                    <span className="ml-2">Reporte</span>
                    <ChevronDown className="h-3 w-3 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem onClick={() => handleDownloadReport("EXCEL")} className="cursor-pointer">
                    <FileSpreadsheet className="h-4 w-4 mr-2 text-primary" />
                    <span>Descargar Excel</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleDownloadReport("PDF")} className="cursor-pointer">
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


      {/* Totales */}
      <Card>
        <CardContent className="py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm text-muted-foreground">Total de animales</span>
            <span className="text-xl sm:text-2xl font-bold text-blue-600">{totals.totalAnimales}</span>
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
          ) : !Array.isArray(apiData) || apiData.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <div className="flex flex-col items-center gap-3">
                  <div className="rounded-full bg-muted p-3">
                    <Search className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div className="text-center">
                    <h3 className="font-medium text-muted-foreground mb-1">No se encontraron registros</h3>
                    <p className="text-sm text-muted-foreground">Intenta ajustar los filtros o cambiar las fechas de búsqueda</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            (Array.isArray(apiData) ? apiData : []).map((item) => <MobileCard key={item.id} item={item} />)
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
              <Table className="min-w-[900px]">
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-center whitespace-nowrap">
                      <span className="text-xs font-semibold">Fecha Emisión</span>
                    </TableHead>
                    <TableHead className="text-center whitespace-nowrap">
                      <span className="text-xs font-semibold">Código</span>
                    </TableHead>
                    <TableHead className="text-center whitespace-nowrap">
                      <span className="text-xs font-semibold">Transportista</span>
                    </TableHead>
                    <TableHead className="text-center whitespace-nowrap">
                      <span className="text-xs font-semibold">CI</span>
                    </TableHead>
                    <TableHead className="text-center whitespace-nowrap">
                      <span className="text-xs font-semibold">Placa</span>
                    </TableHead>
                    <TableHead className="text-center whitespace-nowrap">
                      <span className="text-xs font-semibold">Cantidad</span>
                    </TableHead>
                    <TableHead className="text-center whitespace-nowrap">
                      <span className="text-xs font-semibold">Origen</span>
                    </TableHead>
                    <TableHead className="text-center whitespace-nowrap">
                      <span className="text-xs font-semibold">Condiciones de Transporte</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {!Array.isArray(apiData) || apiData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-12">
                        <div className="flex flex-col items-center gap-3">
                          <div className="rounded-full bg-muted p-3">
                            <Search className="h-6 w-6 text-muted-foreground" />
                          </div>
                          <div className="text-center">
                            <h3 className="font-medium text-muted-foreground mb-1">No se encontraron registros</h3>
                            <p className="text-sm text-muted-foreground">Intenta ajustar los filtros o cambiar las fechas de búsqueda</p>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    (Array.isArray(apiData) ? apiData : []).map((item) => (
                      <TableRow key={item.id} className="hover:bg-muted/50 transition-colors">
                        <TableCell className="text-center text-sm">
                          {item.issueDate ? format(parseISO(item.issueDate), "dd/MM/yyyy") : "N/A"}
                        </TableCell>
                        <TableCell className="text-center text-sm font-medium">{item.code || "N/A"}</TableCell>
                        <TableCell className="text-center text-sm">{item.shipping?.person?.fullName || "N/A"}</TableCell>
                        <TableCell className="text-center text-sm">{item.shipping?.person?.identification || "N/A"}</TableCell>
                        <TableCell className="text-center text-sm font-medium">{item.shipping?.vehicle?.plate || item.plateVehicle || "N/A"}</TableCell>
                        <TableCell className="text-center font-semibold text-emerald-600">{item.quantity || 0}</TableCell>
                        <TableCell className="text-center">
                          <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-0 font-normal text-xs">
                            {item.origin?.description || item.placeOrigin || "N/A"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-left text-xs">
                          {item.conditionsTransport && item.conditionsTransport.length > 0 ? (
                            <div className="space-y-1">
                              {item.conditionsTransport.map((condition: any, idx: number) => (
                                <div key={idx} className="bg-blue-50 p-2 rounded">
                                  <div><span className="font-medium">Cama:</span> {condition.bedType?.description || "N/A"}</div>
                                  <div><span className="font-medium">Llegada:</span> {condition.conditionsArrival?.description || "N/A"}</div>
                                  <div><span className="font-medium">Medio Propio:</span> {condition.ownMedium ? "Sí" : "No"}</div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">Sin condiciones</span>
                          )}
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

      {/* Paginación */}
      {!isLoading && Array.isArray(apiData) && apiData.length > 0 && (
        <Card>
          <CardContent className="py-3 sm:py-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Mostrar</span>
                <Select
                  value={filters.limit.toString()}
                  onValueChange={(value) => handleLimitChange(parseInt(value))}
                >
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-sm text-muted-foreground">registros por página</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  Página {filters.page} de {totalPages || 1} ({totalRecords} total)
                </span>
              </div>

              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handlePageChange(1)}
                  disabled={filters.page === 1}
                  className="h-8 w-8"
                >
                  <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handlePageChange(filters.page - 1)}
                  disabled={filters.page === 1}
                  className="h-8 w-8"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handlePageChange(filters.page + 1)}
                  disabled={filters.page >= totalPages}
                  className="h-8 w-8"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handlePageChange(totalPages)}
                  disabled={filters.page >= totalPages}
                  className="h-8 w-8"
                >
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default TransportConditionsManagement;
