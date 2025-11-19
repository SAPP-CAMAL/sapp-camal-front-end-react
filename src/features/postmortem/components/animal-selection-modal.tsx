"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Save, Loader2 } from "lucide-react";
import type { AnimalSelection } from "../domain/postmortem.types";
import { useAnimalsByBrand } from "../hooks/use-animals-by-brand";
import {
  useSavePostmortem,
  useUpdatePostmortem,
} from "../hooks/use-save-postmortem";
import { usePostmortemByBrand } from "../hooks/use-postmortem-by-brand";
import { useProductAnatomicalLocations } from "../hooks/use-product-anatomical-locations";
import { useAvgOrgansSpecies } from "../hooks/use-avg-organs-species";
import type { SubProductPostmortem } from "../domain/save-postmortem.types";
import { toast } from "sonner";
import { useMemo } from "react";
import { useUnitMeasure } from "@/features/animal-weighing/hooks/use-unit-measure";

type AnimalSelectionModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (selectedCount: number) => void;
  introductor: string;
  localizacion: string;
  patologia: string;
  idSpeciesDisease: number;
  idProduct: number | null;
  idSpecie: number | null;
  certId: number | null;
  canEdit?: boolean; // Nueva prop para controlar si se puede editar
};

export function AnimalSelectionModal({
  isOpen,
  onClose,
  onSave,
  introductor,
  localizacion,
  patologia,
  idSpeciesDisease,
  idProduct,
  idSpecie,
  certId,
  canEdit = true, // Por defecto true para mantener compatibilidad
}: AnimalSelectionModalProps) {
  // Obtener animales desde la API
  const { data: animalsData, isLoading } = useAnimalsByBrand(certId);
  const { mutate: savePostmortem, isPending: isSaving } = useSavePostmortem();
  const { mutate: updatePostmortem, isPending: isUpdating } =
    useUpdatePostmortem();

  // Obtener datos guardados de postmortem (trae TODOS los datos de la marca)
  const { data: postmortemData } = usePostmortemByBrand(certId);

  // Obtener ubicaciones anatómicas del producto
  const { data: anatomicalLocationsData } =
    useProductAnatomicalLocations(idProduct);

  // Obtener peso promedio de órganos (solo para subproductos)
  const { data: avgOrgansData } = useAvgOrgansSpecies(idSpecie, idProduct);

  // Obtener unidad de medida desde la API
  const { data: unitMeasureData } = useUnitMeasure();
  const unitSymbol = unitMeasureData?.data?.symbol || "kg";

  const isSavingOrUpdating = isSaving || isUpdating;

  const [animalSelections, setAnimalSelections] = useState<AnimalSelection[]>(
    []
  );

  const [generalPercentage, setGeneralPercentage] = useState<string>("40");

  // Trackear los valores iniciales para detectar cambios
  const [initialSelections, setInitialSelections] = useState<AnimalSelection[]>(
    []
  );

  // Verificar si ya existen datos guardados para ESTA enfermedad específica
  const hasExistingData = useMemo(() => {
    if (!postmortemData?.data || !idSpeciesDisease) return false;

    // Verificar si algún animal seleccionado ya tiene datos para esta enfermedad
    const selectedAnimals = animalSelections.filter((a) => a.selected);

    return selectedAnimals.some((animal) => {
      const existingPostmortem = postmortemData.data.find(
        (item) => item.idDetailsSpeciesCertificate === parseInt(animal.animalId)
      );

      return existingPostmortem?.subProductPostmortem.some(
        (sub) => sub.idSpeciesDisease === idSpeciesDisease
      );
    });
  }, [postmortemData, idSpeciesDisease, animalSelections]);

  // Inicializar selecciones cuando se cargan los animales y datos guardados
  useEffect(() => {
    if (animalsData?.data && idSpeciesDisease && isOpen) {
      const selections = animalsData.data.map((animal) => {
        // Buscar si este animal ya tiene datos guardados para ESTA enfermedad específica
        const savedData = postmortemData?.data?.find(
          (item) => item.idDetailsSpeciesCertificate === animal.id
        );

        // Buscar TODOS los subproductos de ESTA enfermedad (puede haber múltiples por ubicaciones anatómicas)
        const savedSubProducts = savedData?.subProductPostmortem.filter(
          (sub) => sub.idSpeciesDisease === idSpeciesDisease
        ) || [];

        // Inicializar porcentajes de ubicaciones anatómicas
        const anatomicalPercentages: Record<number, number> = {};
        const anatomicalWeights: Record<number, number> = {};
        const selectedAnatomicalLocations: Record<number, boolean> = {};
        
        if (anatomicalLocationsData?.data) {
          anatomicalLocationsData.data.forEach((location) => {
            // Buscar si hay datos guardados para esta ubicación específica
            const savedForLocation = savedSubProducts.find(
              (sub) => sub.idProductAnatomicalLocation === location.id
            );

            if (savedForLocation) {
              // Si hay datos guardados, usar esos valores
              anatomicalPercentages[location.id] = parseFloat(
                savedForLocation.percentageAffection
              );
              anatomicalWeights[location.id] = parseFloat(
                savedForLocation.weight
              );
              selectedAnatomicalLocations[location.id] = true; // Marcar como seleccionado
            } else {
              // Valores por defecto
              anatomicalPercentages[location.id] = 40;
              anatomicalWeights[location.id] = avgOrgansData?.data?.avgWeight
                ? parseFloat(avgOrgansData.data.avgWeight)
                : 0;
              selectedAnatomicalLocations[location.id] = false;
            }
          });
        }

        // Para el caso sin ubicaciones anatómicas, usar el primer subproducto encontrado
        const savedSubProduct = savedSubProducts[0];

        // Inicializar peso con el valor guardado o el promedio de la API
        const weight = savedSubProduct
          ? parseFloat(savedSubProduct.weight)
          : avgOrgansData?.data?.avgWeight
          ? parseFloat(avgOrgansData.data.avgWeight)
          : 0;

        return {
          animalId: animal.id.toString(),
          selected: savedSubProducts.length > 0, // Seleccionado si hay al menos un subproducto guardado
          percentage: savedSubProduct
            ? parseFloat(savedSubProduct.percentageAffection)
            : 40,
          weight,
          anatomicalPercentages,
          anatomicalWeights,
          selectedAnatomicalLocations,
        };
      });

      setAnimalSelections(selections);
      setInitialSelections(JSON.parse(JSON.stringify(selections))); // Copia profunda
    }
  }, [
    animalsData,
    postmortemData,
    idSpeciesDisease,
    isOpen,
    anatomicalLocationsData,
    avgOrgansData,
  ]);

  const handleAnimalToggle = (animalId: string) => {
    setAnimalSelections((prev) =>
      prev.map((animal) =>
        animal.animalId === animalId
          ? { ...animal, selected: !animal.selected }
          : animal
      )
    );
  };

  const handleAnimalPercentage = (animalId: string, percentage: number) => {
    setAnimalSelections((prev) =>
      prev.map((animal) =>
        animal.animalId === animalId ? { ...animal, percentage } : animal
      )
    );
  };

  const handleAnatomicalPercentage = (
    animalId: string,
    locationId: number,
    percentage: number
  ) => {
    setAnimalSelections((prev) =>
      prev.map((animal) =>
        animal.animalId === animalId
          ? {
              ...animal,
              anatomicalPercentages: {
                ...animal.anatomicalPercentages,
                [locationId]: percentage,
              },
            }
          : animal
      )
    );
  };

  const handleAnatomicalWeight = (
    animalId: string,
    locationId: number,
    weight: number
  ) => {
    setAnimalSelections((prev) =>
      prev.map((animal) =>
        animal.animalId === animalId
          ? {
              ...animal,
              anatomicalWeights: {
                ...animal.anatomicalWeights,
                [locationId]: weight,
              },
            }
          : animal
      )
    );
  };

  const handleAnatomicalLocationToggle = (
    animalId: string,
    locationId: number
  ) => {
    setAnimalSelections((prev) =>
      prev.map((animal) =>
        animal.animalId === animalId
          ? {
              ...animal,
              selectedAnatomicalLocations: {
                ...animal.selectedAnatomicalLocations,
                [locationId]: !animal.selectedAnatomicalLocations?.[locationId],
              },
            }
          : animal
      )
    );
  };

  const handleAnimalWeight = (animalId: string, weight: number) => {
    setAnimalSelections((prev) =>
      prev.map((animal) =>
        animal.animalId === animalId ? { ...animal, weight } : animal
      )
    );
  };

  const handleApplyGeneralPercentage = (percentage: number) => {
    setAnimalSelections((prev) =>
      prev.map((animal) =>
        animal.selected ? { ...animal, percentage } : animal
      )
    );
  };

  const handleSave = () => {
    // Detectar solo los animales que fueron MODIFICADOS
    const modifiedAnimals = animalSelections.filter((current) => {
      const initial = initialSelections.find(
        (i) => i.animalId === current.animalId
      );

      // Si no existía inicialmente y ahora está seleccionado -> modificado
      if (!initial && current.selected) return true;

      // Si existía y cambió la selección o el porcentaje -> modificado
      if (
        initial &&
        (initial.selected !== current.selected ||
          initial.percentage !== current.percentage ||
          initial.weight !== current.weight)
      ) {
        return true;
      }

      // Verificar cambios en ubicaciones anatómicas
      if (initial && anatomicalLocationsData?.data) {
        for (const location of anatomicalLocationsData.data) {
          const locationId = location.id;
          
          // Verificar si cambió la selección de la ubicación
          if (
            initial.selectedAnatomicalLocations?.[locationId] !==
            current.selectedAnatomicalLocations?.[locationId]
          ) {
            return true;
          }

          // Verificar si cambió el porcentaje de la ubicación
          if (
            initial.anatomicalPercentages?.[locationId] !==
            current.anatomicalPercentages?.[locationId]
          ) {
            return true;
          }

          // Verificar si cambió el peso de la ubicación
          if (
            initial.anatomicalWeights?.[locationId] !==
            current.anatomicalWeights?.[locationId]
          ) {
            return true;
          }
        }
      }

      return false;
    });

    if (modifiedAnimals.length === 0) {
      toast.info("No hay cambios para guardar");
      return;
    }

    // Solo procesar los animales modificados que están seleccionados
    const selectedModified = modifiedAnimals.filter((a) => a.selected);

    if (selectedModified.length === 0) {
      toast.info("No hay animales seleccionados para guardar");
      return;
    }

    let processedCount = 0;
    const totalAnimals = selectedModified.length;

    selectedModified.forEach((animal) => {
      const existingPostmortem = postmortemData?.data?.find(
        (item) => item.idDetailsSpeciesCertificate === parseInt(animal.animalId)
      );

      const existingSubProduct = existingPostmortem?.subProductPostmortem.find(
        (sub) => sub.idSpeciesDisease === idSpeciesDisease
      );

      // Construir subProductsPostmortem según si hay ubicaciones anatómicas o no
      let subProductsPostmortem: SubProductPostmortem[] = [];

      // Obtener el estado inicial del animal para comparar
      const initialAnimal = initialSelections.find(
        (i) => i.animalId === animal.animalId
      );

      if (
        anatomicalLocationsData?.data &&
        anatomicalLocationsData.data.length > 0
      ) {
        // Si hay ubicaciones anatómicas, crear un SubProductPostmortem solo para ubicaciones NUEVAS o MODIFICADAS
        anatomicalLocationsData.data.forEach((location) => {
          const isCurrentlySelected =
            animal.selectedAnatomicalLocations?.[location.id];
          const wasInitiallySelected =
            initialAnimal?.selectedAnatomicalLocations?.[location.id];

          // Solo incluir si:
          // 1. Está seleccionada actualmente Y no estaba seleccionada antes (NUEVA)
          // 2. Está seleccionada actualmente Y estaba seleccionada antes pero cambió algo (MODIFICADA)
          if (isCurrentlySelected) {
            const hasChanged =
              !wasInitiallySelected || // Es nueva
              initialAnimal?.anatomicalPercentages?.[location.id] !==
                animal.anatomicalPercentages?.[location.id] || // Cambió porcentaje
              initialAnimal?.anatomicalWeights?.[location.id] !==
                animal.anatomicalWeights?.[location.id]; // Cambió peso

            if (hasChanged) {
              subProductsPostmortem.push({
                idSpeciesDisease: idSpeciesDisease,
                presence: 1,
                percentageAffection:
                  animal.anatomicalPercentages?.[location.id] || 0,
                weight: animal.anatomicalWeights?.[location.id] || 0,
                status: true,
                idProductAnatomicalLocation: location.id,
              });
            }
          }
        });

        // Validar que haya al menos un cambio para enviar
        if (subProductsPostmortem.length === 0) {
          // Verificar si hay al menos una ubicación seleccionada
          const hasAnySelected = anatomicalLocationsData.data.some(
            (location) => animal.selectedAnatomicalLocations?.[location.id]
          );

          if (!hasAnySelected) {
            toast.error(
              `Debe seleccionar al menos una ubicación anatómica para el animal #${
                animalsData?.data?.find(
                  (a) => a.id.toString() === animal.animalId
                )?.code
              }`
            );
            return;
          }
          // Si hay ubicaciones seleccionadas pero no hay cambios, no hacer nada para este animal
          processedCount++;
          return;
        }
      } else {
        // Si NO hay ubicaciones anatómicas, usar el formato anterior
        subProductsPostmortem = [
          {
            idSpeciesDisease: idSpeciesDisease,
            presence: 1,
            percentageAffection: animal.percentage,
            weight: animal.weight || 0,
            status: true,
          },
        ];
      }

      if (existingPostmortem && existingSubProduct) {
        // Actualizar
        updatePostmortem(
          {
            id: existingPostmortem.id,
            request: {
              status: true,
              subProductsPostmortem,
            },
          },
          {
            onSuccess: () => {
              processedCount++;
              if (processedCount === totalAnimals) {
                toast.success(
                  `Se ${
                    totalAnimals === 1 ? "actualizó" : "actualizaron"
                  } ${totalAnimals} ${
                    totalAnimals === 1 ? "animal" : "animales"
                  } correctamente`
                );
                onSave(totalAnimals);
                onClose();
              }
            },
            onError: () => {
              toast.error(`Error al actualizar animal`);
            },
          }
        );
      } else {
        // Crear
        savePostmortem(
          {
            idDetailsSpeciesCertificate: parseInt(animal.animalId),
            status: true,
            subProductsPostmortem,
          },
          {
            onSuccess: () => {
              processedCount++;
              if (processedCount === totalAnimals) {
                toast.success(
                  `Se ${
                    totalAnimals === 1 ? "guardó" : "guardaron"
                  } ${totalAnimals} ${
                    totalAnimals === 1 ? "animal" : "animales"
                  } correctamente`
                );
                onSave(totalAnimals);
                onClose();
              }
            },
            onError: () => {
              toast.error(`Error al guardar animal`);
            },
          }
        );
      }
    });
  };

  const handleCancel = () => {
    // Reset selections
    if (animalsData?.data) {
      setAnimalSelections(
        animalsData.data.map((animal) => ({
          animalId: animal.id.toString(),
          selected: false,
          percentage: 40,
        }))
      );
    }
    setGeneralPercentage("40");
    onClose();
  };

  const selectedCount = animalSelections.filter((a) => a.selected).length;

  return (
    <Dialog open={isOpen} onOpenChange={handleCancel}>
      <DialogContent className="max-w-[95vw] sm:max-w-5xl max-h-[90vh] overflow-y-auto scrollbar-hide">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-full bg-teal-100 flex items-center justify-center">
              <span className="text-teal-600 text-sm">ℹ</span>
            </div>
            Gestión de Animales – {patologia}
          </DialogTitle>
        </DialogHeader>

        {/* Header Info */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 rounded-lg">
          <div>
            <div className="text-sm font-medium text-gray-700">
              Introductor:
            </div>
            <div className="text-sm text-gray-600">{introductor}</div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-700">
              Localización:
            </div>
            <div className="text-sm text-teal-600 font-medium">
              {localizacion}
            </div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-700">Patología:</div>
            <div className="text-sm text-gray-600">{patologia}</div>
          </div>
        </div>



        {/* % de Afectación General - Solo mostrar cuando NO hay ubicaciones anatómicas */}
        {(!anatomicalLocationsData?.data ||
          anatomicalLocationsData.data.length === 0) && (
          <div className="space-y-3">
            <h3 className="font-semibold text-sm">% de Afectación General</h3>
            <p className="text-xs text-gray-600">
              Aplique un porcentaje de afectación a todos los animales
              seleccionados
            </p>

            <div className="flex flex-col gap-3">
              <div className="flex gap-2">
                <Button
                  variant={generalPercentage === "20" ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setGeneralPercentage("20");
                    handleApplyGeneralPercentage(20);
                  }}
                  className={
                    generalPercentage === "20"
                      ? "bg-blue-600 hover:bg-blue-700"
                      : ""
                  }
                >
                  20%
                </Button>
                <Button
                  variant={generalPercentage === "40" ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setGeneralPercentage("40");
                    handleApplyGeneralPercentage(40);
                  }}
                  className={
                    generalPercentage === "40"
                      ? "bg-blue-600 hover:bg-blue-700"
                      : ""
                  }
                >
                  40%
                </Button>
                <Button
                  variant={generalPercentage === "60" ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setGeneralPercentage("60");
                    handleApplyGeneralPercentage(60);
                  }}
                  className={
                    generalPercentage === "60"
                      ? "bg-blue-600 hover:bg-blue-700"
                      : ""
                  }
                >
                  60%
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 min-w-fit">
                  Porcentaje personalizado (%)
                </span>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  placeholder="Ingrese porcentaje"
                  className="w-40 h-9"
                  value={generalPercentage || ""}
                  onChange={(e) => setGeneralPercentage(e.target.value)}
                />
                <Button
                  size="sm"
                  onClick={() => {
                    const val = parseInt(generalPercentage);
                    if (!isNaN(val)) handleApplyGeneralPercentage(val);
                  }}
                  className="bg-teal-600 hover:bg-teal-700"
                >
                  Aplicar a Seleccionados
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Lista de Animales */}
        <div className="space-y-2">
          <h3 className="font-semibold text-sm">
            Animales Disponibles ({selectedCount} seleccionados)
          </h3>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-teal-600" />
              <span className="ml-2 text-sm text-gray-600">
                Cargando animales...
              </span>
            </div>
          ) : !animalsData?.data || animalsData.data.length === 0 ? (
            <div className="text-center py-8 text-sm text-gray-500">
              No hay animales disponibles para esta marca
            </div>
          ) : (
            <div className="space-y-2 max-h-[400px] overflow-y-auto scrollbar-hide">
              {animalsData.data.map((animal) => {
                const animalId = animal.id.toString();
                const selection = animalSelections.find(
                  (s) => s.animalId === animalId
                );
                if (!selection) return null;

                // Determinar el sexo del animal
                const sexLabel = animal.idAnimalSex === 1 ? "Hembra" : "Macho";

                return (
                  <div
                    key={animal.id}
                    className="border rounded-lg p-4 space-y-3 bg-white"
                  >
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={selection.selected}
                        onCheckedChange={() => handleAnimalToggle(animalId)}
                        id={`animal-${animal.id}`}
                        disabled={!canEdit}
                      />
                      <label
                        htmlFor={`animal-${animal.id}`}
                        className="flex items-center gap-3 cursor-pointer flex-1"
                      >
                        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-lg">
                          <span className="font-mono text-sm font-semibold">
                            {animal.code}
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm text-gray-600">
                            Animal #{animal.code}
                          </span>
                          <span className="text-xs text-gray-500">
                            {sexLabel}
                          </span>
                        </div>
                      </label>
                    </div>

                    {selection.selected && (
                      <div className="ml-14 space-y-3">
                        <div className="flex gap-3 items-start">
                          {/* Ubicaciones Anatómicas (si existen) - SOLO mostrar estas */}
                          {anatomicalLocationsData?.data &&
                          anatomicalLocationsData.data.length > 0 ? (
                            <div className="space-y-2 w-full">
                              <div className="text-xs font-medium text-gray-700">
                                Ubicaciones Anatómicas
                              </div>
                            <div className="grid grid-cols-1 gap-2">
                              {anatomicalLocationsData.data.map((location) => (
                                <div
                                  key={location.id}
                                  className="space-y-2 bg-gray-50 p-3 rounded border"
                                >
                                  <div className="flex items-center gap-2">
                                    <Checkbox
                                      checked={
                                        selection.selectedAnatomicalLocations?.[
                                          location.id
                                        ] || false
                                      }
                                      onCheckedChange={() =>
                                        handleAnatomicalLocationToggle(
                                          animalId,
                                          location.id
                                        )
                                      }
                                      id={`location-${animal.id}-${location.id}`}
                                      disabled={!canEdit}
                                    />
                                    <label
                                      htmlFor={`location-${animal.id}-${location.id}`}
                                      className="text-xs text-gray-600 font-medium cursor-pointer"
                                    >
                                      {location.name} ({location.bodyRegion})
                                    </label>
                                  </div>
                                  
                                  {selection.selectedAnatomicalLocations?.[
                                    location.id
                                  ] && (
                                    <div className="ml-6 space-y-2">
                                      <div className="flex items-center gap-1 flex-wrap">
                                        <Button
                                          variant={
                                            selection.anatomicalPercentages?.[
                                              location.id
                                            ] === 20
                                              ? "default"
                                              : "outline"
                                          }
                                          size="sm"
                                          onClick={() =>
                                            handleAnatomicalPercentage(
                                              animalId,
                                              location.id,
                                              20
                                            )
                                          }
                                          disabled={!canEdit}
                                          className={`h-7 px-2 text-xs ${
                                            selection.anatomicalPercentages?.[
                                              location.id
                                            ] === 20
                                              ? "bg-blue-600 hover:bg-blue-700"
                                              : ""
                                          }`}
                                        >
                                          20%
                                        </Button>
                                        <Button
                                          variant={
                                            selection.anatomicalPercentages?.[
                                              location.id
                                            ] === 40
                                              ? "default"
                                              : "outline"
                                          }
                                          size="sm"
                                          onClick={() =>
                                            handleAnatomicalPercentage(
                                              animalId,
                                              location.id,
                                              40
                                            )
                                          }
                                          disabled={!canEdit}
                                          className={`h-7 px-2 text-xs ${
                                            selection.anatomicalPercentages?.[
                                              location.id
                                            ] === 40
                                              ? "bg-blue-600 hover:bg-blue-700"
                                              : ""
                                          }`}
                                        >
                                          40%
                                        </Button>
                                        <Button
                                          variant={
                                            selection.anatomicalPercentages?.[
                                              location.id
                                            ] === 60
                                              ? "default"
                                              : "outline"
                                          }
                                          size="sm"
                                          onClick={() =>
                                            handleAnatomicalPercentage(
                                              animalId,
                                              location.id,
                                              60
                                            )
                                          }
                                          disabled={!canEdit}
                                          className={`h-7 px-2 text-xs ${
                                            selection.anatomicalPercentages?.[
                                              location.id
                                            ] === 60
                                              ? "bg-blue-600 hover:bg-blue-700"
                                              : ""
                                          }`}
                                        >
                                          60%
                                        </Button>
                                        <Input
                                          type="number"
                                          min="0"
                                          max="100"
                                          value={
                                            selection.anatomicalPercentages?.[
                                              location.id
                                            ] || 0
                                          }
                                          onChange={(e) =>
                                            handleAnatomicalPercentage(
                                              animalId,
                                              location.id,
                                              parseInt(e.target.value) || 0
                                            )
                                          }
                                          disabled={!canEdit}
                                          className="w-14 h-7 text-center bg-white text-xs"
                                        />
                                      </div>
                                      
                                      {/* Peso por ubicación anatómica */}
                                      {avgOrgansData?.data && (
                                        <div className="flex items-center gap-2">
                                          <div className="text-xs font-medium text-gray-700 whitespace-nowrap">
                                            Peso ({unitSymbol}):
                                          </div>
                                          {avgOrgansData.data.avgWeight && (
                                            <div className="text-xs text-gray-500 whitespace-nowrap">
                                              Sug: {avgOrgansData.data.avgWeight}
                                            </div>
                                          )}
                                          <Input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            placeholder="Peso"
                                            className="w-20 h-7 bg-white text-xs"
                                            value={
                                              selection.anatomicalWeights?.[
                                                location.id
                                              ] || ""
                                            }
                                            onChange={(e) =>
                                              handleAnatomicalWeight(
                                                animalId,
                                                location.id,
                                                parseFloat(e.target.value) || 0
                                              )
                                            }
                                            disabled={!canEdit}
                                          />
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              ))}
                              </div>
                            </div>
                          ) : (
                            /* Porcentaje de Afectación General (solo cuando NO hay ubicaciones anatómicas) */
                            <>
                              <div className="space-y-2">
                                <div className="text-xs font-medium text-gray-700">
                                  Porcentaje de Afectación (%) *
                                </div>
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant={
                                      selection.percentage === 20
                                        ? "default"
                                        : "outline"
                                    }
                                    size="sm"
                                    onClick={() =>
                                      handleAnimalPercentage(animalId, 20)
                                    }
                                    disabled={!canEdit}
                                    className={
                                      selection.percentage === 20
                                        ? "bg-blue-600 hover:bg-blue-700"
                                        : ""
                                    }
                                  >
                                    20%
                                  </Button>
                                  <Button
                                    variant={
                                      selection.percentage === 40
                                        ? "default"
                                        : "outline"
                                    }
                                    size="sm"
                                    onClick={() =>
                                      handleAnimalPercentage(animalId, 40)
                                    }
                                    disabled={!canEdit}
                                    className={
                                      selection.percentage === 40
                                        ? "bg-blue-600 hover:bg-blue-700"
                                        : ""
                                    }
                                  >
                                    40%
                                  </Button>
                                  <Button
                                    variant={
                                      selection.percentage === 60
                                        ? "default"
                                        : "outline"
                                    }
                                    size="sm"
                                    onClick={() =>
                                      handleAnimalPercentage(animalId, 60)
                                    }
                                    disabled={!canEdit}
                                    className={
                                      selection.percentage === 60
                                        ? "bg-blue-600 hover:bg-blue-700"
                                        : ""
                                    }
                                  >
                                    60%
                                  </Button>
                                  <Input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={selection.percentage || 0}
                                    onChange={(e) =>
                                      handleAnimalPercentage(
                                        animalId,
                                        parseInt(e.target.value) || 0
                                      )
                                    }
                                    disabled={!canEdit}
                                    className="w-20 h-8 text-center bg-gray-50"
                                  />
                                </div>
                              </div>

                              {/* Peso Aproximado - Solo si hay datos de avgOrgans y NO hay ubicaciones anatómicas */}
                              {avgOrgansData?.data && (
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2 whitespace-nowrap">
                                    <div className="text-xs font-medium text-gray-700">
                                      Peso Aprox. ({unitSymbol})
                                    </div>
                                    {avgOrgansData.data.avgWeight && (
                                      <div className="text-xs text-gray-500">
                                        Sug: {avgOrgansData.data.avgWeight} {unitSymbol}
                                      </div>
                                    )}
                                  </div>
                                  <div className="space-y-1">
                                    <Input
                                      type="number"
                                      step="0.01"
                                      min="0"
                                      placeholder="Peso"
                                      className="w-24 h-8 bg-white text-sm"
                                      value={selection.weight || ""}
                                      onChange={(e) =>
                                        handleAnimalWeight(
                                          animalId,
                                          parseFloat(e.target.value) || 0
                                        )
                                      }
                                      disabled={!canEdit}
                                    />
                                  </div>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isSavingOrUpdating}
          >
            {canEdit ? "Cancelar" : "Cerrar"}
          </Button>
          {canEdit && (
            <Button
              onClick={handleSave}
              disabled={selectedCount === 0 || isSavingOrUpdating}
              className="bg-teal-600 hover:bg-teal-700"
            >
              {isSavingOrUpdating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {hasExistingData ? "Actualizando..." : "Guardando..."}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {hasExistingData ? "Actualizar" : "Guardar"} ({selectedCount}{" "}
                  {selectedCount === 1 ? "animal" : "animales"})
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
