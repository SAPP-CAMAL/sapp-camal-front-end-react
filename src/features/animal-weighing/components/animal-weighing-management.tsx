"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CalendarIcon, Download, Search, Scale } from "lucide-react";
import { useState, useMemo, useEffect, useRef } from "react";
import { useLines } from "@/features/postmortem/hooks/use-lines";
import { useSerialScale } from "@/hooks/use-serial-scale";
import { toast } from "sonner";
import {
  useAnimalWeighingByFilters,
  useSaveAnimalWeighing,
  useWeighingStages,
  useHookTypesBySpecie,
  useChannelTypes,
} from "../hooks";
import type { ProductType, AnimalWeighingRow, WeighingStage } from "../domain";
import {
  getLocalDateString,
  parseLocalDateString,
} from "@/features/postmortem/utils/postmortem-helpers";

export function AnimalWeighingManagement() {
  const [selectedLineId, setSelectedLineId] = useState<string>("");
  const [selectedSpecieId, setSelectedSpecieId] = useState<number | null>(4);
  const [slaughterDate, setSlaughterDate] = useState<string>(
    getLocalDateString()
  );
  const [weighingStage, setWeighingStage] = useState<WeighingStage>("ANTE");
  const [productType, setProductType] = useState<ProductType>("MEDIA_CANAL");
  const [selectedHook, setSelectedHook] = useState<number | null>(null);
  const [selectedChannelTypeId, setSelectedChannelTypeId] = useState<
    number | null
  >(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [rows, setRows] = useState<AnimalWeighingRow[]>([]);
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);
  const [capturedWeight, setCapturedWeight] = useState<number | null>(null);
  const lastCapturedWeightRef = useRef<number | null>(null);

  // Hook de balanza serial
  const {
    isConnected,
    currentWeight,
    error: scaleError,
    isSupported,
    connect: connectScale,
    disconnect: disconnectScale,
    resetWeight,
  } = useSerialScale();

  const { data: lines, isLoading: isLoadingLines } = useLines();
  const { data: weighingStagesData, isLoading: isLoadingWeighingStages } =
    useWeighingStages();
  const { data: hookTypesData, isLoading: isLoadingHookTypes } =
    useHookTypesBySpecie(selectedSpecieId);
  const { data: channelTypesData, isLoading: isLoadingChannelTypes } =
    useChannelTypes();

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

  const weighingRequest = useMemo(() => {
    if (!slaughterDate) return null;
    return {
      slaughterDate,
      productType,
    };
  }, [slaughterDate, productType]);

  const { data: weighingData, isLoading: isLoadingWeighingData } = useAnimalWeighingByFilters(weighingRequest);
  const saveWeighingMutation = useSaveAnimalWeighing();

  // Generar filas basadas en datos de pesaje y tipo de canal
  useEffect(() => {
    if (!weighingData?.data) {
      setRows([]);
      return;
    }

    // Si no hay tipo de canal seleccionado, usar 1 por defecto (una sola fila por animal)
    let hooksQuantity = 1;
    
    if (selectedChannelTypeId && channelTypesData?.data) {
      const selectedChannel = channelTypesData.data.find(
        (ch) => ch.id === selectedChannelTypeId
      );
      if (selectedChannel) {
        hooksQuantity = selectedChannel.hooksQuantity;
      }
    }

    const newRows: AnimalWeighingRow[] = [];

    // Combinar animales de ingreso normal y emergencia
    const allAnimals = [
      ...weighingData.data.ingressNormal,
      ...weighingData.data.ingressEmergency,
    ];

    allAnimals.forEach((animal) => {
      // Generar múltiples filas según hooksQuantity
      for (let i = 0; i < hooksQuantity; i++) {
        newRows.push({
          id: `${animal.id}-${i}`,
          code: animal.code,
          producto: `${animal.animalSex.name} - ${animal.detailCertificateBrands.productiveStage.name}`,
          peso: 0,
          fechaIngreso: animal.detailCertificateBrands.detailsCertificateBrand.createdAt,
          idDetailsCertificateBrands: animal.idDetailsCertificateBrands,
          idAnimalSex: animal.idAnimalSex,
        });
      }
    });

    // Ordenar por código de animal
    newRows.sort((a, b) => a.code.localeCompare(b.code));

    setRows(newRows);
  }, [weighingData, selectedChannelTypeId, channelTypesData]);

  const handleHookSelect = (hookId: number) => {
    setSelectedHook(hookId);
  };

  const handleWeightChange = (rowId: string, weight: number) => {
    setRows((prev) =>
      prev.map((row) => (row.id === rowId ? { ...row, peso: weight } : row))
    );
  };

  const handleSaveWeight = async (row: AnimalWeighingRow) => {
    if (row.peso <= 0) {
      toast.error("El peso debe ser mayor a 0");
      return;
    }

    try {
      // TODO: Actualizar con los campos correctos según la nueva API
      await saveWeighingMutation.mutateAsync({
        idSettingCertificateBrands: row.idDetailsCertificateBrands, // Usar el nuevo campo
        idProductiveStage: 0, // TODO: Obtener de la estructura de datos
        weight: row.peso,
        slaughterDate,
        productType,
        weighingStage,
      });
      toast.success(`Peso guardado: ${row.peso.toFixed(2)} lb`);
      setSelectedRowId(null);
      setCapturedWeight(null);
      lastCapturedWeightRef.current = null;
    } catch (error) {
      toast.error("Error al guardar el peso");
    }
  };

  // Capturar peso estable de la balanza
  useEffect(() => {
    if (currentWeight && selectedRowId) {
      // Convertir de kg a lb
      const weightInKg =
        currentWeight.unit === "kg"
          ? currentWeight.value
          : currentWeight.value / 2.20462; // Si viene en lb, convertir a kg primero

      const weightInLb = weightInKg * 2.20462;

      // Solo capturar pesos razonables (mayores a 10 kg / 22 lb)
      // Esto evita capturar valores parciales como "=97" o "=500"
      if (weightInKg < 10) {
        return;
      }

      // Evitar capturas duplicadas del mismo peso
      const roundedWeight = Math.round(weightInLb * 100) / 100;
      if (lastCapturedWeightRef.current === roundedWeight) {
        return;
      }

      lastCapturedWeightRef.current = roundedWeight;
      setCapturedWeight(roundedWeight);

      // Actualizar el peso en la fila
      setRows((prev) =>
        prev.map((row) =>
          row.id === selectedRowId ? { ...row, peso: roundedWeight } : row
        )
      );

      toast.success(
        `Peso capturado: ${roundedWeight.toFixed(2)} lb (${weightInKg.toFixed(
          2
        )} kg)`
      );
    }
  }, [currentWeight?.value, currentWeight?.unit, selectedRowId]);

  const filteredRows = useMemo(() => {
    if (!searchTerm) return rows;
    return rows.filter((row) =>
      row.code.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [rows, searchTerm]);

  const totalRecords = filteredRows.length;

  return (
    <div className="space-y-4 p-4">
      <div className="text-center">
        <h1 className="text-xl font-semibold mb-">PESAJE DE ANIMALES</h1>
        <p className="text-muted-foreground text-sm">
          Fecha de Faenamiento:{" "}
          {parseLocalDateString(slaughterDate).toLocaleDateString("es-ES", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      {/* Balanza Serial */}
      <Card className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Scale className="h-5 w-5 text-blue-600" />
              <Label className="text-base font-semibold">
                Balanza Bernalo X1
              </Label>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {isConnected ? (
                <>
                  <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-sm text-green-700 font-medium">
                    Conectada
                  </span>
                  <Button size="sm" variant="outline" onClick={disconnectScale}>
                    Desconectar
                  </Button>
                </>
              ) : (
                <>
                  <span className="flex h-2 w-2 rounded-full bg-gray-400" />
                  <span className="text-sm text-gray-600">Desconectada</span>
                  <Button
                    size="sm"
                    onClick={connectScale}
                    disabled={!isSupported}
                  >
                    Conectar Balanza
                  </Button>
                </>
              )}
            </div>
          </div>

          {isConnected && (
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 bg-white rounded-lg border-2 border-blue-300">
              <div className="flex-1">
                <p className="text-sm text-gray-600 mb-2">Peso Actual</p>
                {currentWeight ? (
                  <div className="space-y-2">
                    {/* Peso en Libras */}
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span className="text-4xl font-bold text-blue-900">
                        {(currentWeight.unit === "kg"
                          ? currentWeight.value * 2.20462
                          : currentWeight.value
                        ).toFixed(2)}
                      </span>
                      <span className="text-2xl font-semibold text-blue-700">
                        lb
                      </span>
                      {currentWeight.stable && (
                        <span className="ml-2 px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded">
                          ESTABLE
                        </span>
                      )}
                    </div>
                    {/* Peso en Kilogramos */}
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span className="text-2xl font-semibold text-gray-700">
                        {(currentWeight.unit === "kg"
                          ? currentWeight.value
                          : currentWeight.value / 2.20462
                        ).toFixed(2)}
                      </span>
                      <span className="text-lg font-medium text-gray-600">
                        kg
                      </span>
                    </div>
                  </div>
                ) : (
                  <span className="text-2xl text-gray-400">
                    Esperando lectura...
                  </span>
                )}
              </div>
              {selectedRowId && (
                <div className="text-left md:text-right">
                  <p className="text-sm text-gray-600">Animal Seleccionado</p>
                  <p className="text-lg font-semibold text-blue-900">
                    {rows.find((r) => r.id === selectedRowId)?.code}
                  </p>
                </div>
              )}
            </div>
          )}

          {scaleError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{scaleError}</p>
            </div>
          )}

          {!isSupported && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                Tu navegador no soporta Web Serial API. Usa Chrome o Edge.
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Etapa de Pesaje y Fecha */}
      <Card className="p-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          {/* Fecha a la izquierda */}
          <div className="flex items-center gap-2 w-full lg:w-auto">
            <Label className="whitespace-nowrap font-semibold">
              Fecha de Faenamiento:
            </Label>
            <div className="relative flex-1 lg:flex-initial">
              <Input
                id="fecha-weighing"
                type="date"
                className="w-full lg:w-52 bg-white pl-10 cursor-pointer [&::-webkit-calendar-picker-indicator]:hidden"
                value={slaughterDate}
                onChange={(e) => setSlaughterDate(e.target.value)}
                onClick={(e) => {
                  const input = e.currentTarget;
                  input.showPicker?.();
                }}
              />
              <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            </div>
          </div>

          {/* Etapa de Pesaje a la derecha */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full lg:w-auto">
            <Label className="text-base font-semibold whitespace-nowrap">
              Etapa de Pesaje:
            </Label>
            <TooltipProvider>
              <div className="flex gap-2 w-full sm:w-auto">
                {isLoadingWeighingStages ? (
                  <span className="text-sm text-muted-foreground">
                    Cargando...
                  </span>
                ) : (
                  weighingStagesData?.data.map((stage) => (
                    <Tooltip key={stage.code}>
                      <TooltipTrigger asChild>
                        <Button
                          variant={
                            weighingStage === stage.code ? "default" : "outline"
                          }
                          size="lg"
                          onClick={() =>
                            setWeighingStage(stage.code as WeighingStage)
                          }
                          className="flex-1 sm:flex-initial"
                        >
                          {stage.name}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">{stage.description}</p>
                      </TooltipContent>
                    </Tooltip>
                  ))
                )}
              </div>
            </TooltipProvider>
          </div>
        </div>
      </Card>

      {/* Especie y Ganchos */}
      <Card className="p-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          {/* Especie a la izquierda */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full lg:w-auto">
            <Label className="whitespace-nowrap font-semibold">Especie:</Label>
            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              {isLoadingLines ? (
                <span className="text-sm text-muted-foreground">
                  Cargando...
                </span>
              ) : (
                lines?.map((line) => (
                  <Button
                    key={line.id}
                    variant={
                      selectedLineId === line.id.toString()
                        ? "default"
                        : "outline"
                    }
                    size="sm"
                    onClick={() => {
                      setSelectedLineId(line.id.toString());
                      setSelectedSpecieId(line.idSpecie);
                    }}
                    className="flex-1 sm:flex-initial"
                  >
                    {line.description}
                  </Button>
                ))
              )}
            </div>
          </div>

          {/* Ganchos a la derecha */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full lg:w-auto">
            <Label className="whitespace-nowrap font-semibold">Ganchos:</Label>
            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              {isLoadingHookTypes ? (
                <span className="text-sm text-muted-foreground">
                  Cargando...
                </span>
              ) : (
                hookTypesData?.data.map((hook) => (
                  <Button
                    key={hook.id}
                    variant={selectedHook === hook.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleHookSelect(hook.id)}
                    className="flex-1 sm:flex-initial min-w-[80px]"
                  >
                    {hook.name}{" "}
                    <span className="text-xs ml-1">({hook.weightLb})</span>
                  </Button>
                ))
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Tipo de Canal */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <Label className="flex-shrink-0 font-semibold">Tipo de Canal:</Label>
          <TooltipProvider>
            <div className="flex gap-2 w-full sm:w-auto">
              {isLoadingChannelTypes ? (
                <span className="text-sm text-muted-foreground">
                  Cargando...
                </span>
              ) : (
                channelTypesData?.data.map((channel) => (
                  <Tooltip key={channel.id}>
                    <TooltipTrigger asChild>
                      <Button
                        variant={
                          selectedChannelTypeId === channel.id
                            ? "default"
                            : "outline"
                        }
                        size="sm"
                        onClick={() => setSelectedChannelTypeId(channel.id)}
                        className="flex-1 sm:flex-initial"
                      >
                        {channel.name}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">{channel.description}</p>
                    </TooltipContent>
                  </Tooltip>
                ))
              )}
            </div>
          </TooltipProvider>
        </div>
      </Card>

      {/* Búsqueda y Tabla */}
      <Card className="p-4">
        <div className="mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {totalRecords} registro{totalRecords !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por código de animal"
                className="pl-8 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              className="text-blue-600 border-blue-600"
            >
              <Download className="h-4 w-4 mr-1" />
              Reporte
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-center">📅 Fecha de Ingreso</TableHead>
                <TableHead className="text-center">🐄 Animales</TableHead>
                <TableHead className="text-center">📦 Producto</TableHead>
                <TableHead className="text-center">⚖️ Peso</TableHead>
                <TableHead className="text-center">🔧 Opción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    {isLoadingWeighingData ? "Cargando animales..." : "No hay registros disponibles"}
                  </TableCell>
                </TableRow>
              ) : (
                filteredRows.map((row) => (
                  <TableRow key={row.id} className="bg-green-50">
                    <TableCell className="text-center">
                      {new Date(row.fechaIngreso).toLocaleDateString("es-ES", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                      })}
                    </TableCell>
                    <TableCell className="text-center font-medium">
                      {row.code}
                    </TableCell>
                    <TableCell className="text-center">
                      {row.producto}
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="text-green-600 font-semibold">
                        {row.peso > 0 ? `${row.peso} lb` : "-"}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex gap-2 justify-center">
                        {isConnected ? (
                          <>
                            <Button
                              size="sm"
                              variant={
                                selectedRowId === row.id ? "default" : "outline"
                              }
                              className={
                                selectedRowId === row.id
                                  ? "bg-green-600"
                                  : "text-green-600 border-green-600"
                              }
                              onClick={() => {
                                if (selectedRowId === row.id) {
                                  setSelectedRowId(null);
                                  setCapturedWeight(null);
                                } else {
                                  setSelectedRowId(row.id);
                                  setCapturedWeight(null);
                                  resetWeight(); // Resetear la balanza cuando se selecciona un animal
                                }
                              }}
                            >
                              {selectedRowId === row.id
                                ? "SELECCIONADO"
                                : "SELECCIONAR"}
                            </Button>
                            {selectedRowId === row.id && capturedWeight && (
                              <Button
                                size="sm"
                                className="bg-blue-600"
                                onClick={() => handleSaveWeight(row)}
                                disabled={saveWeighingMutation.isPending}
                              >
                                {saveWeighingMutation.isPending
                                  ? "GUARDANDO..."
                                  : "GUARDAR"}
                              </Button>
                            )}
                          </>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-blue-600 border-blue-600"
                            onClick={() => {
                              const weight = prompt(
                                `Ingrese el peso para ${row.code} - ${row.producto}:`,
                                row.peso.toString()
                              );
                              if (weight) {
                                const numWeight = parseFloat(weight);
                                if (!isNaN(numWeight) && numWeight > 0) {
                                  handleWeightChange(row.id, numWeight);
                                  handleSaveWeight({
                                    ...row,
                                    peso: numWeight,
                                  });
                                }
                              }
                            }}
                          >
                            MANUAL
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
