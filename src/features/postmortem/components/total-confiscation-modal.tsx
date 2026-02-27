"use client";

import { useState, useEffect, useRef, Fragment } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Loader2, Info, ImageIcon, Upload, X, ZoomIn } from "lucide-react";
import { useAnimalsByBrand } from "../hooks/use-animals-by-brand";
import { useSavePostmortem, useUpdatePostmortem } from "../hooks/use-save-postmortem";
import { usePostmortemByBrand } from "../hooks/use-postmortem-by-brand";
import type { ProductPostmortem } from "../domain/save-postmortem.types";
import { toast } from "sonner";
import { useUnitMeasure } from "@/features/animal-weighing/hooks/use-unit-measure";
import { Textarea } from "@/components/ui/textarea";

type AnimalWeight = {
  animalId: string;
  selected: boolean;
  weight: string;
  bodyPartComment?: string;
  imagePreview?: string | null;
  imageFile?: File | null;
  existingImageUrl?: string | null;
};

type TotalConfiscationModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (selectedCount: number) => void;
  introductor: string;
  localizacion: string;
  certId: number | null;
  canEdit?: boolean; // Nueva prop para controlar si se puede editar
};

export function TotalConfiscationModal({
  isOpen,
  onClose,
  onSave,
  introductor,
  localizacion,
  certId,
  canEdit = true, // Por defecto true para mantener compatibilidad
}: TotalConfiscationModalProps) {
  const { data: animalsData, isLoading } = useAnimalsByBrand(certId);
  const { mutate: savePostmortem, isPending: isSaving } = useSavePostmortem();
  const { mutate: updatePostmortem, isPending: isUpdating } = useUpdatePostmortem();

  // Obtener datos guardados de postmortem
  const { data: postmortemData } = usePostmortemByBrand(certId);

  // Obtener unidad de medida desde la API
  const { data: unitMeasureData } = useUnitMeasure();
  const unitSymbol = unitMeasureData?.data?.symbol || "kg";

  const [animalWeights, setAnimalWeights] = useState<AnimalWeight[]>([]);
  const imageInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (animalsData?.data) {
      const weights = animalsData.data.map((animal) => {
        // Buscar si este animal ya tiene datos guardados de postmortem
        const savedData = postmortemData?.data?.find(
          (item) => item.idDetailsSpeciesCertificate === animal.id
        );

        // Buscar si tiene decomiso total guardado
        const savedTotalConfiscation = savedData?.productPostmortem?.find(
          (prod) => prod.isTotalConfiscation === true
        );

        return {
          animalId: animal.id.toString(),
          selected: !!savedTotalConfiscation,
          weight: savedTotalConfiscation ? String(savedTotalConfiscation.weight) : "",
          bodyPartComment: savedTotalConfiscation?.bodyPartComment,
          existingImageUrl: savedTotalConfiscation?.urlImage || null,
          imagePreview: null,
        };
      });

      setAnimalWeights(weights);
    }
  }, [animalsData, postmortemData]);

  const handleAnimalToggle = (animalId: string) => {
    setAnimalWeights((prev) =>
      prev.map((animal) =>
        animal.animalId === animalId
          ? { ...animal, selected: !animal.selected }
          : animal
      )
    );
  };

  const handleWeightChange = (animalId: string, weight: string) => {
    setAnimalWeights((prev) =>
      prev.map((animal) =>
        animal.animalId === animalId ? { ...animal, weight } : animal
      )
    );
  };

  const handleWeightCommentChange = (animalId: string, weightComment: string) => {
    setAnimalWeights((prev) =>
      prev.map((animal) =>
        animal.animalId === animalId ? { ...animal, bodyPartComment: weightComment } : animal
      )
    );
  };

  const handleAnimalImage = (animalId: string, file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setAnimalWeights((prev) =>
        prev.map((a) =>
          a.animalId === animalId ? { ...a, imagePreview: reader.result as string, imageFile: file } : a
        )
      );
    };
    reader.readAsDataURL(file);
  };

  const handleClearImage = (animalId: string) => {
    setAnimalWeights((prev) =>
      prev.map((a) =>
        a.animalId === animalId ? { ...a, imagePreview: null, imageFile: null, existingImageUrl: null } : a
      )
    );
    if (imageInputRefs.current[animalId]) imageInputRefs.current[animalId]!.value = "";
  };

  const handleSaveAll = async () => {
    const selectedAnimals = animalWeights.filter(a => a.selected);
    
    if (selectedAnimals.length === 0) {
      toast.error("Debe seleccionar al menos un animal");
      return;
    }

    // Validar que todos los animales seleccionados tengan peso
    const animalsWithoutWeight = selectedAnimals.filter(a => !a.weight || parseFloat(a.weight) <= 0);
    if (animalsWithoutWeight.length > 0) {
      toast.error("Todos los animales seleccionados deben tener un peso válido mayor a 0");
      return;
    }

    let successCount = 0;
    let errorCount = 0;

    // Procesar todos los animales seleccionados
    for (const animal of selectedAnimals) {
      try {
        const weight = parseFloat(animal.weight);
        const bodyPartComment = animal.bodyPartComment ?? '';
        
        const productsPostmortem: ProductPostmortem[] = [
          {
            idBodyPart: 0, // 0 indica decomiso total (toda la canal)
            weight: weight,
            isTotalConfiscation: true,
            status: true,
            bodyPartComment: bodyPartComment.length > 0 ? bodyPartComment : undefined,
            image: animal.imagePreview || undefined, // Incluir imagen en base64 si existe
          },
        ];

        const existingPostmortem = postmortemData?.data?.find(
          (item) => item.idDetailsSpeciesCertificate === parseInt(animal.animalId)
        );

        // Verificar si tiene decomiso total específicamente
        const hasTotalConfiscation = existingPostmortem?.productPostmortem?.some(
          (prod) => prod.isTotalConfiscation === true
        );

        if (existingPostmortem && hasTotalConfiscation) {
          // Actualizar (PATCH) - solo si ya tiene decomiso total
          await new Promise((resolve, reject) => {
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
                  successCount++;
                  resolve(true);
                },
                onError: (error) => {
                  errorCount++;
                  console.error(`Error al actualizar animal ${animal.animalId}:`, error);
                  reject(error);
                },
              }
            );
          });
        } else {
          // Crear (POST)
          await new Promise((resolve, reject) => {
            savePostmortem(
              {
                idDetailsSpeciesCertificate: parseInt(animal.animalId),
                status: true,
                productsPostmortem,
              },
              {
                onSuccess: async (response: any) => {
                  successCount++;
                  resolve(true);
                },
                onError: (error) => {
                  errorCount++;
                  console.error(`Error al guardar animal ${animal.animalId}:`, error);
                  reject(error);
                },
              }
            );
          });
        }
      } catch (error) {
        // El error ya se cuenta en errorCount
        console.error(`Error procesando animal ${animal.animalId}:`, error);
      }
    }

    // Mostrar resultado final
    if (errorCount === 0) {
      toast.success(`Se guardaron correctamente ${successCount} animales`);
      onSave(successCount);
      onClose();
    } else if (successCount > 0) {
      toast.warning(`Se guardaron ${successCount} animales. ${errorCount} fallaron.`);
      onSave(successCount);
    } else {
      toast.error(`No se pudo guardar ningún animal`);
    }
  };

  const handleCancel = () => {
    if (animalsData?.data) {
      setAnimalWeights(
        animalsData.data.map((animal) => ({
          animalId: animal.id.toString(),
          selected: false,
          weight: "",
        }))
      );
    }
    onClose();
  };

  const selectedCount = animalWeights.filter((a) => a.selected).length;

  // Determinar si todos los animales seleccionados ya tienen DECOMISO TOTAL guardado
  const selectedAnimals = animalWeights.filter((a) => a.selected);
  const allSelectedHavePostmortem = selectedAnimals.length > 0 && selectedAnimals.every((animal) => {
    const savedData = postmortemData?.data?.find(
      (item) => item.idDetailsSpeciesCertificate === parseInt(animal.animalId)
    );
    // Verificar si tiene al menos un producto con decomiso total
    return savedData?.productPostmortem?.some(
      (prod) => prod.isTotalConfiscation === true
    );
  });

  const buttonText = allSelectedHavePostmortem ? "Actualizar" : "Guardar";

  return (
    <Fragment>
    <Dialog open={isOpen} onOpenChange={handleCancel}>
      <DialogContent className="max-w-4xl flex flex-col max-h-[90vh]">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-full bg-teal-100 flex items-center justify-center">
              <Info className="h-4 w-4 text-teal-600" />
            </div>
            Gestión de Animales – Decomiso Total
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
            <div className="text-sm text-gray-600">Decomiso Total</div>
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
            <div className="space-y-2 max-h-[500px] overflow-y-auto scrollbar-hide">
              {animalsData.data.map((animal) => {
                const animalId = animal.id.toString();
                const animalWeight = animalWeights.find(
                  (a) => a.animalId === animalId
                );
                if (!animalWeight) return null;

                return (
									<div key={animal.id} className='border rounded-lg p-4 space-y-3 bg-white'>
										<div className='flex items-center gap-3'>
											<Checkbox
												checked={animalWeight.selected}
												onCheckedChange={() => handleAnimalToggle(animalId)}
												id={`animal-${animal.id}`}
												disabled={!canEdit}
											/>
											<label htmlFor={`animal-${animal.id}`} className='flex items-center gap-3 cursor-pointer flex-1'>
												<div className='flex items-center justify-center w-16 h-12 bg-gray-100 rounded-lg'>
													<span className='font-mono text-sm font-semibold'>{animal.code}</span>
												</div>
												<span className='text-sm text-gray-600'>Animal #{animal.code}</span>
											</label>
										</div>

										{animalWeight.selected && (
											<div className='ml-14 space-y-2'>
												<div className='flex items-center gap-2'>
													<span className='text-xs font-medium text-gray-700'>Peso de la Canal ({unitSymbol}) *</span>
													<Info className='h-3 w-3 text-gray-400' />
													<Badge variant='secondary' className='bg-green-100 text-green-700 hover:bg-green-100'>
														Manual
													</Badge>
												</div>
												<Input
													type='number'
													min='0'
													step='0.01'
													placeholder={`Peso de la canal en ${unitSymbol}`}
													value={animalWeight.weight}
													onChange={e => handleWeightChange(animalId, e.target.value)}
													disabled={!canEdit}
													className='flex-1 h-10'
												/>

												<div className='flex flex-col md:flex-row items-end justify-center gap-2'>
													<label className='text-xs font-medium text-gray-700 w-full flex-1'>
														Observación (Opcional)
														<Textarea
															placeholder='Observación'
															className='w-full bg-white text-xs'
															value={animalWeight?.bodyPartComment ?? ''}
															onChange={e => {
																handleWeightCommentChange(animalId, e.target.value);
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
													{/* Imagen */}
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
														{(animalWeight?.imagePreview || animalWeight?.existingImageUrl) ? (
															<div className="flex flex-col items-center gap-1">
																<div
																	className="w-16 h-16 rounded-lg overflow-hidden border bg-gray-50 cursor-pointer relative"
																	onClick={() => {
																		const url = animalWeight?.imagePreview || animalWeight?.existingImageUrl;
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
																	<img src={animalWeight?.imagePreview || animalWeight?.existingImageUrl || ""} alt="Vista previa" className="w-full h-full object-cover" />
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
                  {allSelectedHavePostmortem ? "Actualizando..." : "Guardando..."}
                </>
              ) : (
                `${buttonText} (${selectedCount})`
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
