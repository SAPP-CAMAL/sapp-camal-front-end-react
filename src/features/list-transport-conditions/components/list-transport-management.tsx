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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatsCard } from "./parts/stats-card";
import { CertificateFileManager } from "./parts/certificate-file-manager";
import { ListAnimalsFilters } from "../domain/list-animals.interface";
import {
  getListAnimalsByFiltersService,
  getCurrentDate,
} from "../server/db/list-animals-by-filters.service";
import {
  Filter,
  FileUp,
  RotateCcw,
  Calendar,
  User,
  Truck,
  Hash,
  CalendarDays,
  Badge as BadgeIcon,
  Search,
  ChevronDown,
  FileSpreadsheet,
  FileText,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { useIsMobile } from "@/hooks/use-mobile";
import { DatePicker } from "@/components/ui/date-picker";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { downloadConditionTransportByFilters } from "../utils/downloadConditionTransportByFilters";

export function ListTransportManagement() {
  // Estado inicial de los filtros
  const initialFilters: ListAnimalsFilters = {
    entryDate: getCurrentDate(),
    code: null,
    fullName: null,
    identification: null,
    plate: null,
  };

  const [filters, setFilters] = useState<ListAnimalsFilters>(initialFilters);
  const [apiData, setApiData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(
    null
  );
  const isMobile = useIsMobile();

  // Estado local para los valores de los inputs (para escritura fluida)
  const [inputValues, setInputValues] = useState({
    code: "",
    fullName: "",
    identification: "",
    plate: "",
  });

  // Función para manejar cambios en los filtros
  const handleFilterChange = useCallback(
    (name: keyof ListAnimalsFilters, value: string) => {
      setFilters((prev) => ({
        ...prev,
        [name]: value || null,
      }));
    },
    []
  );

  // Cargar los datos de la API
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);

        const data = await getListAnimalsByFiltersService(filters);

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

  // Recargar datos cuando se actualiza un archivo
  const handleFileChange = useCallback(() => {
    const loadData = async () => {
      try {
        const data = await getListAnimalsByFiltersService(filters);
        setApiData(data);
        toast.success("Datos actualizados");
      } catch (error) {
        console.error("Error recargando datos:", error);
      }
    };
    loadData();
  }, [filters]);

  // Función de búsqueda con debounce
  const handleSearch = useCallback(
    (value: string, field: keyof ListAnimalsFilters) => {
      // Actualizar el valor del input inmediatamente para escritura fluida
      setInputValues(prev => ({
        ...prev,
        [field]: value
      }));

      // Limpiar timeout anterior
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }

      // Nuevo timeout para debounce - actualizar filtros después de 500ms
      const timeout = setTimeout(() => {
        handleFilterChange(field, value);
      }, 500);

      setSearchTimeout(timeout);
    },
    [searchTimeout, handleFilterChange]
  );

  // Cleanup del timeout
  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

  // Función para limpiar los filtros
  const clearFilters = useCallback(() => {
    setFilters(initialFilters);
    setInputValues({
      code: "",
      fullName: "",
      identification: "",
      plate: "",
    });
  }, [initialFilters]);

  const totals = useMemo(
    () => ({
      registros: apiData.length,
      totalCertificados: apiData.reduce(
        (acc, item) => acc + (item.quantity || 0),
        0
      ),
    }),
    [apiData]
  );

    const handleDownloadReport = async (type: 'EXCEL' | 'PDF') => {
      toast.promise(
        downloadConditionTransportByFilters(filters, type),
        {
          loading: 'Generando reporte...',
          success: `Reporte ${type} descargado correctamente`,
          error: 'Error al descargar el reporte',
        }
      );
    };

  // Componente para mostrar los datos en formato de tarjeta (móvil)
  const MobileCard = ({ item }: { item: any }) => (
    <Card className="mb-4">
      <CardContent className="p-4 space-y-3">
        {/* Header con fecha y CZPM-M */}
        <div className="flex justify-between items-start border-b pb-3">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
            <div>
              <div className="font-semibold text-sm">
                {format(parseISO(item.issueDate as string), 'dd/MM/yyyy')}
              </div>
            </div>
          </div>
          <Badge variant="outline" className="text-xs">
            CZPM-M: {item.code || "N/A"}
          </Badge>
        </div>

        {/* Información principal */}
        <div className="grid grid-cols-1 gap-3">
          {/* Chofer */}
          {item.shipping?.person && (
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <div className="flex-1">
                <div className="text-xs text-muted-foreground">Chofer</div>
                <div className="text-sm font-medium">
                  {item.shipping.person.fullName}
                </div>
                <div className="text-xs text-muted-foreground">
                  CI: {item.shipping.person.identification}
                </div>
              </div>
            </div>
          )}

          {/* Vehículo */}
          {item.shipping?.vehicle && (
            <div className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-muted-foreground" />
              <div className="flex-1">
                <div className="text-xs text-muted-foreground">Placa</div>
                <div className="text-sm font-medium">
                  {item.shipping.vehicle.plate}
                </div>
              </div>
            </div>
          )}

          {/* Cantidad y Origen */}
          <div className="bg-muted/50 rounded-lg p-3">
            <div className="grid grid-cols-2 gap-2 text-center">
              <div>
                <div className="text-xs text-muted-foreground">Cantidad</div>
                <div className="text-lg font-bold text-emerald-600">
                  {item.quantity || 0}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Origen</div>
                <div className="text-sm font-medium">
                  {item.origin?.description || "N/A"}
                </div>
              </div>
            </div>
          </div>

          {/* Condiciones de Transporte */}
          {item.conditionsTransport && item.conditionsTransport.length > 0 && (
            <div>
              <div className="text-xs text-muted-foreground mb-2">
                Condiciones de Transporte
              </div>
              <div className="space-y-2">
                {item.conditionsTransport.map((condition: any, idx: number) => (
                  <div
                    key={idx}
                    className="bg-blue-50 p-2 rounded text-xs space-y-1"
                  >
                    <div>
                      <span className="font-medium">Cama:</span>{" "}
                      {condition.bedType?.description || "N/A"}
                    </div>
                    <div>
                      <span className="font-medium">Llegada:</span>{" "}
                      {condition.conditionsArrival?.description || "N/A"}
                    </div>
                    <div>
                      <span className="font-medium">Medio Propio:</span>{" "}
                      {condition.ownMedium ? "Sí" : "No"}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Lugar de Origen */}
          {item.placeOrigin && item.placeOrigin !== "N/A" && (
            <div>
              <div className="text-xs text-muted-foreground">
                Lugar de Origen
              </div>
              <div className="text-sm">{item.placeOrigin}</div>
            </div>
          )}

          {/* Guías */}
          <div>
            <div className="text-xs text-muted-foreground mb-2">Guías</div>
            <CertificateFileManager
              certificateId={item.id}
              issueDate={item.issueDate}
              fileUrl={item.urlFile}
              onFileChange={handleFileChange}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-4">
      <section>
        <h1 className="font-semibold text-xl">
          Lista de Condiciones de Transporte
        </h1>
        <p className="text-sm text-muted-foreground">
          Registro detallado de certificados y condiciones de transporte de
          animales
        </p>
      </section>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground opacity-50" />
            Filtros
          </CardTitle>
          <CardDescription>
            Filtra los registros según tus necesidades
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 items-end">
            {/* Fecha de Ingreso */}
            <div className="flex flex-col gap-1 min-w-0">
              <label
                htmlFor="entryDate"
                className="text-xs text-muted-foreground font-medium"
              >
                Fecha de Ingreso
              </label>
              {/* <div className="relative">
                <Calendar
                  className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10 cursor-pointer"
                  onClick={() => {
                    const input = document.getElementById(
                      "entryDate"
                    ) as HTMLInputElement;
                    if (input) input.showPicker();
                  }}
                />
                <Input
                  id="entryDate"
                  type="date"
                  className="w-full bg-muted transition-colors focus:bg-background pl-8 [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-2 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                  value={filters.entryDate}
                  onChange={(e) => handleFilterChange("entryDate", e.target.value)}
                  title="Selecciona la fecha de ingreso de los animales"
                />
              </div> */}

              <DatePicker
               inputClassName='bg-secondary'
               iconClassName='text-muted-foreground'
               dateFormat='dd/MM/yyyy'
               selected={parseISO(filters.entryDate)}
               onChange={date => {
                 if (!date) return;
                 const formattedDate = format(date, 'yyyy-MM-dd');
                 handleFilterChange("entryDate", formattedDate);
               }}
              />
            </div>

            {/* Código */}
            <div className="flex flex-col gap-1 min-w-0">
              <label
                htmlFor="code"
                className="text-xs text-muted-foreground font-medium"
              >
                Código CZPM-M
              </label>
              <div className="relative">
                <Hash className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="code"
                  type="text"
                  className="w-full bg-muted transition-colors focus:bg-background pl-8"
                  value={inputValues.code}
                  onChange={(e) => handleSearch(e.target.value, "code")}
                  placeholder="Buscar por código..."
                />
              </div>
            </div>

            {/* Nombre Completo */}
            <div className="flex flex-col gap-1 min-w-0">
              <label
                htmlFor="fullName"
                className="text-xs text-muted-foreground font-medium"
              >
                Nombre del Chofer
              </label>
              <div className="relative">
                <User className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="fullName"
                  type="text"
                  className="w-full bg-muted transition-colors focus:bg-background pl-8"
                  value={inputValues.fullName}
                  onChange={(e) => handleSearch(e.target.value, "fullName")}
                  placeholder="Buscar por nombre..."
                />
              </div>
            </div>

            {/* Identificación */}
            <div className="flex flex-col gap-1 min-w-0">
              <label
                htmlFor="identification"
                className="text-xs text-muted-foreground font-medium"
              >
                Identificación
              </label>
              <div className="relative">
                <BadgeIcon className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="identification"
                  type="text"
                  className="w-full bg-muted transition-colors focus:bg-background pl-8"
                  value={inputValues.identification}
                  onChange={(e) => handleSearch(e.target.value, "identification")}
                  placeholder="Buscar por CI..."
                />
              </div>
            </div>

            {/* Placa */}
            <div className="flex flex-col gap-1 min-w-0">
              <label
                htmlFor="plate"
                className="text-xs text-muted-foreground font-medium"
              >
                Placa
              </label>
              <div className="relative">
                <Truck className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="plate"
                  type="text"
                  className="w-full bg-muted transition-colors focus:bg-background pl-8"
                  value={inputValues.plate}
                  onChange={(e) => handleSearch(e.target.value, "plate")}
                  placeholder="Buscar por placa..."
                />
              </div>
            </div>

            {/* Botones */}
            <div className="flex flex-col gap-2">

              <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                  <Button
                    className="w-full"
                    title="Generar reporte de los registros actuales"
                    disabled={isLoading || apiData.length === 0}
                  >
                    <FileUp className="h-4 w-4" />
                    <span className="ml-2">Reporte</span>
                    <ChevronDown className="h-3 w-3 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-56"
                  sideOffset={5}
                  alignOffset={0}
                >
                  <DropdownMenuItem
                    onClick={() => handleDownloadReport('EXCEL')}
                    className="cursor-pointer"
                  >
                    <FileSpreadsheet className="h-4 w-4 mr-2 text-green-600" />
                    <span>Descargar Excel</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleDownloadReport('PDF')}
                    className="cursor-pointer"
                  >
                    <FileText className="h-4 w-4 mr-2 text-red-600" />
                    <span>Descargar PDF</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                variant="outline"
                onClick={clearFilters}
                className="w-full"
                title="Limpiar todos los filtros y volver a la vista inicial"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Limpiar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Totales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatsCard
          color="orange"
          title="Total Registros"
          value={totals.registros}
        />
        <StatsCard
          color="green"
          title="Total de Animales en Certificados"
          value={totals.totalCertificados}
        />
      </div>

      {/* Tabla */}
      {isMobile ? (
        // Vista móvil - Tarjetas
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                <p className="text-sm text-muted-foreground">
                  Cargando datos...
                </p>
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
                      Intenta ajustar los filtros o cambiar las fechas de
                      búsqueda
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
        // Vista desktop/tablet - Tabla
        <div className="overflow-hidden rounded-lg border">
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                  <p className="text-sm text-muted-foreground">
                    Cargando datos...
                  </p>
                </div>
              </div>
            ) : (
              <Table className="min-w-[1000px]">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-32 whitespace-normal leading-tight text-center">
                      <span className="block text-xs font-semibold">
                        Fecha Emisión
                      </span>
                    </TableHead>
                    <TableHead className="w-32 whitespace-normal leading-tight text-center">
                      <span className="block text-xs font-semibold">CZPM-M</span>
                    </TableHead>
                    <TableHead className="w-40 whitespace-normal leading-tight text-center">
                      <span className="block text-xs font-semibold">
                        Chofer
                      </span>
                    </TableHead>
                    <TableHead className="w-32 whitespace-normal leading-tight text-center">
                      <span className="block text-xs font-semibold">CI</span>
                    </TableHead>
                    <TableHead className="w-28 whitespace-normal leading-tight text-center">
                      <span className="block text-xs font-semibold">Placa</span>
                    </TableHead>
                    <TableHead className="w-24 whitespace-normal leading-tight text-center">
                      <span className="block text-xs font-semibold">
                        Cantidad
                      </span>
                    </TableHead>
                    <TableHead className="w-28 whitespace-normal text-center">
                      <span className="text-xs font-semibold">Origen</span>
                    </TableHead>
                    <TableHead className="w-48 whitespace-normal text-center">
                      <span className="text-xs font-semibold">
                        Condiciones de Transporte
                      </span>
                    </TableHead>
                    <TableHead className="w-32 whitespace-normal text-center">
                      <span className="text-xs font-semibold">Guías</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {apiData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-12">
                        <div className="flex flex-col items-center gap-3">
                          <div className="rounded-full bg-muted p-3">
                            <Search className="h-6 w-6 text-muted-foreground" />
                          </div>
                          <div className="text-center">
                            <h3 className="font-medium text-muted-foreground mb-1">
                              No se encontraron registros
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              Intenta ajustar los filtros o cambiar las fechas
                              de búsqueda
                            </p>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    apiData.map((item) => (
                      <TableRow
                        key={item.id}
                        className="hover:bg-muted/50 transition-colors"
                      >
                        <TableCell className="whitespace-normal text-center text-sm">
                          {item.issueDate
                            ?  format(parseISO(item.issueDate as string), 'dd/MM/yyyy')
                            : "N/A"}
                        </TableCell>
                        <TableCell className="whitespace-normal text-center text-sm font-medium">
                          {item.code || "N/A"}
                        </TableCell>
                        <TableCell className="whitespace-normal text-center text-sm">
                          {item.shipping?.person?.fullName || "N/A"}
                        </TableCell>
                        <TableCell className="whitespace-normal text-center text-sm">
                          {item.shipping?.person?.identification || "N/A"}
                        </TableCell>
                        <TableCell className="whitespace-normal text-center text-sm font-medium">
                          {item.shipping?.vehicle?.plate ||
                            item.plateVehicle ||
                            "N/A"}
                        </TableCell>
                        <TableCell className="text-center whitespace-normal font-semibold text-emerald-600">
                          {item.quantity || 0}
                        </TableCell>
                        <TableCell className="text-center whitespace-normal">
                          <Badge
                            variant="secondary"
                            className="bg-blue-100 text-blue-800 border-0 font-normal text-xs"
                          >
                            {item.origin?.description || "N/A"}
                          </Badge>
                        </TableCell>
                        <TableCell className="whitespace-normal text-left text-xs">
                          {item.conditionsTransport &&
                          item.conditionsTransport.length > 0 ? (
                            <div className="space-y-1">
                              {item.conditionsTransport.map(
                                (condition: any, idx: number) => (
                                  <div
                                    key={idx}
                                    className="bg-blue-50 p-2 rounded"
                                  >
                                    <div>
                                      <span className="font-medium">Cama:</span>{" "}
                                      {condition.bedType?.description || "N/A"}
                                    </div>
                                    <div>
                                      <span className="font-medium">
                                        Llegada:
                                      </span>{" "}
                                      {condition.conditionsArrival
                                        ?.description || "N/A"}
                                    </div>
                                    <div>
                                      <span className="font-medium">
                                        Medio Propio:
                                      </span>{" "}
                                      {condition.ownMedium ? "Sí" : "No"}
                                    </div>
                                  </div>
                                )
                              )}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">
                              Sin condiciones
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          <CertificateFileManager
                            certificateId={item.id}
                            issueDate={item.issueDate}
                            fileUrl={item.urlFile}
                            onFileChange={handleFileChange}
                          />
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

export default ListTransportManagement;
