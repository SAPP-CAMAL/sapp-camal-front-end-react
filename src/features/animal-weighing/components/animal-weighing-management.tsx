"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CalendarIcon, Download, Search } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { useLines } from "@/features/postmortem/hooks/use-lines";
import { useCertificates } from "@/features/postmortem/hooks/use-certificates";
import { useProductiveStagesBySpecie } from "@/features/productive-stage/hooks";
import { useAnimalWeighingByFilters, useSaveAnimalWeighing } from "../hooks";
import type { ProductType, AnimalWeighingRow, WeighingStage } from "../domain";
import type { GetCertificatesRequest } from "@/features/postmortem/domain/certificates.types";
import {
  getLocalDateString,
  parseLocalDateString,
} from "@/features/postmortem/utils/postmortem-helpers";

const WEIGHING_STAGES = [
  { value: "EN_PIE" as WeighingStage, label: "EN PIE" },
  {
    value: "DESPUES_FAENAMIENTO" as WeighingStage,
    label: "DESPUÉS DE FAENAMIENTO",
  },
  { value: "DISTRIBUCION" as WeighingStage, label: "DISTRIBUCIÓN" },
];

const PRODUCT_TYPES = [
  { value: "CANAL" as ProductType, label: "CANAL" },
  { value: "MEDIA_CANAL" as ProductType, label: "MEDIA CANAL" },
];

const HOOKS = [
  { id: 1, label: "GANCHO I", count: 20 },
  { id: 2, label: "GANCHO II", count: 15 },
  { id: 3, label: "GANCHO III", count: 25 },
  { id: 4, label: "GANCHO IV", count: 30 },
];

