"use client";

import { useState, useEffect, useMemo } from "react";
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
import { Loader2, Info, Save } from "lucide-react";
import { useAnimalsByBrand } from "../hooks/use-animals-by-brand";
import { useBodyParts } from "../hooks/use-body-parts";
import { useSavePostmortem } from "../hooks/use-save-postmortem";
import { usePostmortemByBrand } from "../hooks/use-postmortem-by-brand";
import type { ProductPostmortem } from "../domain/save-postmortem.types";
import { toast } from "sonner";
import { useUnitMeasure } from "@/features/animal-weighing/hooks/use-unit-measure";
import { Textarea } from "@/components/ui/textarea";

type BodyPartSelection = {
  id: number;
  code: string;
  description: string;
  selected: boolean;
  weight: string;
  bodyPartComment?: string;
};

type AnimalPartSelection = {
  animalId: string;
  selected: boolean;
  bodyParts: BodyPartSelection[];
  hasTotalConfiscation?: boolean; // Flag para bloquear si tiene decomiso total
};

type PartialConfiscationModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (selectedCount: number) => void;
  introductor: string;
  localizacion: string;
  certId: number | null;
  canEdit?: boolean; // Nueva prop para controlar si se puede editar
};

export function PartialConfiscationModal({
  isOpen,
  onClose,
  onSave,
  introductor,
  localizacion,
  certId,
  canEdit = true, // Por defecto true para mantener compatibilidad
}: PartialConfiscationModalProps) {
  const { data: animalsData, isLoading: isLoadingAnimals } =
    useAnimalsByBrand(certId);
  const { data: bodyPartsData, isLoading: isLoadingBodyParts } = useBodyParts();
  const { mutate: savePostmortem, isPending: isSaving } = useSavePostmortem();

  // Obtener datos guardados de postmortem
  const { data: postmortemData } = usePostmortemByBrand(certId);

  // Obtener unidad de medida desde la API
  const { data: unitMeasureData } = useUnitMeasure();
  const unitSymbol = unitMeasureData?.data?.symbol || "kg";
  const isSavingOrUpdating = isSaving;

  // Verificar si ya existen datos guardados de decomiso parcial
  const hasExistingData = useMemo(() => {
    if (!postmortemData?.data) return false;

    return postmortemData.data.some((item) =>
      item.productPostmortem.some((prod) => prod.isTotalConfiscation === false)
    );
  }, [postmortemData]);

  const [animalSelections, setAnimalSelections] = useState<
    AnimalPartSelection[]
  >([]);

  // Trackear los valores iniciales para detectar cambios
  const [initialSelections, setInitialSelections] = useState<
    AnimalPartSelection[]
  >([]);

  // Ordenar partes del cuerpo: primero Miembros, luego Áreas
  const sortedBodyParts = useMemo(() => {
    if (!bodyPartsData?.data) return [];

    return [...bodyPartsData.data].sort((a, b) => {
      // Primero ordenar por tipo (Miembro = 1, Área = 2)
      if (a.idPartType !== b.idPartType) {
        return a.idPartType - b.idPartType;
      }
      // Dentro del mismo tipo, ordenar por ID
      return a.id - b.id;
    });
  }, [bodyPartsData]);

  useEffect(() => {
    if (animalsData?.data && sortedBodyParts.length > 0) {
      const selections = animalsData.data.map((animal) => {
        // Buscar si este animal ya tiene datos guardados de postmortem
        const savedData = postmortemData?.data?.find(
          (item) => item.idDetailsSpeciesCertificate === animal.id
        );

        // Verificar si tiene decomiso total (esto bloquea el animal)
        const hasTotalConfiscation = savedData?.productPostmortem?.some(
          (prod) => prod.isTotalConfiscation === true
        );

        const savedProducts =
          savedData?.productPostmortem.filter(
            (prod) => prod.isTotalConfiscation === false
          ) || [];

        const bodyParts = sortedBodyParts.map((part) => {
          const savedPart = savedProducts.find(
            (prod) => prod.idBodyPart === part.id
          );

          return {
            id: part.id,
            code: part.code,
            description: part.description,
            selected: !!savedPart,
            bodyPartComment: savedPart?.bodyPartComment || "",
            weight: savedPart ? String(savedPart.weight) : "",
          };
        });

        return {
          animalId: animal.id.toString(),
          selected: savedProducts.length > 0,
          bodyParts,
          hasTotalConfiscation, // Agregar flag para bloquear
        };
      });

      setAnimalSelections(selections);
      setInitialSelections(JSON.parse(JSON.stringify(selections))); // Copia profunda
    }
  }, [animalsData, sortedBodyParts, postmortemData]);

  const isLoading = isLoadingAnimals || isLoadingBodyParts;

  const handleAnimalToggle = (animalId: string) => {
    setAnimalSelections((prev) =>
      prev.map((animal) =>
        animal.animalId === animalId
          ? { ...animal, selected: !animal.selected }
          : animal
      )
    );
  };

  const handleBodyPartToggle = (animalId: string, partId: number) => {
    setAnimalSelections((prev) =>
      prev.map((animal) =>
        animal.animalId === animalId
          ? {
              ...animal,
              bodyParts: animal.bodyParts.map((part) =>
                part.id === partId
                  ? { ...part, selected: !part.selected }
                  : part
              ),
            }
          : animal
      )
    );
  };

  const handleBodyPartWeight = (
    animalId: string,
    partId: number,
    weight: string
  ) => {
    setAnimalSelections((prev) =>
      prev.map((animal) =>
        animal.animalId === animalId
          ? {
              ...animal,
              bodyParts: animal.bodyParts.map((part) =>
                part.id === partId ? { ...part, weight } : part
              ),
            }
          : animal
      )
    );
  };

  const handleBodyPartComment = (
    animalId: string,
    partId: number,
    bodyPartComment: string
  ) => {
    setAnimalSelections((prev) =>
      prev.map((animal) =>
        animal.animalId === animalId
          ? {
              ...animal,
              bodyParts: animal.bodyParts.map((part) =>
                part.id === partId ? { ...part, bodyPartComment } : part
              ),
            }
          : animal
      )
    );
  };

  const handleCancel = () => {
    if (animalsData?.data && sortedBodyParts.length > 0) {
      setAnimalSelections(
        animalsData.data.map((animal) => ({
          animalId: animal.id.toString(),
          selected: false,
          bodyParts: sortedBodyParts.map((part) => ({
            id: part.id,
            code: part.code,
            description: part.description,
            selected: false,
            weight: "",
          })),
        }))
      );
    }
    onClose();
  };

  const selectedCount = animalSelections.filter((a) => a.selected).length;

  const hasModifications = useMemo(() => {
    if (animalSelections.length === 0 || initialSelections.length === 0) return false;

    return animalSelections.some((current) => {
      const initial = initialSelections.find(
        (i) => i.animalId === current.animalId
      );

      if (!initial && current.selected) return true;

      if (initial && initial.selected !== current.selected) return true;

      // Verificar cambios en las partes
      if (initial) {
        for (let i = 0; i < current.bodyParts.length; i++) {
          const currentPart = current.bodyParts[i];
          const initialPart = initial.bodyParts.find(p => p.id === currentPart.id);

          if (!initialPart && currentPart.selected) return true;
          if (initialPart) {
            if (initialPart.selected !== currentPart.selected) return true;
            if (currentPart.selected && (initialPart.weight !== currentPart.weight || initialPart.bodyPartComment !== currentPart.bodyPartComment)) return true;
          }
        }
      }

      return false;
    });
  }, [animalSelections, initialSelections]);

  const handleSaveAll = () => {
    // Identificar animales modificados (incluyendo los que se desmarcaron)
    const modifiedAnimals = animalSelections.filter((current) => {
      const initial = initialSelections.find((i) => i.animalId === current.animalId);
      if (!initial) return current.selected;
      
      // Si cambió el estado de selección del animal
      if (initial.selected !== current.selected) return true;
      
      // Si el animal sigue seleccionado, verificar si cambiaron sus partes
      if (current.selected) {
        return current.bodyParts.some(part => {
          const initialPart = initial.bodyParts.find(p => p.id === part.id);
          if (!initialPart) return part.selected;
          return part.selected !== initialPart.selected || 
                 (part.selected && (part.weight !== initialPart.weight || part.bodyPartComment !== initialPart.bodyPartComment));
        });
      }
      return false;
    });

    if (modifiedAnimals.length === 0) {
      toast.info("No hay cambios para guardar");
      return;
    }

    // Validar que cada animal que se mantiene seleccionado tenga al menos una parte con peso
    const invalidAnimals = modifiedAnimals.filter((animal) => {
      if (!animal.selected) return false;
      const partsWithWeight = animal.bodyParts.filter(
        (part) => part.selected && part.weight
      );
      return partsWithWeight.length === 0;
    });

    if (invalidAnimals.length > 0) {
      toast.error(
        "Cada animal seleccionado debe tener al menos una parte con peso"
      );
      return;
    }

    // Guardar cada animal modificado
    let processedCount = 0;
    const totalToProcess = modifiedAnimals.length;

    modifiedAnimals.forEach((animal) => {
      const existingPostmortem = postmortemData?.data?.find(
        (item) => item.idDetailsSpeciesCertificate === parseInt(animal.animalId)
      );

      // Si se desmarcó el animal completo, desactivar sus decomisos parciales
      if (!animal.selected) {
        if (!existingPostmortem) {
          processedCount++;
          if (processedCount === totalToProcess) {
            toast.success(`Se actualizaron ${totalToProcess} animales correctamente`);
            onSave(selectedCount);
            onClose();
          }
          return;
        }

        const initialAnimal = initialSelections.find(i => i.animalId === animal.animalId);
        const productsPostmortem: ProductPostmortem[] = (initialAnimal?.bodyParts || [])
          .filter(p => p.selected)
          .map(p => ({
            idBodyPart: p.id,
            weight: parseFloat(p.weight) || 0,
            isTotalConfiscation: false,
            status: false,
            bodyPartComment: "",
          }));

        if (productsPostmortem.length === 0) {
          processedCount++;
          if (processedCount === totalToProcess) {
            toast.success(`Se actualizaron ${totalToProcess} animales correctamente`);
            onSave(selectedCount);
            onClose();
          }
          return;
        }

        savePostmortem(
          {
            idDetailsSpeciesCertificate: parseInt(animal.animalId),
            status: true,
            productsPostmortem,
          },
          {
            onSuccess: () => {
              processedCount++;
              if (processedCount === totalToProcess) {
                toast.success(`Se actualizaron ${totalToProcess} animales correctamente`);
                onSave(selectedCount);
                onClose();
              }
            },
            onError: (error) => {
              toast.error(`Error al actualizar animal ${animal.animalId}`);
              processedCount++;
            }
          }
        );
        return;
      }

      // Si el animal está seleccionado, enviar sus partes actuales
      const selectedParts = animal.bodyParts.filter(
        (part) => part.selected && part.weight
      );

      // También debemos incluir las partes que se desmarcaron para este animal
      const initialAnimal = initialSelections.find(i => i.animalId === animal.animalId);
      const deselectedParts = (initialAnimal?.bodyParts || [])
        .filter(p => p.selected && !animal.bodyParts.find(cp => cp.id === p.id)?.selected);

      const productsPostmortem: ProductPostmortem[] = [
        ...selectedParts.map(part => ({
          idBodyPart: part.id,
          weight: parseFloat(part.weight),
          isTotalConfiscation: false,
          status: true,
          bodyPartComment: (part?.bodyPartComment ?? "").trim(),
        })),
        ...deselectedParts.map(part => ({
          idBodyPart: part.id,
          weight: parseFloat(part.weight) || 0,
          isTotalConfiscation: false,
          status: false,
          bodyPartComment: "",
        }))
      ];

      savePostmortem(
        {
          idDetailsSpeciesCertificate: parseInt(animal.animalId),
          status: true,
          productsPostmortem,
        },
        {
          onSuccess: () => {
            processedCount++;
            if (processedCount === totalToProcess) {
              toast.success(`Se guardaron los cambios correctamente`);
              onSave(selectedCount);
              onClose();
            }
          },
          onError: (error: any) => {
            const msg = error?.response?.data?.message || error?.message;
            toast.error(`Error al guardar animal ${animal.animalId}${msg ? ': ' + msg : ''}`);
            processedCount++;
          },
        }
      );
    });
  };

  const getSelectedPartsInfo = (animalId: string) => {
    const animal = animalSelections.find((a) => a.animalId === animalId);
    if (!animal) return null;

    const selectedParts = animal.bodyParts.filter(
      (part) => part.selected && part.weight
    );
    if (selectedParts.length === 0) return null;

    return selectedParts;
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleCancel}>
      <DialogContent className="max-w-[95vw] sm:max-w-4xl max-h-[90vh] overflow-y-auto scrollbar-hide">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-full bg-teal-100 flex items-center justify-center">
              <Info className="h-4 w-4 text-teal-600" />
            </div>
            Gestión de Animales – Decomiso parcial
          </DialogTitle>
        </DialogHeader>

        {/* Header Info */}
        <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
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
            <div className="text-sm text-gray-600">Decomiso parcial</div>
          </div>
        </div>

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
            <div className="space-y-3 max-h-[500px] overflow-y-auto scrollbar-hide">
              {animalsData.data.map((animal) => {
                const animalId = animal.id.toString();
                const animalSelection = animalSelections.find(
                  (a) => a.animalId === animalId
                );
                if (!animalSelection) return null;

                return (
									<div
										key={animal.id}
										className={`border rounded-lg p-4 space-y-3 ${
											animalSelection.hasTotalConfiscation ? 'bg-red-50 border-red-200 opacity-60' : 'bg-white'
										}`}
									>
										<div className='flex items-center gap-3'>
											<Checkbox
												checked={animalSelection.selected}
												onCheckedChange={() => handleAnimalToggle(animalId)}
												id={`animal-${animal.id}`}
												disabled={animalSelection.hasTotalConfiscation || !canEdit}
											/>
											<label
												htmlFor={`animal-${animal.id}`}
												className={`flex items-center gap-3 flex-1 ${animalSelection.hasTotalConfiscation ? 'cursor-not-allowed' : 'cursor-pointer'}`}
											>
												<div className='flex items-center justify-center w-16 h-12 bg-gray-100 rounded-lg'>
													<span className='font-mono text-sm font-semibold'>{animal.code}</span>
												</div>
												<div className='flex flex-col'>
													<span className='text-sm text-gray-600'>Animal #{animal.code}</span>
													{animalSelection.hasTotalConfiscation && (
														<span className='text-xs text-red-600 font-medium'>⚠️ Decomiso Total - No disponible</span>
													)}
												</div>
											</label>
										</div>

										{animalSelection.selected && (
											<div className='ml-14 space-y-3'>
												<div className='text-xs font-medium text-gray-700'>Partes Afectadas y Peso ({unitSymbol}) *</div>

												{/* Grid de partes del cuerpo */}
												<div className='grid grid-cols-2 gap-3'>
													{animalSelection.bodyParts.map(part => (
														<div key={part.id} className="border rounded-lg bg-gray-50 p-2">
															<div className='flex items-center gap-2'>
																<Checkbox
																	checked={part.selected}
																	onCheckedChange={() => handleBodyPartToggle(animalId, part.id)}
																	id={`${animalId}-${part.id}`}
																	disabled={!canEdit}
																/>
																<label htmlFor={`${animalId}-${part.id}`} className='text-sm font-medium cursor-pointer flex-shrink-0 min-w-[70px]'>
																	{part.code}
																</label>
																<Input
																	type='number'
																	min='0'
																	step='0.01'
																	placeholder={unitSymbol}
																	value={part.weight}
																	onChange={e => handleBodyPartWeight(animalId, part.id, e.target.value)}
																	disabled={!part.selected || !canEdit}
																	className='h-8 text-sm flex-1'
																/>
															</div>

															<label className='text-xs font-medium text-gray-700 w-full'>
																Observación (Opcional)
																<Textarea
																	placeholder='Observación'
																	className='w-full bg-white text-xs'
																	value={part.bodyPartComment}
																	onChange={e => {
																		handleBodyPartComment(animalId, part.id, e.target.value);
                                    const textarea = e.target;
																		textarea.style.height = 'auto';
																		textarea.style.height = textarea.scrollHeight + 'px';
																	}}
																	style={{ minHeight: '20px', overflow: 'hidden' }}
																/>
															</label>
														</div>
													))}
												</div>
											</div>
										)}

										{/* Resumen de partes seleccionadas - fuera de ml-14 */}
										{animalSelection.selected && getSelectedPartsInfo(animalId) && (
											<div className='p-3 bg-gray-100 rounded text-sm text-gray-700 border-t'>
												<div className='font-medium text-gray-600 mb-2'>Partes seleccionadas:</div>
												<div className='flex flex-col gap-1'>
													{getSelectedPartsInfo(animalId)?.map(part => (
														<div key={part.id} className='font-semibold text-gray-800'>
															{part.code}: {part.weight}
															{unitSymbol}
														</div>
													))}
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
              onClick={handleSaveAll}
            disabled={!hasModifications || isSaving}
              className="bg-teal-600 hover:bg-teal-700"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {hasExistingData ? "Actualizando..." : "Guardando..."}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {hasExistingData ? "Actualizar" : "Guardar"}{selectedCount > 0 ? ` (${selectedCount} animales)` : " cambios"}
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
