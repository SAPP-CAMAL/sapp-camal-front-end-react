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
import { Label } from "@/components/ui/label";
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
import { SpeciesMenu } from "./parts/species-menu";
import { StatsCard } from "./parts/stats-card";
import { Species, Specie } from "../domain";
import { getAllSpeciesService } from "../server/db/species.service";
import {
  getListAnimalsByFiltersService,
  getCurrentDate,
} from "../server/db/list-animals-by-filters.service";
import {
  Filter,
  FileUp,
  RotateCcw,
  Search,
  Calendar,
  User,
  Truck,
  Hash,
  CalendarDays,
  Users,
  Badge as BadgeIcon,
} from "lucide-react";
import { format } from "date-fns";
import { useIsMobile } from "@/hooks/use-mobile";
import { DatePicker } from "@/components/ui/date-picker";
import { parseLocalDateString, getLocalDateString } from "@/lib/formatDate";

export function ListAnimalsManagement() {
  const [fechaIngreso, setFechaIngreso] = useState<Date | null>(null);
  const [fechaFaenamiento, setFechaFaenamiento] = useState<Date | null>(null);
  const [availableSpecies, setAvailableSpecies] = useState<Specie[]>([]);
  const [selectedSpecies, setSelectedSpecies] = useState<Species[]>([]);
  const [selectedFinishType, setSelectedFinishType] = useState<number | null>(
    null
  );
  const [marca, setMarca] = useState("");
  const [apiData, setApiData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingSpecies, setIsLoadingSpecies] = useState(true);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(
    null
  );
  const isMobile = useIsMobile();

  // Cargar las especies al montar el componente
  useEffect(() => {
    const loadSpecies = async () => {
      try {
        setIsLoadingSpecies(true);
        const speciesData = await getAllSpeciesService();

        setAvailableSpecies(speciesData);
        // No seleccionar ninguna especie por defecto
        setSelectedSpecies([]);
      } catch (error) {
        console.error("Error cargando especies:", error);
        toast.error("Error al cargar las especies");
      } finally {
        setIsLoadingSpecies(false);
      }
    };

    loadSpecies();
  }, []);

  // Cargar los datos de la API
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        // Preparar los filtros para la API
        const selectedSpecieIds =
          selectedSpecies.length > 0 && availableSpecies.length > 0
            ? availableSpecies
                .filter((specie) =>
                  selectedSpecies.includes(specie.name as Species)
                )
                .map((specie) => specie.id)
            : null;

        const filters = {
          entryDate: fechaIngreso
            ? `${fechaIngreso.getFullYear()}-${String(fechaIngreso.getMonth() + 1).padStart(2, '0')}-${String(fechaIngreso.getDate()).padStart(2, '0')}`
            : getCurrentDate(),
          slaughterDate: fechaFaenamiento
            ? `${fechaFaenamiento.getFullYear()}-${String(fechaFaenamiento.getMonth() + 1).padStart(2, '0')}-${String(fechaFaenamiento.getDate()).padStart(2, '0')}`
            : null,
          idSpecie:
            selectedSpecieIds && selectedSpecieIds.length > 0
              ? selectedSpecieIds[0]
              : null,
          idFinishType: selectedFinishType,
          brandName: marca.trim() || null,
        };

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

    // Solo cargar datos si ya se cargaron las especies
    if (availableSpecies.length > 0) {
      loadData();
    }
  }, [
    fechaIngreso,
    fechaFaenamiento,
    selectedSpecies,
    selectedFinishType,
    marca,
    availableSpecies.length,
  ]);

  // Función para manejar el cambio de especies
  const handleSpeciesChange = useCallback((newSelectedSpecies: Species[]) => {
    setSelectedSpecies(newSelectedSpecies);

    // Reset finish type if PORCINO is not selected
    if (!newSelectedSpecies.includes("PORCINO")) {
      setSelectedFinishType(null);
    }
  }, []);

  // Función de búsqueda con debounce
  const handleMarcaChange = useCallback(
    (value: string) => {
      setMarca(value);

      // Limpiar timeout anterior
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }

      // Nuevo timeout para debounce
      const timeout = setTimeout(() => {
        // La búsqueda se ejecutará automáticamente por el useEffect
      }, 800);

      setSearchTimeout(timeout);
    },
    [searchTimeout]
  );

  // Cleanup del timeout
  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

  const clear = () => {
    setFechaIngreso(null);
    setFechaFaenamiento(null);
    setSelectedSpecies([]);
    setSelectedFinishType(null);
    setMarca("");
  };

  const totals = {
    registros: apiData.length,
    totalEnGuia: apiData.reduce(
      (acc, item) => acc + (item.males || 0) + (item.females || 0),
      0
    ),
    totalFaenamiento: apiData.reduce((acc, item) => {
      const targetDateObj = fechaFaenamiento || new Date();
      const targetDate = getLocalDateString(targetDateObj);

      const itemSlaughterDate = item.slaughterDate ? parseLocalDateString(item.slaughterDate.split('T')[0]) : null;
      const itemSlaughter = itemSlaughterDate
        ? getLocalDateString(itemSlaughterDate)
        : null;

      if (itemSlaughter && itemSlaughter === targetDate) {
        return acc + (item.males || 0) + (item.females || 0);
      }

      return acc;
    }, 0),
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
                {format(new Date(item.createdAt), "dd/LL/yyyy")}
              </div>
              <div className="text-xs text-muted-foreground">
                {format(new Date(item.createdAt), "HH:mm")}
              </div>
            </div>
          </div>
          <Badge variant="outline" className="text-xs">
            CZPM-M: {item.certificate?.code || "N/A"}
          </Badge>
        </div>

        {/* Información principal */}
        <div className="grid grid-cols-1 gap-3">
          {/* Chofer e Introductor */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <div className="flex-1">
                <div className="text-xs text-muted-foreground">Chofer</div>
                <div className="text-sm font-medium">
                  {item.certificate?.shipping?.person?.fullName || "N/A"}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <div className="flex-1">
                <div className="text-xs text-muted-foreground">Introductor</div>
                <div className="text-sm font-medium">
                  {item.brand?.introducer?.user?.person?.fullName || "N/A"}
                </div>
              </div>
            </div>
          </div>

          {/* Vehículo */}
          <div className="flex items-center gap-2">
            <Truck className="h-4 w-4 text-muted-foreground" />
            <div className="flex-1">
              <div className="text-xs text-muted-foreground">Placa</div>
              <div className="text-sm font-medium">
                {item.certificate?.shipping?.vehicle?.plate || "N/A"}
              </div>
            </div>
          </div>

          {/* Fecha de Faenamiento */}
          {item.slaughterDate && (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div className="flex-1">
                <div className="text-xs text-muted-foreground">
                  Fecha de Faenamiento
                </div>
                <div className="text-sm font-medium">
                  {format(parseLocalDateString(item.slaughterDate.split('T')[0]), "dd/LL/yyyy")}
                </div>
              </div>
            </div>
          )}

          {/* Animales */}
          <div className="bg-muted/50 rounded-lg p-3">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <div className="text-xs text-muted-foreground">Machos</div>
                <div className="text-lg font-bold text-blue-600">
                  {item.males || 0}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Hembras</div>
                <div className="text-lg font-bold text-pink-600">
                  {item.females || 0}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Total</div>
                <div className="text-lg font-bold text-emerald-600">
                  {(item.males || 0) + (item.females || 0)}
                </div>
              </div>
            </div>
            <div className="mt-2 pt-2 border-t text-center">
              <div className="text-xs text-muted-foreground">
                Animales en Guía
              </div>
              <div className="text-sm font-semibold">
                {item.certificate?.quantity || 0}
              </div>
            </div>
          </div>

          {/* Especie y Marca */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              {item.species?.name || "N/A"}
            </Badge>
            <Badge className="bg-primary">
              {item.brand?.name || "N/A"}
            </Badge>
          </div>

          {/* Corral */}
          <div className="flex items-center gap-2">
            <Hash className="h-4 w-4 text-muted-foreground" />
            <div className="flex-1">
              <div className="text-xs text-muted-foreground">Corral</div>
              <div className="text-sm font-medium text-emerald-600">
                {item.statusCorrals?.corral?.name || "N/A"}
              </div>
              {item.codes && (
                <div className="text-xs text-muted-foreground mt-1">
                  {item.codes}
                </div>
              )}
            </div>
          </div>

          {/* Observaciones */}
          {item.commentary && (
            <div>
              <div className="text-xs text-muted-foreground">Observaciones</div>
              <div className="text-sm">{item.commentary}</div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-4">
      <section>
        <h1 className="font-semibold text-xl">Lista de Ingreso de Animales</h1>
        <p className="text-sm text-muted-foreground">
          Registro detallado de todos los ingresos de animales al camal
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
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 items-start">
            <div className="flex flex-col gap-1 min-w-0">
              <span className="text-xs text-muted-foreground font-medium">
                Fecha de Ingreso
              </span>
              {/* <div className="relative">
                <Calendar
                  className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10 cursor-pointer"
                  onClick={() => {
                    const input = document.getElementById(
                      "fecha-ingreso"
                    ) as HTMLInputElement;
                    if (input) input.showPicker();
                  }}
                />
                <Input
                  id="fecha-ingreso"
                  type="date"
                  className="w-full bg-muted transition-colors focus:bg-background pl-8 [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-2 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                  value={
                    fechaIngreso
                      ? `${fechaIngreso.getFullYear()}-${String(fechaIngreso.getMonth() + 1).padStart(2, '0')}-${String(fechaIngreso.getDate()).padStart(2, '0')}`
                      : getCurrentDate()
                  }
                  onChange={(e) => {
                    const date = e.target.value
                      ? parseLocalDateString(e.target.value)
                      : null;
                    setFechaIngreso(date);
                  }}
                  title="Selecciona la fecha de ingreso de los animales"
                />
              </div> */}

              <DatePicker
                inputClassName='bg-secondary'
                iconClassName="text-muted-foreground"
                selected={fechaIngreso || new Date()}
                onChange={date => setFechaIngreso(date as Date)}
              />

            </div>
            <div className="flex flex-col gap-1 min-w-0">
              <span className="text-xs text-muted-foreground font-medium">
                Fecha de Faenamiento
              </span>
              {/* <div className="relative">
                <CalendarDays
                  className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10 cursor-pointer"
                  onClick={() => {
                    const input = document.getElementById(
                      "fecha-faenamiento"
                    ) as HTMLInputElement;
                    if (input) input.showPicker();
                  }}
                />
                <Input
                  id="fecha-faenamiento"
                  type="date"
                  className="w-full bg-muted transition-colors focus:bg-background pl-8 [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-2 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                  value={
                    fechaFaenamiento
                      ? `${fechaFaenamiento.getFullYear()}-${String(fechaFaenamiento.getMonth() + 1).padStart(2, '0')}-${String(fechaFaenamiento.getDate()).padStart(2, '0')}`
                      : ""
                  }
                  onChange={(e) => {
                    const date = e.target.value
                      ? parseLocalDateString(e.target.value)
                      : null;
                    setFechaFaenamiento(date);
                  }}
                  title="Selecciona la fecha de faenamiento de los animales"
                />
              </div> */}

              <DatePicker
                inputClassName='bg-secondary'
                selected={fechaFaenamiento}
                onChange={date => setFechaFaenamiento(date as Date)}
                icon={<CalendarDays className="text-muted-foreground" />}
              />
            </div>
            <SpeciesMenu
              className="w-full"
              label="Especies"
              selected={selectedSpecies}
              selectedFinishType={selectedFinishType}
              onSelectSpecies={handleSpeciesChange}
              onSelectFinishType={setSelectedFinishType}
              speciesList={availableSpecies}
            />
            <div className="flex flex-col gap-1 min-w-0">
              <span className="text-xs text-muted-foreground font-medium">
                Buscar Marca
              </span>
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                <Input
                  className="bg-muted w-full transition-colors focus:bg-background pl-8"
                  placeholder="Buscar por marca..."
                  value={marca}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleMarcaChange(e.target.value)
                  }
                  title="Escribe para buscar por marca"
                />
                {isLoading && (
                  <div className="absolute right-2 top-1/2 -translate-y-1/2">
                    <div className="animate-spin rounded-full h-3 w-3 border border-primary border-t-transparent"></div>
                  </div>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-2 lg:items-end lg:justify-end">
              <Button
                className="w-full"
                title="Generar reporte de los registros actuales"
              >
                <FileUp className="h-4 w-4" />
                <span className="ml-2">Reporte</span>
              </Button>
              <Button
                variant="outline"
                onClick={clear}
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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatsCard
          color="orange"
          title="Total Registros"
          value={totals.registros}
        />
        <StatsCard
          color="green"
          title="Total de animales en guía"
          value={totals.totalEnGuia}
        />
        <StatsCard
          color="blue"
          title="Total de Animales dejado en faenamiento"
          value={totals.totalFaenamiento}
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
        // Vista desktop/tablet - Tabla con scroll horizontal mejorado
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
              <Table className="min-w-[1200px]">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-32 whitespace-normal leading-tight text-center sticky left-0  border-r">
                      <span className="block text-xs font-semibold">
                        Fecha y hora
                      </span>
                      <span className="block text-xs font-semibold">
                        de ingreso
                      </span>
                    </TableHead>
                    <TableHead className="w-40 whitespace-normal leading-tight text-center">
                      <span className="block text-xs font-semibold">
                        Nombre del
                      </span>
                      <span className="block text-xs font-semibold">
                        Chofer
                      </span>
                    </TableHead>
                    <TableHead className="w-40 whitespace-normal leading-tight text-center">
                      <span className="block text-xs font-semibold">
                        Nombre del
                      </span>
                      <span className="block text-xs font-semibold">
                        Introductor
                      </span>
                    </TableHead>
                    <TableHead className="w-28 whitespace-normal leading-tight text-center">
                      <span className="block text-xs font-semibold">
                        No. de
                      </span>
                      <span className="block text-xs font-semibold">Placa</span>
                    </TableHead>
                    <TableHead className="w-32 whitespace-normal leading-tight text-center">
                      <span className="block text-xs font-semibold">
                        No. de
                      </span>
                      <span className="block text-xs font-semibold">
                        CZPM-M
                      </span>
                    </TableHead>
                    <TableHead className="w-32 whitespace-normal leading-tight text-center">
                      <span className="block text-xs font-semibold">
                        Fecha de
                      </span>
                      <span className="block text-xs font-semibold">
                        Faenamiento
                      </span>
                    </TableHead>
                    <TableHead className="w-48 text-center whitespace-normal leading-tight align-top border-x">
                      <span className="block text-xs font-semibold">
                        Nro de animales dejado
                      </span>
                      <span className="block text-xs font-semibold">
                        en faenamiento
                      </span>
                      <div className="mt-2 grid grid-cols-3 gap-1 place-items-center text-[10px] border-t pt-1">
                        <span className="font-bold">H</span>
                        <span className="font-bold border-l pl-2">M</span>
                        <span className="font-bold border-l pl-2">TOTAL</span>
                      </div>
                    </TableHead>
                    <TableHead className="w-32 whitespace-normal leading-tight text-center">
                      <span className="block text-xs font-semibold">
                        No. de Animales
                      </span>
                      <span className="block text-xs font-semibold">
                        en Guía
                      </span>
                    </TableHead>
                    <TableHead className="w-28 whitespace-normal text-center">
                      <span className="text-xs font-semibold">Especie</span>
                    </TableHead>
                    <TableHead className="w-40 whitespace-normal leading-tight text-center">
                      <span className="block text-xs font-semibold">
                        Identificación del
                      </span>
                      <span className="block text-xs font-semibold">
                        Usuario al Camal
                      </span>
                    </TableHead>
                    <TableHead className="w-48 whitespace-normal text-center">
                      <span className="text-xs font-semibold">
                        Observaciones
                      </span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {apiData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={11} className="text-center py-12">
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
                        <TableCell className="whitespace-normal text-center sticky left-0 bg-background border-r">
                          <div className="leading-tight">
                            <div className="font-semibold text-sm">
                              {format(new Date(item.createdAt), "dd/LL")}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {format(new Date(item.createdAt), "HH:mm")}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="whitespace-normal text-center text-sm">
                          {item.certificate?.shipping?.person?.fullName ||
                            "N/A"}
                        </TableCell>
                        <TableCell className="whitespace-normal text-center text-sm">
                          {item.brand?.introducer?.user?.person?.fullName ||
                            "N/A"}
                        </TableCell>
                        <TableCell className="whitespace-normal text-center text-sm font-medium">
                          {item.certificate?.shipping?.vehicle?.plate || "N/A"}
                        </TableCell>
                        <TableCell className="whitespace-normal text-center text-sm font-medium">
                          {item.certificate?.code || "N/A"}
                        </TableCell>
                        <TableCell className="whitespace-normal text-center text-sm">
                          {item.slaughterDate
                            ? format(parseLocalDateString(item.slaughterDate.split('T')[0]), "dd/LL")
                            : "-"}
                        </TableCell>
                        <TableCell className="whitespace-normal text-center border-x">
                          <div className="grid grid-cols-3 gap-2 text-center">
                            <div className="font-semibold text-pink-600">
                              {item.females || 0}
                            </div>
                            <div className="border-l font-semibold text-blue-600 pl-2">
                              {item.males || 0}
                            </div>
                            <div className="border-l font-semibold text-primary pl-2">
                              {(item.males || 0) + (item.females || 0)}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-center whitespace-normal font-semibold">
                          {(item.males || 0) + (item.females || 0)}{" "}
                        </TableCell>
                        <TableCell className="text-center whitespace-normal">
                          <Badge
                            variant="secondary"
                            className="bg-blue-100 text-blue-800 border-0 font-normal text-xs"
                          >
                            {item.species?.name || "N/A"}
                          </Badge>
                        </TableCell>
                        <TableCell className="whitespace-normal text-center">
                          <div className="flex flex-col items-center gap-1">
                            <Badge className="bg-primary text-xs">
                              {item.brand?.name || "N/A"}
                            </Badge>
                            <div className="text-xs font-semibold text-primary">
                              {item.statusCorrals?.corral?.name || "N/A"}
                            </div>
                            {item.codes && (
                              <div className="text-[10px] text-muted-foreground">
                                {item.codes}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="whitespace-normal text-center text-sm max-w-48">
                          <div
                            className="truncate"
                            title={item.commentary || ""}
                          >
                            {item.commentary || ""}
                          </div>
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

export default ListAnimalsManagement;