export function AnimalWeighingManagement() {
  const [selectedLineId, setSelectedLineId] = useState<string>("");
  const [selectedSpecieId, setSelectedSpecieId] = useState<number | null>(4);
  const [slaughterDate, setSlaughterDate] = useState<string>(
    getLocalDateString()
  );
  const [weighingStage, setWeighingStage] = useState<WeighingStage>("EN_PIE");
  const [productType, setProductType] = useState<ProductType>("MEDIA_CANAL");
  const [selectedHooks, setSelectedHooks] = useState<number[]>([4]);
  const [searchTerm, setSearchTerm] = useState("");
  const [rows, setRows] = useState<AnimalWeighingRow[]>([]);

  const { data: lines, isLoading: isLoadingLines } = useLines();

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

  const certificatesRequest: GetCertificatesRequest | null = useMemo(() => {
    if (!selectedSpecieId || !slaughterDate) return null;
    return {
      slaughterDate,
      idSpecies: selectedSpecieId,
    };
  }, [selectedSpecieId, slaughterDate]);

  const { data: certificatesData, isLoading: isLoadingCertificates } =
    useCertificates(certificatesRequest);

  const { data: productiveStagesData } = useProductiveStagesBySpecie(
    selectedSpecieId ?? 0
  );

  const weighingRequest = useMemo(() => {
    if (!selectedSpecieId || !slaughterDate) return null;
    return {
      slaughterDate,
      idSpecies: selectedSpecieId,
      productType,
    };
  }, [selectedSpecieId, slaughterDate, productType]);

  const { data: weighingData } = useAnimalWeighingByFilters(weighingRequest);
  const saveWeighingMutation = useSaveAnimalWeighing();

  // Generar filas basadas en certificados
  useEffect(() => {
    if (!certificatesData?.data) {
      setRows([]);
      return;
    }

    const newRows: AnimalWeighingRow[] = [];

    certificatesData.data.forEach((cert) => {
      const totalAnimals = cert.males + cert.females;

      // Crear una fila por cada animal en el certificado
      for (let i = 0; i < totalAnimals; i++) {
        const sexo = i < cert.males ? "Macho" : "Hembra";
        const existingWeight = weighingData?.data.find(
          (w) => w.idSettingCertificateBrands === cert.id
        );

        newRows.push({
          id: `${cert.id}-${i}`,
          marca: cert.brand.name,
          producto: `${
            productType === "CANAL" ? "CANAL" : "MEDIA CANAL"
          } - ${sexo}`,
          peso: existingWeight?.weight || 0,
          idSettingCertificateBrands: cert.id,
          idProductiveStage: 0, // No se usa en este contexto
        });
      }
    });

    setRows(newRows);
  }, [certificatesData, weighingData, productType]);

  const handleHookToggle = (hookId: number) => {
    setSelectedHooks((prev) =>
      prev.includes(hookId)
        ? prev.filter((id) => id !== hookId)
        : [...prev, hookId]
    );
  };

  const handleWeightChange = (rowId: string, weight: number) => {
    setRows((prev) =>
      prev.map((row) => (row.id === rowId ? { ...row, peso: weight } : row))
    );
  };

  const handleSaveWeight = async (row: AnimalWeighingRow) => {
    if (row.peso <= 0) return;

    await saveWeighingMutation.mutateAsync({
      idSettingCertificateBrands: row.idSettingCertificateBrands,
      idProductiveStage: row.idProductiveStage,
      weight: row.peso,
      slaughterDate,
      productType,
      weighingStage,
    });
  };

  const filteredRows = useMemo(() => {
    if (!searchTerm) return rows;
    return rows.filter((row) =>
      row.marca.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [rows, searchTerm]);

  const totalRecords = filteredRows.length;

  return (
    <div className="space-y-4 p-4">
      <div className="text-center">
        <h1 className="text-xl font-semibold">PESAJE DE ANIMALES</h1>
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

      {/* Etapas de Pesaje */}
      <Card className="p-4">
        <div className="space-y-3">
          <Label className="text-base font-semibold">Etapa de Pesaje:</Label>
          <div className="flex flex-wrap gap-2">
            {WEIGHING_STAGES.map((stage) => (
              <Button
                key={stage.value}
                variant={weighingStage === stage.value ? "default" : "outline"}
                size="lg"
                onClick={() => setWeighingStage(stage.value)}
              >
                {stage.label}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      {/* Filtros */}
      <Card className="p-4">
        <div className="space-y-3">
          {/* Primera línea: Fecha y Especies */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            {/* Fecha de Faenamiento */}
            <div className="flex items-center gap-2">
              <Label className="whitespace-nowrap">Fecha de Faenamiento:</Label>
              <div className="relative">
                <CalendarIcon
                  className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10 cursor-pointer"
                  onClick={() => {
                    const input = document.getElementById(
                      "fecha-weighing"
                    ) as HTMLInputElement;
                    if (input) input.showPicker();
                  }}
                />
                <Input
                  id="fecha-weighing"
                  type="date"
                  className="w-44 bg-white pl-8"
                  value={slaughterDate}
                  onChange={(e) => setSlaughterDate(e.target.value)}
                />
              </div>
            </div>

            {/* Especies - alineadas a la derecha */}
            <div className="flex items-center gap-2">
              <Label className="whitespace-nowrap">Especie:</Label>
              <div className="flex gap-2">
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
                    >
                      {line.description}
                    </Button>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Segunda línea: Ganchos centrados */}
          <div className="flex items-center justify-center gap-2">
            <Label className="whitespace-nowrap">Ganchos:</Label>
            <div className="flex gap-2">
              {HOOKS.map((hook) => (
                <Button
                  key={hook.id}
                  variant={
                    selectedHooks.includes(hook.id) ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => handleHookToggle(hook.id)}
                >
                  {hook.label} ({hook.count})
                </Button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Tipo de Producto */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          <Label className="flex-shrink-0">Tipo de Producto:</Label>
          <div className="flex gap-2">
            {PRODUCT_TYPES.map((type) => (
              <Button
                key={type.value}
                variant={productType === type.value ? "default" : "outline"}
                size="sm"
                onClick={() => setProductType(type.value)}
              >
                {type.label}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      {/* Búsqueda y Tabla */}
      <Card className="p-4">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {totalRecords} registro{totalRecords !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="flex gap-2">
            <div className="relative w-64">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por MARCAS"
                className="pl-8"
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

        {isLoadingCertificates ? (
          <div className="flex justify-center py-12">
            <div className="h-12 w-12 rounded-full border-4 border-gray-200 border-t-teal-600 animate-spin"></div>
          </div>
        ) : (
          <div className="overflow-x-auto border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-center">MARCAS</TableHead>
                  <TableHead className="text-center">Producto</TableHead>
                  <TableHead className="text-center">Peso</TableHead>
                  <TableHead className="text-center">Opción</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8">
                      No hay registros disponibles
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRows.map((row) => (
                    <TableRow key={row.id} className="bg-green-50">
                      <TableCell className="text-center font-medium">
                        {row.marca}
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
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-blue-600 border-blue-600"
                          onClick={() => {
                            const weight = prompt(
                              `Ingrese el peso para ${row.marca} - ${row.producto}:`,
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
                          RETOMAR
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>
    </div>
  );
}
