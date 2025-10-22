"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
  TableHead,
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
import { format } from "date-fns";
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
import { TotalConfiscationModal } from "./total-confiscation-modal";
import { PartialConfiscationModal } from "./partial-confiscation-modal";
import { DynamicTableHeaders } from "./dynamic-table-headers";
import { CorralTypeFilters } from "./corral-type-filters";
import { useLines } from "../hooks/use-lines";
import { useSpeciesDisease } from "../hooks/use-species-disease";
import { useCertificates } from "../hooks/use-certificates";
import { groupDiseasesByProduct } from "../server/db/species-disease.service";
import { getIntroductoresFromCertificates } from "../server/db/certificates.service";
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
import { useMemo, useEffect } from "react";

export function PostmortemManagement() {
  const [rows, setRows] = useState<IntroductorRow[]>([
    { id: "row-1", introductor: null, values: Array(50).fill(0) }, // Inicializar con más columnas
  ]);

  const [openPopover, setOpenPopover] = useState<string | null>(null);
  const [selectedLineId, setSelectedLineId] = useState<string>("");
  const [selectedSpecieId, setSelectedSpecieId] = useState<number | null>(4); // Bovinos por defecto (idSpecie = 4)
  const [slaughterDate, setSlaughterDate] = useState<string>(
    format(new Date(), "yyyy-MM-dd")
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

  const handleIntroductorSelect = (rowId: string, introductor: Introductor) => {
    setRows((prev) => {
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
      <Card className="p-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="flex items-center gap-3">
            <Label className="min-w-40">Fecha de Inspección</Label>
            <div className="relative w-[200px]">
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
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Label className="min-w-40 inline-flex">Línea de Producción</Label>
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
              <SelectTrigger className="max-w-64">
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
      <Card className="p-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="i-lucide-clipboard-list text-muted-foreground" />
            <h2 className="text-base font-medium flex gap-1">
              <BookText className="h-4 w-4 mt-1 text-primary" />
              Registro de Decomisos por Patologías
            </h2>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="text-teal-600 border-teal-600 bg-white hover:bg-teal-50"
            >
              <Settings className="h-4 w-4 mr-1" />
              Configuración de Reportes
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-teal-600 border-teal-600 bg-white hover:bg-teal-50"
            >
              <Download className="h-4 w-4 mr-1" />
              Generar Reportes
            </Button>
          </div>
        </div>

        {/* Filtros de tipo de corral */}
        <CorralTypeFilters
          selectedFilter={corralTypeFilter}
          onFilterChange={setCorralTypeFilter}
          counts={filterCounts}
        />

        <div className="overflow-x-auto border rounded-lg bg-white">
          <Table className="min-w-[1200px] bg-white">
            <TableHeader className="sticky top-0 z-20 [&_th]:!text-gray-900">
              <DynamicTableHeaders
                groupedColumns={groupedColumns}
                isLoading={isLoadingDiseases}
              />
            </TableHeader>

            <TableBody>
              {rows.map((row) => {
                return (
                  <TableRow key={row.id} className="hover:bg-gray-50/50">
                    <TableCell className="sticky left-0 z-20 bg-white border-r-2 p-2 w-[200px]">
                      {row.introductor ? (
                        <div className="space-y-0.5 text-left">
                          <div className="font-semibold text-xs text-black leading-tight">
                            {row.introductor.nombre}
                          </div>
                          <div className="text-[10px] text-gray-600 space-y-0">
                            <div>M: {row.introductor.marca}</div>
                            <div>C: {row.introductor.certificado}</div>
                            <div>A: {row.introductor.animales}</div>
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
                                    {introductores.map((intro) => (
                                      <CommandItem
                                        key={intro.id}
                                        onSelect={() =>
                                          handleIntroductorSelect(row.id, intro)
                                        }
                                        className="flex flex-col items-start py-3"
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
                                    ))}
                                  </CommandGroup>
                                </CommandList>
                              </Command>
                            </PopoverContent>
                          </Popover>
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
                                    {introductores.map((intro) => (
                                      <CommandItem
                                        key={intro.id}
                                        onSelect={() =>
                                          handleIntroductorSelect(row.id, intro)
                                        }
                                        className="flex flex-col items-start py-3"
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
                                    ))}
                                  </CommandGroup>
                                </CommandList>
                              </Command>
                            </PopoverContent>
                          </Popover>
                        </div>
                      )}
                    </TableCell>

                    {/* Columnas de enfermedades */}
                    {row.values
                      .slice(0, dynamicColumnConfig.length)
                      .map((value, i) => {
                        return (
                          <TableCell
                            key={`col-${i}`}
                            className="p-0.5 text-center cursor-pointer hover:bg-gray-100"
                            onClick={() =>
                              handleCellClick(row.id, i, "disease")
                            }
                          >
                            {value > 0 ? (
                              <div className="flex items-center justify-center">
                                <div className="h-6 w-6 rounded-full bg-red-500 text-white flex items-center justify-center text-xs font-semibold">
                                  {value}
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
                        const total = row.values
                          .slice(0, dynamicColumnConfig.length)
                          .reduce((sum, v) => sum + v, 0);
                        return total > 0 ? total : "-";
                      })()}
                    </TableCell>

                    {/* Columnas de PRODUCTOS (Decomiso Total y Parcial) */}
                    {row.values
                      .slice(
                        dynamicColumnConfig.length,
                        dynamicColumnConfig.length + 2
                      )
                      .map((value, i) => {
                        const columnType =
                          i === 0
                            ? "total-confiscation"
                            : "partial-confiscation";
                        return (
                          <TableCell
                            key={`prod-${i}`}
                            className="p-0.5 text-center cursor-pointer hover:bg-gray-100"
                            onClick={() =>
                              handleCellClick(row.id, 0, columnType)
                            }
                          >
                            {value > 0 ? (
                              <div className="flex items-center justify-center">
                                <div className="h-6 w-6 rounded-full bg-red-500 text-white flex items-center justify-center text-xs font-semibold">
                                  {value}
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
