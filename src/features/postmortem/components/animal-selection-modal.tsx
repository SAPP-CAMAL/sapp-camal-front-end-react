"use client";

import { useState, useEffect, useRef } from "react";
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
import { Save, Loader2, Image as ImageIcon, Upload, X, ZoomIn } from "lucide-react";
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
import { uploadPostmortemImageService } from "../server/db/postmortem.service";
import { toast } from "sonner";
import { useMemo } from "react";
import { useUnitMeasure } from "@/features/animal-weighing/hooks/use-unit-measure";
import { Textarea } from "@/components/ui/textarea";

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

  const imageInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

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
        const anatomicalAdverseSituations: Record<number, string> = {};
        const anatomicalDiseaseComment: Record<number, string> = {};
        const selectedAnatomicalLocations: Record<number, boolean> = {};
        const anatomicalImagePreviews: Record<number, string | null> = {};

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
                String(savedForLocation.weight)
              );
              selectedAnatomicalLocations[location.id] = true; // Marcar como seleccionado
              anatomicalAdverseSituations[location.id] = savedForLocation.adverseSituation || "";
              anatomicalDiseaseComment[location.id] = savedForLocation.diseaseComment || "";
              anatomicalImagePreviews[location.id] = savedForLocation.urlImage || null;
            } else {
              // Valores por defecto
              anatomicalPercentages[location.id] = 40;
              anatomicalWeights[location.id] = avgOrgansData?.data?.avgWeight
                ? parseFloat(String(avgOrgansData.data.avgWeight))
                : 0;
              selectedAnatomicalLocations[location.id] = false;
              anatomicalAdverseSituations[location.id] = "";
              anatomicalDiseaseComment[location.id] = "";
              anatomicalImagePreviews[location.id] = null;
            }
          });
        }

        // Para el caso sin ubicaciones anatómicas, usar el primer subproducto encontrado
        const savedSubProduct = savedSubProducts[0];

        // Inicializar peso con el valor guardado o el promedio de la API
        const weight = savedSubProduct
          ? parseFloat(String(savedSubProduct.weight))
          : avgOrgansData?.data?.avgWeight
          ? parseFloat(String(avgOrgansData.data.avgWeight))
          : 0;

        return {
          animalId: animal.id.toString(),
          animalCode: animal.code,
          selected: savedSubProducts.length > 0, // Seleccionado si hay al menos un subproducto guardado
          percentage: savedSubProduct
            ? parseFloat(savedSubProduct.percentageAffection)
            : 40,
          weight,
          anatomicalPercentages,
          anatomicalWeights,
          anatomicalAdverseSituations,
          anatomicalDiseaseComment,
          adverseSituation: savedSubProduct?.adverseSituation || "",
          diseaseComment: savedSubProduct?.diseaseComment || "",
          selectedAnatomicalLocations,
          anatomicalImageFiles: {},
          anatomicalImagePreviews,
          existingImageUrl: savedSubProduct?.urlImage || savedData?.urlImage || null,
          imageFile: null,
          imagePreview: null,
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

  const handleAnatomicalAdverseSituations = (
    animalId: string,
    locationId: number,
    adverseSituation: string
  ) => {
    setAnimalSelections((prev) =>
      prev.map((animal) =>
        animal.animalId === animalId
          ? {
              ...animal,
              anatomicalAdverseSituations: {
                ...animal.anatomicalAdverseSituations,
                [locationId]: adverseSituation,
              },
            }
          : animal
      )
    );
  };

  const handleAnatomicalDiseaseComment = (
    animalId: string,
    locationId: number,
    diseaseComment: string
  ) => {
    setAnimalSelections((prev) =>
      prev.map((animal) =>
        animal.animalId === animalId
          ? {
              ...animal,
              anatomicalDiseaseComment: {
                ...animal.anatomicalDiseaseComment,
                [locationId]: diseaseComment,
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

  const handleAnimalImage = (animalId: string, file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setAnimalSelections((prev) =>
        prev.map((animal) =>
          animal.animalId === animalId
            ? { ...animal, imageFile: file, imagePreview: reader.result as string }
            : animal
        )
      );
    };
    reader.readAsDataURL(file);
  };

  const handleClearImage = (animalId: string) => {
    setAnimalSelections((prev) =>
      prev.map((animal) =>
        animal.animalId === animalId
          ? { ...animal, imageFile: null, imagePreview: null }
          : animal
      )
    );
    if (imageInputRefs.current[animalId]) {
      imageInputRefs.current[animalId]!.value = "";
    }
  };

  const handleAnatomicalImage = (animalId: string, locationId: number, file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setAnimalSelections((prev) =>
        prev.map((animal) =>
          animal.animalId === animalId
            ? {
                ...animal,
                anatomicalImageFiles: { ...animal.anatomicalImageFiles, [locationId]: file },
                anatomicalImagePreviews: { ...animal.anatomicalImagePreviews, [locationId]: reader.result as string },
              }
            : animal
        )
      );
    };
    reader.readAsDataURL(file);
  };

  const handleClearAnatomicalImage = (animalId: string, locationId: number) => {
    setAnimalSelections((prev) =>
      prev.map((animal) =>
        animal.animalId === animalId
          ? {
              ...animal,
              anatomicalImageFiles: { ...animal.anatomicalImageFiles, [locationId]: null },
              anatomicalImagePreviews: { ...animal.anatomicalImagePreviews, [locationId]: null },
            }
          : animal
      )
    );
    const key = `${animalId}-loc-${locationId}`;
    if (imageInputRefs.current[key]) {
      imageInputRefs.current[key]!.value = "";
    }
  };

  const handleSave = () => {
    // Detectar solo los animales que fueron MODIFICADOS
    const modifiedAnimals = animalSelections.filter((current) => {
      const initial = initialSelections.find(
        (i) => i.animalId === current.animalId
      );

      // Si no existía inicialmente y ahora está seleccionado -> modificado
      if (!initial && current.selected) return true;

      // Si existía y cambió la selección o el porcentaje -> modificado o situación adversa o comentario de enfermedad
      if (
        initial &&
        (initial.selected !== current.selected ||
          initial.percentage !== current.percentage ||
          initial.weight !== current.weight ||
          initial.adverseSituation !== current.adverseSituation ||
          initial.diseaseComment !== current.diseaseComment ||
          initial.imagePreview !== current.imagePreview)
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

          // Verificar si cambió la situación adversa de la ubicación
          if (
            initial.anatomicalAdverseSituations?.[locationId] !==
            current.anatomicalAdverseSituations?.[locationId]
          ) {
            return true;
          }

          // Verificar si cambió el comentario de la enfermedad de la ubicación
          if (
            initial.anatomicalDiseaseComment?.[locationId] !==
            current.anatomicalDiseaseComment?.[locationId]
          ) {
            return true;
          }

          // Verificar si cambió la imagen de la ubicación
          if (
            initial.anatomicalImagePreviews?.[locationId] !==
            current.anatomicalImagePreviews?.[locationId]
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

      if (anatomicalLocationsData?.data && anatomicalLocationsData.data.length > 0) {
        // Si hay ubicaciones anatómicas, crear un SubProductPostmortem solo para ubicaciones NUEVAS o MODIFICADAS
        anatomicalLocationsData.data.forEach(location => {
          const isCurrentlySelected = animal.selectedAnatomicalLocations?.[location.id];
          const wasInitiallySelected = initialAnimal?.selectedAnatomicalLocations?.[location.id];

          // Solo incluir si:
          // 1. Está seleccionada actualmente Y no estaba seleccionada antes (NUEVA)
          // 2. Está seleccionada actualmente Y estaba seleccionada antes pero cambió algo (MODIFICADA)
          if (isCurrentlySelected) {
            const hasChanged =
              !wasInitiallySelected || // Es nueva
              initialAnimal?.anatomicalPercentages?.[location.id] !== animal.anatomicalPercentages?.[location.id] || // Cambió porcentaje
              initialAnimal?.anatomicalWeights?.[location.id] !== animal.anatomicalWeights?.[location.id] || // Cambió peso
              initialAnimal?.anatomicalAdverseSituations?.[location.id] !== animal.anatomicalAdverseSituations?.[location.id] || // Cambió situación adversa
              initialAnimal?.anatomicalDiseaseComment?.[location.id] !== animal.anatomicalDiseaseComment?.[location.id] || // Cambió comentario enfermedad
              initialAnimal?.anatomicalImagePreviews?.[location.id] !== animal.anatomicalImagePreviews?.[location.id]; // Cambió imagen

            if (hasChanged) {
              const adverseSituation = animal?.anatomicalAdverseSituations?.[location.id] ?? '';
              const diseaseComment = animal?.anatomicalDiseaseComment?.[location.id] ?? '';

              // Validate if patologia is 'OTROS', adverseSituation is required
              if (patologia?.toUpperCase() === 'OTROS' && adverseSituation.length === 0) {
                toast.error(`Ingrese la situación adversa para el animal #${animal.animalCode}`);
                return;
              }

              subProductsPostmortem.push({
                idSpeciesDisease: idSpeciesDisease,
                presence: 1,
                percentageAffection: animal.anatomicalPercentages?.[location.id] || 0,
                weight: animal.anatomicalWeights?.[location.id] || 0,
                adverseSituation: adverseSituation.length > 0 ? adverseSituation : undefined,
                diseaseComment: diseaseComment.length > 0 ? diseaseComment : undefined,
                status: true,
                idProductAnatomicalLocation: location.id,
                image: animal.anatomicalImagePreviews?.[location.id] ?? undefined,
              });
            }
          }
        });

				// Validar que haya al menos un cambio para enviar
				if (subProductsPostmortem.length === 0) {
					// Verificar si hay al menos una ubicación seleccionada
					const hasAnySelected = anatomicalLocationsData.data.some(location => animal.selectedAnatomicalLocations?.[location.id]);

					if (!hasAnySelected) {
						toast.error(
							`Debe seleccionar al menos una ubicación anatómica para el animal #${
								animalsData?.data?.find(a => a.id.toString() === animal.animalId)?.code
							}`,
						);
						return;
					}
					// Si hay ubicaciones seleccionadas pero no hay cambios, no hacer nada para este animal
					processedCount++;
					return;
				}
			} else {
				// Si NO hay ubicaciones anatómicas, usar el formato anterior

				// Validate if patologia is 'OTROS', adverseSituation is required
				if (patologia?.toUpperCase() === 'OTROS' && animal?.adverseSituation?.length === 0) {
					toast.error(`Ingrese la situación adversa para el animal #${animal.animalCode}`);
					return;
				}

				subProductsPostmortem = [
					{
						idSpeciesDisease: idSpeciesDisease,
						presence: 1,
						percentageAffection: animal.percentage,
						weight: animal.weight || 0,
						adverseSituation: animal.adverseSituation?.length > 0 ? animal.adverseSituation : undefined,
						diseaseComment: animal.diseaseComment?.length > 0 ? animal.diseaseComment : undefined,
						status: true,
						image: animal.imagePreview ?? animal.existingImageUrl ?? undefined,
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
              if (animal.imageFile && existingPostmortem?.id) {
                uploadPostmortemImageService(existingPostmortem.id, animal.imageFile).catch(() => {});
              }
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
            onSuccess: (response: any) => {
              const newId = response?.data?.id;
              if (animal.imageFile && newId) {
                uploadPostmortemImageService(newId, animal.imageFile).catch(() => {});
              }
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
          animalCode: animal.code,
          selected: false,
          percentage: 40,
          adverseSituation: "",
          diseaseComment: "",
        }))
      );
    }
    setGeneralPercentage("40");
    onClose();
  };

  const selectedCount = animalSelections.filter((a) => a.selected).length;

  return (
    <>
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
            <div className="space-y-2 max-h-100 overflow-y-auto scrollbar-hide">
              {animalsData.data.map((animal) => {
                const animalId = animal.id.toString();
                const selection = animalSelections.find(
                  (s) => s.animalId === animalId
                );
                if (!selection) return null;

                // Determinar el sexo del animal
                const sexLabel = animal.idAnimalSex === 1 ? "Hembra" : "Macho";

                return (
									<div key={animal.id} className='border rounded-lg p-4 space-y-3 bg-white'>
										<div className='flex items-center gap-3'>
											<Checkbox
												checked={selection.selected}
												onCheckedChange={() => handleAnimalToggle(animalId)}
												id={`animal-${animal.id}`}
												disabled={!canEdit}
											/>
											<label htmlFor={`animal-${animal.id}`} className='flex items-center gap-3 cursor-pointer flex-1'>
												<div className='flex items-center justify-center w-12 h-12 bg-gray-100 rounded-lg'>
													<span className='font-mono text-sm font-semibold'>{animal.code}</span>
												</div>
												<div className='flex flex-col'>
													<span className='text-sm text-gray-600'>Animal #{animal.code}</span>
													<span className='text-xs text-gray-500'>{sexLabel}</span>
												</div>
											</label>
										</div>

										{selection.selected && (
											<div className='ml-14 space-y-3'>
												<div className='flex gap-3 items-start'>
													{/* Ubicaciones Anatómicas (si existen) - SOLO mostrar estas */}
													{anatomicalLocationsData?.data && anatomicalLocationsData.data.length > 0 ? (
														<div className='space-y-2 w-full'>
															<div className='text-xs font-medium text-gray-700'>Ubicaciones Anatómicas</div>
															<div className='grid grid-cols-1 gap-2'>
																{anatomicalLocationsData.data.map(location => (
																	<div key={location.id} className='space-y-2 bg-gray-50 p-3 rounded border'>
																		<div className='flex items-center gap-2'>
																			<Checkbox
																				checked={selection.selectedAnatomicalLocations?.[location.id] || false}
																				onCheckedChange={() => handleAnatomicalLocationToggle(animalId, location.id)}
																				id={`location-${animal.id}-${location.id}`}
																				disabled={!canEdit}
																			/>
																			<label
																				htmlFor={`location-${animal.id}-${location.id}`}
																				className='text-xs text-gray-600 font-medium cursor-pointer'
																			>
																				{location.name} ({location.bodyRegion})
																			</label>
																		</div>

																		{selection.selectedAnatomicalLocations?.[location.id] && (
																			<div className='ml-6 space-y-2'>
																				<div className='flex gap-3 items-start'>
																					<div className='flex-1 min-w-0 space-y-2'>
																						<div className='flex items-center gap-1 flex-wrap'>
																							<Button
																								variant={selection.anatomicalPercentages?.[location.id] === 20 ? 'default' : 'outline'}
																								size='sm'
																								onClick={() => handleAnatomicalPercentage(animalId, location.id, 20)}
																								disabled={!canEdit}
																								className={`h-7 px-2 text-xs ${
																									selection.anatomicalPercentages?.[location.id] === 20 ? 'bg-blue-600 hover:bg-blue-700' : ''
																								}`}
																							>
																								20%
																							</Button>
																							<Button
																								variant={selection.anatomicalPercentages?.[location.id] === 40 ? 'default' : 'outline'}
																								size='sm'
																								onClick={() => handleAnatomicalPercentage(animalId, location.id, 40)}
																								disabled={!canEdit}
																								className={`h-7 px-2 text-xs ${
																									selection.anatomicalPercentages?.[location.id] === 40 ? 'bg-blue-600 hover:bg-blue-700' : ''
																								}`}
																							>
																								40%
																							</Button>
																							<Button
																								variant={selection.anatomicalPercentages?.[location.id] === 60 ? 'default' : 'outline'}
																								size='sm'
																								onClick={() => handleAnatomicalPercentage(animalId, location.id, 60)}
																								disabled={!canEdit}
																								className={`h-7 px-2 text-xs ${
																									selection.anatomicalPercentages?.[location.id] === 60 ? 'bg-blue-600 hover:bg-blue-700' : ''
																								}`}
																							>
																								60%
																							</Button>
																							<Input
																								type='number'
																								min='0'
																								max='100'
																								value={selection.anatomicalPercentages?.[location.id] ?? 0}
																								onChange={e => handleAnatomicalPercentage(animalId, location.id, parseInt(e.target.value) || 0)}
																								disabled={!canEdit}
																								className='w-14 h-7 text-center bg-white text-xs'
																							/>
																						</div>
																						{avgOrgansData?.data && (
																							<div className='flex items-center gap-2'>
																								<div className='text-xs font-medium text-gray-700 whitespace-nowrap'>Peso ({unitSymbol}):</div>
																								{avgOrgansData.data.avgWeight && (
																									<div className='text-xs text-gray-500 whitespace-nowrap'>Sug: {avgOrgansData.data.avgWeight}</div>
																								)}
																								<Input
																									type='number'
																									step='0.01'
																									min='0'
																									placeholder='Peso'
																									className='w-20 h-7 bg-white text-xs'
																									value={selection.anatomicalWeights?.[location.id] ?? ''}
																									onChange={e => handleAnatomicalWeight(animalId, location.id, parseFloat(e.target.value) || 0)}
																									disabled={!canEdit}
																								/>
																							</div>
																						)}
																						<div className='flex flex-col gap-2 mt-2'>
																							{patologia?.toUpperCase() === 'OTROS' && (
																								<label className='text-xs font-medium text-gray-700'>
																									Situación adversa *
																									<Textarea
																										className='w-full bg-white text-xs'
																										placeholder='Situación adversa'
																										value={selection.anatomicalAdverseSituations?.[location.id] ?? ''}
																										onChange={e => {
																											handleAnatomicalAdverseSituations(animalId, location.id, e.target.value);
																											const textarea = e.target;
																											textarea.style.height = 'auto';
																											textarea.style.height = textarea.scrollHeight + 'px';
																										}}
																										style={{ minHeight: '20px', overflow: 'hidden' }}
																										required
																									/>
																								</label>
																							)}
																							<label className='text-xs font-medium text-gray-700'>
																								Observación (Opcional)
																								<Textarea
																									placeholder='Observación'
																									className='w-full bg-white text-xs'
																									value={selection.anatomicalDiseaseComment?.[location.id] ?? ''}
																									onChange={e => {
																										handleAnatomicalDiseaseComment(animalId, location.id, e.target.value);
																										const textarea = e.target;
																										textarea.style.height = 'auto';
																										textarea.style.height = textarea.scrollHeight + 'px';
																									}}
																									style={{ minHeight: '20px', overflow: 'hidden' }}
																								/>
																							</label>
																						</div>
																					</div>
																					<div className="shrink-0 flex flex-col items-center gap-1">
																						<div className="flex items-center gap-1 text-xs font-medium text-gray-500">
																							<ImageIcon className="h-3 w-3 text-teal-600" />
																							<span>Imagen</span>
																						</div>
																						<input
																							ref={(el) => { imageInputRefs.current[`${animalId}-loc-${location.id}`] = el; }}
																							type="file"
																							accept="image/*"
																							className="hidden"
																							onChange={(e) => {
																								const file = e.target.files?.[0];
																								if (file) handleAnatomicalImage(animalId, location.id, file);
																							}}
																						/>
																						{selection.anatomicalImagePreviews?.[location.id] ? (
																							<div className="flex flex-col items-center gap-1">
																								<div
																									className="w-16 h-16 rounded-lg overflow-hidden border bg-gray-50 cursor-pointer relative"
																									onClick={() => {
																										const url = selection.anatomicalImagePreviews?.[location.id];
																										if (url) setPreviewImageUrl(url);
																									}}
																									onMouseEnter={e => {
																										const overlay = e.currentTarget.querySelector('[data-overlay]') as HTMLElement | null;
																										if (overlay) overlay.style.opacity = '1';
																									}}
																									onMouseLeave={e => {
																										const overlay = e.currentTarget.querySelector('[data-overlay]') as HTMLElement | null;
																										if (overlay) overlay.style.opacity = '0';
																									}}
																									title="Ver imagen completa"
																								>
																									<img src={selection.anatomicalImagePreviews?.[location.id] || ""} alt="Vista previa" className="w-full h-full object-cover" />
																									<div data-overlay="true" className="absolute inset-0 bg-black/30 flex items-center justify-center rounded-lg transition-opacity" style={{ opacity: 0 }}>
																										<ZoomIn className="h-4 w-4 text-white" />
																									</div>
																								</div>
																								<div className="flex gap-1">
																									<Button type="button" variant="outline" size="sm" className="h-6 px-2" onClick={() => imageInputRefs.current[`${animalId}-loc-${location.id}`]?.click()} disabled={!canEdit}>
																										<Upload className="h-3 w-3" />
																									</Button>
																									<Button type="button" variant="outline" size="sm" className="h-6 px-2 text-red-600 border-red-200 hover:bg-red-50" onClick={() => handleClearAnatomicalImage(animalId, location.id)} disabled={!canEdit}>
																										<X className="h-3 w-3" />
																									</Button>
																								</div>
																							</div>
																						) : (
																							<button
																								type="button"
																								onClick={() => canEdit && imageInputRefs.current[`${animalId}-loc-${location.id}`]?.click()}
																								disabled={!canEdit}
																								className="w-16 h-16 flex flex-col items-center justify-center gap-1 border-2 border-dashed border-gray-200 rounded-lg text-xs text-gray-400 hover:border-teal-400 hover:text-teal-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
																							>
																								<Upload className="h-4 w-4" />
																								<span>Imagen</span>
																							</button>
																						)}
																					</div>
																				</div>
																			</div>
																		)}
																	</div>
																))}
															</div>
														</div>
													) : (
														/* Porcentaje de Afectación General (solo cuando NO hay ubicaciones anatómicas) */
														<div className='flex flex-col gap-2 w-full'>
															<div className='space-y-2 flex flex-col md:flex-row gap-2'>
																<div className='flex flex-col gap-2'>
																	<div className='text-xs font-medium text-gray-700'>Porcentaje de Afectación (%) *</div>
																	<div className='flex items-center gap-2'>
																		<Button
																			variant={selection.percentage === 20 ? 'default' : 'outline'}
																			size='sm'
																			onClick={() => handleAnimalPercentage(animalId, 20)}
																			disabled={!canEdit}
																			className={selection.percentage === 20 ? 'bg-blue-600 hover:bg-blue-700' : ''}
																		>
																			20%
																		</Button>
																		<Button
																			variant={selection.percentage === 40 ? 'default' : 'outline'}
																			size='sm'
																			onClick={() => handleAnimalPercentage(animalId, 40)}
																			disabled={!canEdit}
																			className={selection.percentage === 40 ? 'bg-blue-600 hover:bg-blue-700' : ''}
																		>
																			40%
																		</Button>
																		<Button
																			variant={selection.percentage === 60 ? 'default' : 'outline'}
																			size='sm'
																			onClick={() => handleAnimalPercentage(animalId, 60)}
																			disabled={!canEdit}
																			className={selection.percentage === 60 ? 'bg-blue-600 hover:bg-blue-700' : ''}
																		>
																			60%
																		</Button>
																		<Input
																			type='number'
																			min='0'
																			max='100'
																			value={selection.percentage ?? 0}
																			onChange={e => handleAnimalPercentage(animalId, parseInt(e.target.value) || 0)}
																			disabled={!canEdit}
																			className='w-20 h-8 text-center bg-gray-50'
																		/>
																	</div>{' '}
																</div>

																{/* Peso Aproximado - Solo si hay datos de avgOrgans y NO hay ubicaciones anatómicas */}
																{avgOrgansData?.data && (
																	<div className='space-y-2'>
																		<div className='flex items-center gap-2 whitespace-nowrap'>
																			<div className='text-xs font-medium text-gray-700'>Peso Aprox. ({unitSymbol})</div>
																			{avgOrgansData.data.avgWeight && (
																				<div className='text-xs text-gray-500'>
																					Sug: {avgOrgansData.data.avgWeight} {unitSymbol}
																				</div>
																			)}
																		</div>
																		<div className='space-y-1'>
																			<Input
																				type='number'
																				step='0.01'
																				min='0'
																				placeholder='Peso'
																				className='w-24 h-8 bg-white text-sm'
																				value={selection.weight ?? ''}
																				onChange={e => handleAnimalWeight(animalId, parseFloat(e.target.value) || 0)}
																				disabled={!canEdit}
																			/>
																		</div>
																	</div>
																)}
															</div>

															{/* Inputs de observaciones para cada animal seleccionado */}
															<div key={selection.animalId} className='space-y-2'>
																{patologia?.toUpperCase() === 'OTROS' && (
																	<label className='text-xs font-medium text-gray-700'>
																		Situación adversa *
																		<Textarea
																			placeholder='Situación adversa'
																			className='w-full bg-white text-xs'
																			required
																			value={selection.adverseSituation ?? ''}
																			onChange={e => {
																				if (!canEdit) return;
																				setAnimalSelections(prev =>
																					prev.map(sel =>
																						sel.animalId === selection.animalId
																							? {
																									...sel,
																									adverseSituation: e.target.value,
																								}
																							: sel,
																					),
																				);
																				const textarea = e.target as HTMLTextAreaElement;
																				textarea.style.height = 'auto';
																				textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
																			}}
																			style={{
																				minHeight: '60px',
																				maxHeight: '120px',
																				overflow: 'auto',
																				wordWrap: 'break-word',
																				whiteSpace: 'pre-wrap',
																				wordBreak: 'break-word',
																			}}
																		/>
																	</label>
																)}

																<label className='text-xs font-medium text-gray-700'>
																	Observación (Opcional)
																	<Textarea
																		placeholder='Observación'
																		className='w-full bg-white text-xs'
																		value={selection.diseaseComment ?? ''}
																		onChange={e => {
																			if (!canEdit) return;
																			setAnimalSelections(prev =>
																				prev.map(sel =>
																					sel.animalId === selection.animalId
																						? {
																								...sel,
																								diseaseComment: e.target.value,
																							}
																						: sel,
																				),
																			);
																			const textarea = e.target as HTMLTextAreaElement;
																			textarea.style.height = 'auto';
																			textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
																		}}
																		style={{
																			minHeight: '60px',
																			maxHeight: '120px',
																			overflow: 'auto',
																			wordWrap: 'break-word',
																			whiteSpace: 'pre-wrap',
																			wordBreak: 'break-word',
																		}}
																	/>
																</label>
															</div>

															{/* Imagen (No anatómica) */}
															<div className="shrink-0 flex flex-col items-center gap-1 self-start">
																<div className="flex items-center gap-1 text-xs font-medium text-gray-500">
																	<ImageIcon className="h-3 w-3 text-teal-600" />
																	<span>Imagen</span>
																</div>
																<input
																	ref={(el) => { imageInputRefs.current[animalId] = el; }}
																	type="file"
																	accept="image/*"
																	className="hidden"
																	onChange={(e) => {
																		const file = e.target.files?.[0];
																		if (file) handleAnimalImage(animalId, file);
																	}}
																/>
																{(selection.imagePreview || selection.existingImageUrl) ? (
																	<div className="flex flex-col items-center gap-1">
																		<div
																			className="w-16 h-16 rounded-lg overflow-hidden border bg-gray-50 cursor-pointer relative"
																			onClick={() => {
																				const url = selection.imagePreview || selection.existingImageUrl;
																				if (url) setPreviewImageUrl(url);
																			}}
																			onMouseEnter={e => {
																				const overlay = e.currentTarget.querySelector('[data-overlay]') as HTMLElement | null;
																				if (overlay) overlay.style.opacity = '1';
																			}}
																			onMouseLeave={e => {
																				const overlay = e.currentTarget.querySelector('[data-overlay]') as HTMLElement | null;
																				if (overlay) overlay.style.opacity = '0';
																			}}
																			title="Ver imagen completa"
																		>
																			<img src={selection.imagePreview || selection.existingImageUrl || ""} alt="Vista previa" className="w-full h-full object-cover" />
																			<div data-overlay="true" className="absolute inset-0 bg-black/30 flex items-center justify-center rounded-lg transition-opacity" style={{ opacity: 0 }}>
																				<ZoomIn className="h-4 w-4 text-white" />
																			</div>
																		</div>
																		<div className="flex gap-1">
																			<Button type="button" variant="outline" size="sm" className="h-6 px-2" onClick={() => imageInputRefs.current[animalId]?.click()} disabled={!canEdit}>
																				<Upload className="h-3 w-3" />
																			</Button>
																			<Button type="button" variant="outline" size="sm" className="h-6 px-2 text-red-600 border-red-200 hover:bg-red-50" onClick={() => handleClearImage(animalId)} disabled={!canEdit}>
																				<X className="h-3 w-3" />
																			</Button>
																		</div>
																	</div>
																) : (
																	<button
																		type="button"
																		onClick={() => canEdit && imageInputRefs.current[animalId]?.click()}
																		disabled={!canEdit}
																		className="w-16 h-16 flex flex-col items-center justify-center gap-1 border-2 border-dashed border-gray-200 rounded-lg text-xs text-gray-400 hover:border-teal-400 hover:text-teal-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
																	>
																		<Upload className="h-4 w-4" />
																		<span>Imagen</span>
																	</button>
																)}
															</div>
														</div>
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

    {/* Lightbox - visor de imagen completa */}
    <Dialog open={!!previewImageUrl} onOpenChange={() => setPreviewImageUrl(null)}>
      <DialogContent className="max-w-[95vw] sm:max-w-3xl p-2">
        <DialogHeader className="pb-1">
          <DialogTitle className="flex items-center gap-2 text-sm">
            <ImageIcon className="h-4 w-4 text-teal-600" />
            Imagen del animal
          </DialogTitle>
        </DialogHeader>
        {previewImageUrl && (
          <div className="flex items-center justify-center bg-gray-900 rounded-lg overflow-hidden">
            <img
              src={previewImageUrl}
              alt="Imagen completa"
              className="max-h-[75vh] max-w-full object-contain"
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
    </>
  );
}
