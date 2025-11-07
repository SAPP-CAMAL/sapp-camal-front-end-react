"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { format, parseISO } from "date-fns";
import { Label } from "@/components/ui/label";
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
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  CalendarIcon,
  Download,
  Settings,
  ChevronDown,
  BookText,
} from "lucide-react";
import { useState } from "react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { AnimalSelectionModal } from "./animal-selection-modal";
import { DatePicker } from "@/components/ui/date-picker";
import { TotalConfiscationModal } from "./total-confiscation-modal";
import { PartialConfiscationModal } from "./partial-confiscation-modal";
import { DynamicTableHeaders } from "./dynamic-table-headers";
import { CorralTypeFilters } from "./corral-type-filters";
import { useLines } from "../hooks/use-lines";
import { useSpeciesDisease } from "../hooks/use-species-disease";
import { usePostmortemByFilters } from "../hooks/use-postmortem-by-filters";
import { useCertificates } from "../hooks/use-certificates";
import { groupDiseasesByProduct } from "../server/db/species-disease.service";
import { getIntroductoresFromCertificates } from "../server/db/certificates.service";
import {
  countAnimalsWithDisease,
  countAnimalsWithTotalConfiscation,
  countAnimalsWithPartialConfiscation,
  getIntroductorIdsWithPostmortem,
  getLocalDateString,
} from "../utils/postmortem-helpers";
import type {
  Introductor,
  IntroductorRow,
  ModalState,
  ColumnConfig,
} from "../domain/postmortem.types";
import type {
  CorralTypeFilter,
  GetCertificatesRequest,
} from "../domain/certificates.types";
import type { GetPostmortemByFiltersRequest } from "../domain/save-postmortem.types";
import { useMemo, useEffect } from "react";

