"use client";

import { useState, useEffect, useMemo, useRef, Fragment } from "react";
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
import { Loader2, Info, Save, ImageIcon, Upload, X, ZoomIn } from "lucide-react";
import { useAnimalsByBrand } from "../hooks/use-animals-by-brand";
import { useBodyParts } from "../hooks/use-body-parts";
import { useSavePostmortem, useUpdatePostmortem } from "../hooks/use-save-postmortem";
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
  imagePreview?: string | null;
  imageFile?: File | null;
  existingImageUrl?: string | null;
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
  const { mutate: updatePostmortem, isPending: isUpdating } = useUpdatePostmortem();

  // Obtener datos guardados de postmortem
  const { data: postmortemData } = usePostmortemByBrand(certId);

  // Obtener unidad de medida desde la API
  const { data: unitMeasureData } = useUnitMeasure();
  const unitSymbol = unitMeasureData?.data?.symbol || "kg";

  const [animalSelections, setAnimalSelections] = useState<
    AnimalPartSelection[]
  >([]);
  const imageInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

  // Determinar si todos los animales seleccionados ya tienen DECOMISO PARCIAL guardado
  const hasExistingData = useMemo(() => {
    if (!postmortemData?.data) return false;

    const selectedAnimals = animalSelections.filter((a) => a.selected);
    if (selectedAnimals.length === 0) return false;

    // Si TODOS los animales seleccionados tienen decomiso parcial → Actualizar
    return selectedAnimals.every((animal) => {
      const savedData = postmortemData.data.find(
        (item) => item.idDetailsSpeciesCertificate === parseInt(animal.animalId)
      );
      // Verificar si tiene al menos un producto con decomiso parcial
      return savedData?.productPostmortem?.some(
        (prod) => prod.isTotalConfiscation === false
      );
    });
  }, [postmortemData, animalSelections]);

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
            existingImageUrl: savedPart?.urlImage || null,
            imagePreview: null,
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

  const handlePartImage = (animalId: string, partId: number, file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setAnimalSelections((prev) =>
        prev.map((animal) =>
          animal.animalId === animalId
            ? {
                ...animal,
                bodyParts: animal.bodyParts.map((part) =>
                  part.id === partId
                    ? { ...part, imagePreview: reader.result as string, imageFile: file }
                    : part
                ),
              }
            : animal
        )
      );
    };
    reader.readAsDataURL(file);
  };

  const handleClearPartImage = (animalId: string, partId: number) => {
    setAnimalSelections((prev) =>
      prev.map((animal) =>
        animal.animalId === animalId
          ? {
              ...animal,
              bodyParts: animal.bodyParts.map((part) =>
                part.id === partId
                  ? { ...part, imagePreview: null, imageFile: null, existingImageUrl: null }
                  : part
              ),
            }
          : animal
      )
    );
    const key = `${animalId}-${partId}`;
    if (imageInputRefs.current[key]) imageInputRefs.current[key]!.value = "";
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
            imagePreview: null,
            existingImageUrl: null,
          })),
        }))
      );
    }
    onClose();
  };

  const handleSaveAll = () => {
    const selectedAnimals = animalSelections.filter((a) => a.selected);

    if (selectedAnimals.length === 0) {
      toast.error("Debe seleccionar al menos un animal");
      return;
    }

    // Validar que cada animal seleccionado tenga al menos una parte con peso
    const invalidAnimals = selectedAnimals.filter((animal) => {
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

    // Guardar cada animal seleccionado
    let savedCount = 0;
    const totalAnimals = selectedAnimals.length;

    selectedAnimals.forEach((animal) => {
      const selectedParts = animal.bodyParts.filter(
        (part) => part.selected && part.weight
      );

      const productsPostmortem: ProductPostmortem[] = selectedParts.map(
        (part) => ({
          idBodyPart: part.id,
          weight: parseFloat(part.weight),
          isTotalConfiscation: false, // Decomiso parcial
          status: true,
          bodyPartComment: ((part?.bodyPartComment ?? '').length) > 0 ? part.bodyPartComment : undefined,
          image: part.imagePreview || undefined, // Incluir imagen en base64 si existe
        })
      );

      // Verificar si ya existe decomiso parcial para este animal
      const existingPostmortem = postmortemData?.data?.find(
        (item) => item.idDetailsSpeciesCertificate === parseInt(animal.animalId)
      );

      // Verificar si tiene decomiso parcial específicamente
      const hasPartialConfiscation = existingPostmortem?.productPostmortem?.some(
        (prod) => prod.isTotalConfiscation === false
      );

      try {
        if (existingPostmortem && hasPartialConfiscation) {
          // Actualizar (PATCH) - solo si ya tiene decomiso parcial
          updatePostmortem(
            {
              id: existingPostmortem.id,
              request: {
                status: true,
                productsPostmortem,
              },
            },
            {
              onSuccess: async () => {
                savedCount++;
                if (savedCount === totalAnimals) {
                  toast.success(
                    `Se ${totalAnimals === 1 ? "actualizó" : "actualizaron"} ${totalAnimals} ${totalAnimals === 1 ? "animal" : "animales"} correctamente`
                  );
                  onSave(totalAnimals);
                  onClose();
                }
              },
              onError: (error) => {
                console.log(error.message)
                if (error instanceof Error && error.message) {
                  toast.error(`Error al actualizar animal ${animal.animalId}: ${error.message}`);
                } else {
                  toast.error(`Error al actualizar animal ${animal.animalId}`);
                }
              },
            }
          );
        } else {
          // Crear (POST)
          savePostmortem(
            {
              idDetailsSpeciesCertificate: parseInt(animal.animalId),
              status: true,
              productsPostmortem,
            },
            {
              onSuccess: async (response: any) => {
                savedCount++;
                if (savedCount === totalAnimals) {
                  toast.success(
                    `Se guardaron ${totalAnimals} animales correctamente`
                  );
                  onSave(totalAnimals);
                  onClose();
                }
              },
              onError: (error) => {
                console.log(error.message)
                if (error instanceof Error && error.message) {
                  toast.error(`Error al guardar animal ${animal.animalId}: ${error.message}`);
                } else {
                  toast.error(`Error al guardar animal ${animal.animalId}`);
                }
              },
            }
          );
        }
      } catch (error) {
        console.log({error})
      }
    });
  };

  const selectedCount = animalSelections.filter((a) => a.selected).length;

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
    <Fragment>
    <Dialog open={isOpen} onOpenChange={handleCancel}>
      <DialogContent className="max-w-[95vw] sm:max-w-4xl flex flex-col max-h-[90vh]">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-full bg-teal-100 flex items-center justify-center">
              <Info className="h-4 w-4 text-teal-600" />
            </div>
            Gestión de Animales – Decomiso parcial
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto scrollbar-hide px-1">
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
											<>
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

															{/* Imagen por parte */}
															<div className="flex flex-col items-start gap-1 mt-2">
																<div className="flex items-center gap-1 text-xs font-medium text-gray-500">
																	<ImageIcon className="h-3 w-3 text-teal-600" />
																	<span>Imagen</span>
																</div>
																<input
																	ref={(el) => { imageInputRefs.current[`${animalId}-${part.id}`] = el; }}
																	type="file"
																	accept="image/*"
																	className="hidden"
																	onChange={(e) => {
																		const file = e.target.files?.[0];
																		if (file) handlePartImage(animalId, part.id, file);
																	}}
																/>
																{(part.imagePreview || part.existingImageUrl) ? (
																	<div className="flex items-center gap-2">
																		<div
																			className="w-16 h-16 rounded-lg overflow-hidden border bg-white cursor-pointer relative"
																			onClick={() => {
																				const url = part.imagePreview || part.existingImageUrl;
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
																			<img src={part.imagePreview || part.existingImageUrl || ""} alt="Vista previa" className="w-full h-full object-cover" />
																			<div data-overlay="true" className="absolute inset-0 bg-black/30 flex items-center justify-center rounded-lg transition-opacity" style={{ opacity: 0 }}>
																				<ZoomIn className="h-4 w-4 text-white" />
																			</div>
																		</div>
																		<div className="flex flex-col gap-1">
																			<Button type="button" variant="outline" size="sm" className="h-6 px-2" onClick={() => imageInputRefs.current[`${animalId}-${part.id}`]?.click()} disabled={!canEdit}>
																				<Upload className="h-3 w-3" />
																			</Button>
																			<Button type="button" variant="outline" size="sm" className="h-6 px-2 text-red-600 border-red-200 hover:bg-red-50" onClick={() => handleClearPartImage(animalId, part.id)} disabled={!canEdit}>
																				<X className="h-3 w-3" />
																			</Button>
																		</div>
																	</div>
																) : (
																	<button
																		type="button"
																		onClick={() => canEdit && imageInputRefs.current[`${animalId}-${part.id}`]?.click()}
																		disabled={!canEdit}
																		className="w-16 h-16 flex flex-col items-center justify-center gap-1 border-2 border-dashed border-gray-200 rounded-lg text-xs text-gray-400 hover:border-teal-400 hover:text-teal-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
																	>
																		<Upload className="h-4 w-4" />
																		<span>Imagen</span>
																	</button>
																)}
															</div>
														</div>
													))}
												</div>
											</div>
										</>
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
        </div>

        <DialogFooter className="flex-shrink-0 border-t pt-4 mt-0">
          <Button variant="outline" onClick={handleCancel} disabled={isSaving || isUpdating}>
            {canEdit ? "Cancelar" : "Cerrar"}
          </Button>
          {canEdit && (
            <Button
              onClick={handleSaveAll}
              disabled={selectedCount === 0 || isSaving || isUpdating}
              className="bg-teal-600 hover:bg-teal-700"
            >
              {(isSaving || isUpdating) ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {hasExistingData ? "Actualizando..." : "Guardando..."}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {hasExistingData ? "Actualizar" : "Guardar"} ({selectedCount}{" "}
                  animales)
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>

    {/* Lightbox */}
    <Dialog open={!!previewImageUrl} onOpenChange={() => setPreviewImageUrl(null)}>
      <DialogContent className="max-w-7xl w-full sm:w-[95vw] max-h-[95vh] sm:max-h-[95vh] flex flex-col p-0 gap-0 overflow-hidden">
        <div className="flex items-center gap-2 px-3 sm:px-6 py-2 sm:py-2.5 border-b bg-white shrink-0">
          <ImageIcon className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
          <DialogTitle className="text-xs sm:text-sm font-semibold m-0 truncate">Vista previa</DialogTitle>
        </div>
        {previewImageUrl && (
          <div 
            className="flex-1 min-h-0 overflow-auto p-3 sm:p-6 bg-gray-50/50 scrollbar-hide"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
          >
            <style jsx>{`
              .scrollbar-hide::-webkit-scrollbar {
                display: none;
              }
            `}</style>
            <div className="w-full h-full flex items-center justify-center">
              <img src={previewImageUrl} alt="Imagen completa" className="max-w-full h-auto object-contain shadow-lg rounded-lg" style={{ maxHeight: 'calc(95vh - 80px)', minHeight: '200px' }} />
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  </Fragment>
  );
}