export function PostmortemManagement() {
  const [rows, setRows] = useState<IntroductorRow[]>([
    { id: "row-1", introductor: null, values: Array(50).fill(0) }, // Inicializar con más columnas
  ]);

  const [openPopover, setOpenPopover] = useState<string | null>(null);
  const [selectedLineId, setSelectedLineId] = useState<string>("");
  const [selectedSpecieId, setSelectedSpecieId] = useState<number | null>(4); // Bovinos por defecto (idSpecie = 4)
  const [slaughterDate, setSlaughterDate] = useState<string>(
    getLocalDateString() // Usar función que maneja zona horaria local correctamente
  );
  const [corralTypeFilter, setCorralTypeFilter] =
    useState<CorralTypeFilter>("TODOS");

  const [modalState, setModalState] = useState<ModalState>({
    isOpen: false,
    rowId: null,
    columnIndex: null,
    localizacion: "",
    patologia: "",
  });

  const [totalConfiscationModalState, setTotalConfiscationModalState] =
    useState({
      isOpen: false,
      rowId: null as string | null,
    });

  const [partialConfiscationModalState, setPartialConfiscationModalState] =
    useState({
      isOpen: false,
      rowId: null as string | null,
    });

  // Construir request para certificados
  const certificatesRequest: GetCertificatesRequest | null = useMemo(() => {
    if (!selectedSpecieId || !slaughterDate) return null;

    const request: GetCertificatesRequest = {
      slaughterDate,
      idSpecies: selectedSpecieId,
    };

    if (corralTypeFilter === "NORMAL") {
      request.type = "NOR";
    } else if (corralTypeFilter === "EMERGENCIA") {
      request.type = "EME";
    }

    return request;
  }, [selectedSpecieId, slaughterDate, corralTypeFilter]);

  // Obtener líneas desde la API
  const { data: lines, isLoading: isLoadingLines } = useLines();

  // Seleccionar Bovinos por defecto cuando se carguen las líneas
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

  // Obtener enfermedades por especie
  const { data: speciesDiseaseData, isLoading: isLoadingDiseases } =
    useSpeciesDisease(selectedSpecieId);

  // Obtener certificados y marcas
  const { data: certificatesData, isLoading: isLoadingCertificates } =
    useCertificates(certificatesRequest);

  // Obtener datos de postmortem guardados
  const postmortemFiltersRequest = useMemo(() => {
    if (!selectedSpecieId || !slaughterDate) return null;

    const request: GetPostmortemByFiltersRequest = {
      slaughterDate,
      idSpecies: selectedSpecieId,
    };

    // Agregar filtro de tipo de corral si aplica
    if (corralTypeFilter === "EMERGENCIA") {
      request.type = "EME";
    }

    return request;
  }, [selectedSpecieId, slaughterDate, corralTypeFilter]);

  const { data: postmortemData } = usePostmortemByFilters(
    postmortemFiltersRequest
  );

  // Obtener introductores desde los certificados
  const introductores = useMemo(() => {
    if (!certificatesData?.data) return [];
    return getIntroductoresFromCertificates(certificatesData.data);
  }, [certificatesData]);

  // Calcular contadores para los filtros
  const filterCounts = useMemo(() => {
    if (!certificatesData?.data) {
      return { todos: 0, normal: 0, emergencia: 0 };
    }

    const normal = certificatesData.data.filter(
      (cert) => cert.corralType.code === "NOR"
    ).length;
    const emergencia = certificatesData.data.filter(
      (cert) => cert.corralType.code === "EME"
    ).length;

    return {
      todos: certificatesData.data.length,
      normal,
      emergencia,
    };
  }, [certificatesData]);

  // Agrupar enfermedades por producto
  const groupedColumns = useMemo(() => {
    if (!speciesDiseaseData?.data) return [];
    return groupDiseasesByProduct(speciesDiseaseData.data);
  }, [speciesDiseaseData]);

  // Generar configuración de columnas dinámicamente
  const dynamicColumnConfig = useMemo(() => {
    const config: ColumnConfig[] = [];
    groupedColumns.forEach((group) => {
      group.diseases.forEach((disease) => {
        config.push({
          localizacion: group.product,
          patologia: disease.name,
          idSpeciesDisease: disease.id, // Agregar el ID de la enfermedad
        });
      });
    });
    return config;
  }, [groupedColumns]);

  // Actualizar filas cuando cambia la configuración de columnas
  // +3 para TOTAL, Decomiso Total y Decomiso Parcial
  useMemo(() => {
    if (dynamicColumnConfig.length > 0) {
      setRows((prev) =>
        prev.map((row) => ({
          ...row,
          values: Array(dynamicColumnConfig.length + 3).fill(0),
        }))
      );
    }
  }, [dynamicColumnConfig.length]);

  // Pre-cargar filas con introductores que tienen datos de postmortem
  useEffect(() => {
    // Si no hay configuración de columnas, no hacer nada
    if (dynamicColumnConfig.length === 0) return;

    // Si no hay introductores disponibles, mostrar fila vacía
    if (introductores.length === 0) {
      setRows([
        {
          id: "row-1",
          introductor: null,
          values: Array(dynamicColumnConfig.length + 3).fill(0),
        },
      ]);
      return;
    }

    // Obtener IDs de introductores con datos de postmortem
    const introductorIdsWithData = getIntroductorIdsWithPostmortem(
      postmortemData?.data
    );

    // Si no hay datos de postmortem, mostrar fila vacía
    if (introductorIdsWithData.length === 0) {
      setRows([
        {
          id: "row-1",
          introductor: null,
          values: Array(dynamicColumnConfig.length + 3).fill(0),
        },
      ]);
      return;
    }

    // Filtrar solo los introductores que están en la lista actual (según filtro de tipo)
    const filteredIntroductorIds = introductorIdsWithData.filter((certId) =>
      introductores.some((intro) => intro.certId === certId)
    );

    // Si después de filtrar no hay coincidencias, mostrar fila vacía
    if (filteredIntroductorIds.length === 0) {
      setRows([
        {
          id: "row-1",
          introductor: null,
          values: Array(dynamicColumnConfig.length + 3).fill(0),
        },
      ]);
      return;
    }

    // Crear filas con los introductores que tienen datos
    const newRows: IntroductorRow[] = filteredIntroductorIds.map(
      (certId, index) => {
        const introductor = introductores.find(
          (intro) => intro.certId === certId
        );
        return {
          id: `row-${index + 1}`,
          introductor: introductor || null,
          values: Array(dynamicColumnConfig.length + 3).fill(0),
        };
      }
    );

    // Agregar una fila vacía al final
    newRows.push({
      id: `row-${newRows.length + 1}`,
      introductor: null,
      values: Array(dynamicColumnConfig.length + 3).fill(0),
    });

    setRows(newRows);
  }, [postmortemData, introductores, dynamicColumnConfig.length]);

  const handleIntroductorSelect = (rowId: string, introductor: Introductor) => {
    setRows((prev) => {
      // Verificar si el introductor ya está seleccionado en otra fila
      const isAlreadySelected = prev.some(
        (row) =>
          row.id !== rowId && row.introductor?.certId === introductor.certId
      );

      // Si ya está seleccionado, no hacer nada
      if (isAlreadySelected) {
        return prev;
      }

      const updatedRows = prev.map((row) =>
        row.id === rowId ? { ...row, introductor } : row
      );

      // Verificar si todas las filas tienen un introductor seleccionado
      const allRowsHaveIntroductor = updatedRows.every(
        (row) => row.introductor !== null
      );

      // Si todas las filas tienen introductor, agregar una nueva fila vacía
      if (allRowsHaveIntroductor) {
        const newRowId = `row-${updatedRows.length + 1}`;
        const columnCount = (dynamicColumnConfig.length || 19) + 3; // +3 para TOTAL y PRODUCTOS
        updatedRows.push({
          id: newRowId,
          introductor: null,
          values: Array(columnCount).fill(0),
        });
      }

      return updatedRows;
    });
    setOpenPopover(null);
  };

  const handleCellClick = (
    rowId: string,
    columnIndex: number,
    columnType: "disease" | "total-confiscation" | "partial-confiscation"
  ) => {
    const row = rows.find((r) => r.id === rowId);
    if (!row || !row.introductor) return;

    if (columnType === "total-confiscation") {
      setTotalConfiscationModalState({
        isOpen: true,
        rowId,
      });
      return;
    }

    if (columnType === "partial-confiscation") {
      setPartialConfiscationModalState({
        isOpen: true,
        rowId,
      });
      return;
    }

    // Para columnas de enfermedades
    const config = dynamicColumnConfig[columnIndex];
    if (!config || config.isTotal) return;

    setModalState({
      isOpen: true,
      rowId,
      columnIndex,
      localizacion: config.localizacion,
      patologia: config.patologia,
      idSpeciesDisease: config.idSpeciesDisease,
    });
  };

  const handleSaveAnimals = (selectedCount: number) => {
    if (modalState.rowId !== null && modalState.columnIndex !== null) {
      setRows((prev) =>
        prev.map((row) =>
          row.id === modalState.rowId
            ? {
                ...row,
                values: row.values.map((v, i) =>
                  i === modalState.columnIndex ? selectedCount : v
                ),
              }
            : row
        )
      );
    }
  };

  const handleCloseModal = () => {
    setModalState({
      isOpen: false,
      rowId: null,
      columnIndex: null,
      localizacion: "",
      patologia: "",
    });
  };

  const currentIntroductor = modalState.rowId
    ? rows.find((r) => r.id === modalState.rowId)?.introductor
    : null;

  const totalConfiscationIntroductor = totalConfiscationModalState.rowId
    ? rows.find((r) => r.id === totalConfiscationModalState.rowId)?.introductor
    : null;

  const partialConfiscationIntroductor = partialConfiscationModalState.rowId
    ? rows.find((r) => r.id === partialConfiscationModalState.rowId)
        ?.introductor
    : null;

  return (
    <div className="space-y-4 p-4">
      <div className="text-center">
        <h1 className="text-xl font-semibold">
          Inspección Postmortem Agrocalidad (Decomisos)
        </h1>
        <p className="text-muted-foreground text-sm">
          Sistema de registro de decomisos por patologías
        </p>
      </div>

      {/* Filtros */}
      <Card className="p-3 sm:p-4">
        <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 justify-start">
            <Label className="sm:min-w-34 text-sm">Fecha de Inspección</Label>
            {/* <div className="relative w-full sm:w-[200px]">
              <CalendarIcon
                className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10 cursor-pointer"
                onClick={() => {
                  const input = document.getElementById(
                    "fecha-postmortem"
                  ) as HTMLInputElement;
                  if (input) input.showPicker();
                }}
              />
              <Input
                id="fecha-postmortem"
                type="date"
                className="w-full bg-white transition-colors focus:bg-white pl-8 [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-2 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                value={slaughterDate}
                onChange={(e) => setSlaughterDate(e.target.value)}
              />
            </div> */}

            <DatePicker
						  inputClassName='bg-secondary'
						  selected={parseISO(slaughterDate)}
						  onChange={date => {
						  	if (!date) return;
						  	const formattedDate = format(date, 'yyyy-MM-dd');
						  	setSlaughterDate(formattedDate);
						  }}
					  />

          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
            <Label className="sm:min-w-34 inline-flex text-sm">
              Línea de Producción
            </Label>
            <Select
              value={selectedLineId}
              onValueChange={(value) => {
                setSelectedLineId(value);
                const selectedLine = lines?.find(
                  (line) => line.id.toString() === value
                );
                if (selectedLine) {
                  setSelectedSpecieId(selectedLine.idSpecie);
                }
              }}
              disabled={isLoadingLines}
            >
              <SelectTrigger className="w-full sm:max-w-64">
                <SelectValue placeholder="Selecciona una línea" />
              </SelectTrigger>
              <SelectContent>
                {isLoadingLines ? (
                  <SelectItem value="loading" disabled>
                    Cargando líneas...
                  </SelectItem>
                ) : lines && lines.length > 0 ? (
                  lines.map((line) => (
                    <SelectItem key={line.id} value={line.id.toString()}>
                      {line.description}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-lines" disabled>
                    No hay líneas disponibles
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Tabla de Decomisos */}
      <Card className="p-2 sm:p-4">
        <div className="mb-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <BookText className="h-4 w-4 text-primary flex-shrink-0" />
            <h2 className="text-sm sm:text-base font-medium">
              Registro de Decomisos por Patologías
            </h2>
          </div>
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <Popover
              open={openPopover === "add-new"}
              onOpenChange={(open) => setOpenPopover(open ? "add-new" : null)}
            >
              <PopoverTrigger asChild>
                <Button
                  variant="default"
                  size="sm"
                  className="bg-teal-600 hover:bg-teal-700 text-white flex-1 sm:flex-none"
                >
                  <ChevronDown className="h-4 w-4 mr-1" />
                  Agregar Introductor
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[90vw] sm:w-[400px] p-0" align="end">
                <Command shouldFilter={true}>
                  <CommandInput
                    placeholder="Buscar por nombre o marca..."
                    className="h-9"
                  />
                  <CommandList>
                    <CommandEmpty>
                      No se encontraron introductores.
                    </CommandEmpty>
                    <CommandGroup>
                      {introductores.map((intro) => {
                        // Verificar si este introductor ya está seleccionado en alguna fila
                        const isAlreadySelected = rows.some(
                          (r) => r.introductor?.certId === intro.certId
                        );

                        return (
                          <CommandItem
                            key={intro.id}
                            value={`${intro.nombre} ${intro.marca} ${intro.certificado}`}
                            onSelect={() => {
                              if (!isAlreadySelected) {
                                // Encontrar la primera fila vacía
                                const firstEmptyRowIndex = rows.findIndex(
                                  (r) => r.introductor === null
                                );

                                const newRowId = `row-${Date.now()}`;
                                const newRow = {
                                  id: newRowId,
                                  introductor: intro,
                                  values: Array(
                                    dynamicColumnConfig.length + 3
                                  ).fill(0),
                                };

                                if (firstEmptyRowIndex !== -1) {
                                  // Insertar antes de la primera fila vacía
                                  setRows((prev) => [
                                    ...prev.slice(0, firstEmptyRowIndex),
                                    newRow,
                                    ...prev.slice(firstEmptyRowIndex),
                                  ]);
                                } else {
                                  // No hay filas vacías, agregar al final
                                  setRows((prev) => [...prev, newRow]);
                                }
                                setOpenPopover(null);
                              }
                            }}
                            disabled={isAlreadySelected}
                            className={`flex flex-col items-start py-3 ${
                              isAlreadySelected
                                ? "opacity-50 cursor-not-allowed"
                                : ""
                            }`}
                          >
                            <div className="font-medium">
                              {intro.nombre}

                            </div>
                            <div className="text-xs text-muted-foreground">
                              Marca: {intro.marca} | Cert: {intro.certificado} |
                              Animales: {intro.animales}
                            </div>
                          </CommandItem>
                        );
                      })}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            <Button
              variant="outline"
              size="sm"
              className="text-teal-600 border-teal-600 bg-white hover:bg-teal-50 hidden sm:flex"
            >
              <Settings className="h-4 w-4 mr-1" />
              <span className="hidden lg:inline">Configuración</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-teal-600 border-teal-600 bg-white hover:bg-teal-50 flex-1 sm:flex-none"
            >
              <Download className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Reportes</span>
            </Button>
          </div>
        </div>

        {/* Filtros de tipo de corral */}
        <CorralTypeFilters
          selectedFilter={corralTypeFilter}
          onFilterChange={setCorralTypeFilter}
          counts={filterCounts}
        />

        {/* Mostrar loader mientras se cargan los datos */}
        {isLoadingCertificates || isLoadingDiseases ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <div className="relative">
              <div className="h-12 w-12 rounded-full border-4 border-gray-200"></div>
              <div className="absolute top-0 left-0 h-12 w-12 rounded-full border-4 border-teal-600 border-t-transparent animate-spin"></div>
            </div>
            <p className="text-sm text-gray-600">Cargando datos...</p>
          </div>
        ) : (
          <div className="overflow-x-auto border rounded-lg bg-white -mx-2 sm:mx-0">
            <Table className="min-w-[1200px] bg-white text-xs sm:text-sm">
              <TableHeader className="sticky top-0 [&_th]:!text-gray-900">
                <DynamicTableHeaders
                  groupedColumns={groupedColumns}
                  isLoading={isLoadingDiseases}
                />
              </TableHeader>

              <TableBody>
                {rows.map((row) => {
                  // Verificar si esta fila tiene datos guardados (contadores > 0)
                  const hasPostmortemData = row.introductor
                    ? dynamicColumnConfig.some(
                        (config) =>
                          countAnimalsWithDisease(
                            postmortemData?.data,
                            row.introductor!.certId,
                            config.idSpeciesDisease!
                          ) > 0
                      ) ||
                      countAnimalsWithTotalConfiscation(
                        postmortemData?.data,
                        row.introductor.certId
                      ) > 0 ||
                      countAnimalsWithPartialConfiscation(
                        postmortemData?.data,
                        row.introductor.certId
                      ) > 0
                    : false;

                  return (
                    <TableRow key={row.id} className="hover:bg-gray-50/50">
                      <TableCell className="sticky left-0 z-20 bg-white border-r-2 p-1 sm:p-2 w-[150px] sm:w-[200px]">
                        {row.introductor ? (
                          <div className="space-y-0.5 text-left">
                            <div className="font-semibold text-[10px] sm:text-xs text-black leading-tight">
                              {row.introductor.nombre}
                            </div>
                            <div className="text-[9px] sm:text-[10px] text-gray-600 space-y-0">
                              <div>M: {row.introductor.marca}</div>
                              <div>C: {row.introductor.certificado}</div>
                              <div>A: {row.introductor.animales}</div>
                            </div>
                            {!hasPostmortemData && (
                              <Popover
                                open={openPopover === row.id}
                                onOpenChange={(open) =>
                                  setOpenPopover(open ? row.id : null)
                                }
                              >
                                <PopoverTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-5 w-full justify-center text-xs mt-0.5 hover:bg-gray-100 p-0"
                                  >
                                    <ChevronDown className="h-3 w-3" />
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent
                                  className="w-[400px] p-0"
                                  align="start"
                                >
                                  <Command>
                                    <CommandInput
                                      placeholder="Buscar por nombre o marca..."
                                      className="h-9"
                                    />
                                    <CommandList>
                                      <CommandEmpty>
                                        No se encontraron introductores.
                                      </CommandEmpty>
                                      <CommandGroup>
                                        {introductores.map((intro) => {
                                          // Verificar si este introductor ya está seleccionado en otra fila
                                          const isAlreadySelected = rows.some(
                                            (r) =>
                                              r.id !== row.id &&
                                              r.introductor?.certId ===
                                                intro.certId
                                          );

                                          return (
                                            <CommandItem
                                              key={intro.id}
                                              onSelect={() => {
                                                if (!isAlreadySelected) {
                                                  handleIntroductorSelect(
                                                    row.id,
                                                    intro
                                                  );
                                                }
                                              }}
                                              disabled={isAlreadySelected}
                                              className={`flex flex-col items-start py-3 ${
                                                isAlreadySelected
                                                  ? "opacity-50 cursor-not-allowed"
                                                  : ""
                                              }`}
                                            >
                                              <div className="font-medium">
                                                {intro.nombre}

                                              </div>
                                              <div className="text-xs text-muted-foreground">
                                                Marca: {intro.marca} | Cert:{" "}
                                                {intro.certificado} | Animales:{" "}
                                                {intro.animales}
                                              </div>
                                            </CommandItem>
                                          );
                                        })}
                                      </CommandGroup>
                                    </CommandList>
                                  </Command>
                                </PopoverContent>
                              </Popover>
                            )}
                          </div>
                        ) : (
                          <div className="space-y-0.5 text-left">
                            <div className="text-[10px] text-gray-400 leading-tight">
                              Seleccionar...
                            </div>
                            <div className="text-[10px] text-gray-400 space-y-0">
                              <div>M: --</div>
                              <div>C: --</div>
                              <div>A: --</div>
                            </div>
                            <Popover
                              open={openPopover === row.id}
                              onOpenChange={(open) =>
                                setOpenPopover(open ? row.id : null)
                              }
                            >
                              <PopoverTrigger asChild>
                                <Button
                                  variant="ghost"
                                  className="h-5 w-full justify-center hover:bg-gray-100 p-0"
                                >
                                  <ChevronDown className="h-3 w-3" />
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent
                                className="w-[400px] p-0"
                                align="start"
                              >
                                <Command>
                                  <CommandInput
                                    placeholder="Buscar por nombre o marca..."
                                    className="h-9"
                                  />
                                  <CommandList>
                                    <CommandEmpty>
                                      No se encontraron introductores.
                                    </CommandEmpty>
                                    <CommandGroup>
                                      {introductores.map((intro) => {
                                        // Verificar si este introductor ya está seleccionado en otra fila
                                        const isAlreadySelected = rows.some(
                                          (r) =>
                                            r.id !== row.id &&
                                            r.introductor?.certId ===
                                              intro.certId
                                        );

                                        return (
                                          <CommandItem
                                            key={intro.id}
                                            onSelect={() => {
                                              if (!isAlreadySelected) {
                                                handleIntroductorSelect(
                                                  row.id,
                                                  intro
                                                );
                                              }
                                            }}
                                            disabled={isAlreadySelected}
                                            className={`flex flex-col items-start py-3 ${
                                              isAlreadySelected
                                                ? "opacity-50 cursor-not-allowed"
                                                : ""
                                            }`}
                                          >
                                            <div className="font-medium">
                                              {intro.nombre}
                                              {/* {isAlreadySelected && (
                                                <span className="ml-2 text-xs text-red-500">
                                                  (Ya seleccionado)
                                                </span>
                                              )} */}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                              Marca: {intro.marca} | Cert:{" "}
                                              {intro.certificado} | Animales:{" "}
                                              {intro.animales}
                                            </div>
                                          </CommandItem>
                                        );
                                      })}
                                    </CommandGroup>
                                  </CommandList>
                                </Command>
                              </PopoverContent>
                            </Popover>
                          </div>
                        )}
                      </TableCell>

                      {/* Columnas de enfermedades */}
                      {dynamicColumnConfig.map((config, i) => {
                        // Contar animales con esta enfermedad desde los datos de postmortem
                        const count = row.introductor
                          ? countAnimalsWithDisease(
                              postmortemData?.data,
                              row.introductor.certId,
                              config.idSpeciesDisease!
                            )
                          : 0;

                        return (
                          <TableCell
                            key={`col-${i}`}
                            className="p-0.5 text-center cursor-pointer hover:bg-gray-100"
                            onClick={() =>
                              handleCellClick(row.id, i, "disease")
                            }
                          >
                            {count > 0 ? (
                              <div className="flex items-center justify-center">
                                <div className="h-6 w-6 rounded-full bg-red-500 text-white flex items-center justify-center text-xs font-semibold">
                                  {count}
                                </div>
                              </div>
                            ) : (
                              <div className="text-gray-400 text-xs">-</div>
                            )}
                          </TableCell>
                        );
                      })}

                      {/* Columna TOTAL (suma de todas las enfermedades) */}
                      <TableCell className="p-0.5 text-center bg-orange-50 font-bold">
                        {(() => {
                          if (!row.introductor) return "-";

                          // Sumar todos los animales con enfermedades
                          const total = dynamicColumnConfig.reduce(
                            (sum, config) => {
                              return (
                                sum +
                                countAnimalsWithDisease(
                                  postmortemData?.data,
                                  row.introductor!.certId,
                                  config.idSpeciesDisease!
                                )
                              );
                            },
                            0
                          );

                          return total > 0 ? total : "-";
                        })()}
                      </TableCell>

                      {/* Columnas de PRODUCTOS (Decomiso Total y Parcial) */}
                      {[0, 1].map((i) => {
                        const columnType =
                          i === 0
                            ? "total-confiscation"
                            : "partial-confiscation";

                        // Contar animales con decomiso total o parcial
                        const count = row.introductor
                          ? i === 0
                            ? countAnimalsWithTotalConfiscation(
                                postmortemData?.data,
                                row.introductor.certId
                              )
                            : countAnimalsWithPartialConfiscation(
                                postmortemData?.data,
                                row.introductor.certId
                              )
                          : 0;

                        return (
                          <TableCell
                            key={`prod-${i}`}
                            className="p-0.5 text-center cursor-pointer hover:bg-gray-100"
                            onClick={() =>
                              handleCellClick(row.id, 0, columnType)
                            }
                          >
                            {count > 0 ? (
                              <div className="flex items-center justify-center">
                                <div className="h-6 w-6 rounded-full bg-red-500 text-white flex items-center justify-center text-xs font-semibold">
                                  {count}
                                </div>
                              </div>
                            ) : (
                              <div className="text-gray-400 text-xs">-</div>
                            )}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      {/* Modal de Selección de Animales (para enfermedades) */}
      <AnimalSelectionModal
        isOpen={modalState.isOpen}
        onClose={handleCloseModal}
        onSave={handleSaveAnimals}
        introductor={
          currentIntroductor
            ? `${currentIntroductor.nombre} (${currentIntroductor.marca})`
            : ""
        }
        localizacion={modalState.localizacion}
        patologia={modalState.patologia}
        idSpeciesDisease={modalState.idSpeciesDisease ?? 0}
        certId={currentIntroductor?.certId ?? null}
      />

      {/* Modal de Decomiso Total */}
      <TotalConfiscationModal
        isOpen={totalConfiscationModalState.isOpen}
        onClose={() =>
          setTotalConfiscationModalState({ isOpen: false, rowId: null })
        }
        onSave={(count) => {
          if (totalConfiscationModalState.rowId) {
            setRows((prev) =>
              prev.map((row) =>
                row.id === totalConfiscationModalState.rowId
                  ? {
                      ...row,
                      values: row.values.map((v, i) =>
                        i === dynamicColumnConfig.length ? count : v
                      ),
                    }
                  : row
              )
            );
          }
          setTotalConfiscationModalState({ isOpen: false, rowId: null });
        }}
        introductor={
          totalConfiscationIntroductor
            ? `${totalConfiscationIntroductor.nombre} (${totalConfiscationIntroductor.marca})`
            : ""
        }
        localizacion="CANAL"
        certId={totalConfiscationIntroductor?.certId ?? null}
      />

      {/* Modal de Decomiso Parcial */}
      <PartialConfiscationModal
        isOpen={partialConfiscationModalState.isOpen}
        onClose={() =>
          setPartialConfiscationModalState({ isOpen: false, rowId: null })
        }
        onSave={(count) => {
          if (partialConfiscationModalState.rowId) {
            setRows((prev) =>
              prev.map((row) =>
                row.id === partialConfiscationModalState.rowId
                  ? {
                      ...row,
                      values: row.values.map((v, i) =>
                        i === dynamicColumnConfig.length + 1 ? count : v
                      ),
                    }
                  : row
              )
            );
          }
          setPartialConfiscationModalState({ isOpen: false, rowId: null });
        }}
        introductor={
          partialConfiscationIntroductor
            ? `${partialConfiscationIntroductor.nombre} (${partialConfiscationIntroductor.marca})`
            : ""
        }
        localizacion="CANAL"
        certId={partialConfiscationIntroductor?.certId ?? null}
      />
    </div>
  );
}
