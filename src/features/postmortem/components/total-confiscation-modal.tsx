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
import { Badge } from "@/components/ui/badge";
import { Loader2, Info, Upload, X, ZoomIn, Image as ImageIcon } from "lucide-react";
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
  const { mutate: updatePostmortem, isPending: isUpdating } =
    useUpdatePostmortem();

  // Obtener datos guardados de postmortem
  const { data: postmortemData } = usePostmortemByBrand(certId);

  // Obtener unidad de medida desde la API
  const { data: unitMeasureData } = useUnitMeasure();
  const unitSymbol = unitMeasureData?.data?.symbol || "kg";
  const isSavingOrUpdating = isSaving || isUpdating;

  const [isUpdatingAll, setIsUpdatingAll] = useState(false);
  const updateAllRemainingRef = useRef(0);

  const imageInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

  const [animalWeights, setAnimalWeights] = useState<AnimalWeight[]>([]);

  const isDataUrlImage = (value?: string | null) =>
    typeof value === "string" && value.startsWith("data:image/");

  const computePayloadImage = (params: {
    currentPreview?: string | null;
    currentExistingUrl?: string | null;
    savedExistingUrl?: string | null;
  }): string | null | undefined => {
    const { currentPreview, currentExistingUrl, savedExistingUrl } = params;

    if (isDataUrlImage(currentPreview)) return currentPreview;
    // Si había una imagen guardada y ahora se limpió, enviar null para eliminar
    if (!currentExistingUrl && !!savedExistingUrl) return null;
    // Caso normal: no enviar nada para mantener lo existente
    return undefined;
  };

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
          imagePreview: null,
          existingImageUrl: savedTotalConfiscation?.urlImage || null,
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
    reader.onload = () => {
      setAnimalWeights((prev) =>
        prev.map((animal) =>
          animal.animalId === animalId
            ? { ...animal, imagePreview: reader.result as string }
            : animal
        )
      );
    };
    reader.readAsDataURL(file);
  };

  const handleClearImage = (animalId: string) => {
    setAnimalWeights((prev) =>
      prev.map((animal) =>
        animal.animalId === animalId
          ? { ...animal, imagePreview: null, existingImageUrl: null }
          : animal
      )
    );

    const input = imageInputRefs.current[animalId];
    if (input) input.value = "";
  };

  const hasAnimalChanges = (animal: AnimalWeight) => {
    const savedData = postmortemData?.data?.find(
      (item) => item.idDetailsSpeciesCertificate === parseInt(animal.animalId)
    );
    const savedTotal = savedData?.productPostmortem?.find(
      (prod) => prod.isTotalConfiscation === true
    );

    const savedSelected = !!savedTotal;
    if (animal.selected !== savedSelected) return true;
    if (!animal.selected && !savedSelected) return false;

    const savedWeight = savedTotal ? String(savedTotal.weight) : "";
    const savedComment = (savedTotal?.bodyPartComment ?? "").trim();
    const currentComment = (animal.bodyPartComment ?? "").trim();

    const savedImageUrl = savedTotal?.urlImage || null;
    const currentExisting = animal.existingImageUrl || null;
    const currentPreview = animal.imagePreview || null;

    if (String(animal.weight ?? "") !== savedWeight) return true;
    if (currentComment !== savedComment) return true;

    // Si se subió una nueva imagen o se limpió una existente
    if (!!currentPreview) return true;
    if (savedImageUrl !== currentExisting) return true;

    return false;
  };

  const handleSaveAnimal = (animalId: string) => {
    const animal = animalWeights.find((a) => a.animalId === animalId);
    const existingPostmortem = postmortemData?.data?.find(
      (item) => item.idDetailsSpeciesCertificate === parseInt(animalId)
    );
    const existingTotal = existingPostmortem?.productPostmortem?.find(
      (prod) => prod.isTotalConfiscation === true
    );

    if (!animal) return;

    if (!animal.selected) {
      if (!existingPostmortem || !existingTotal) {
        toast.info("No hay cambios para guardar");
        return;
      }

      const productsPostmortem: ProductPostmortem[] = [
        {
          idBodyPart: existingTotal.idBodyPart || 0,
          weight: parseFloat(existingTotal.weight) || 0,
          isTotalConfiscation: true,
          status: false,
          bodyPartComment: "",
          image: existingTotal.urlImage ? null : undefined,
        },
      ];

      updatePostmortem(
        {
          id: existingPostmortem.id,
          request: {
            status: true,
            productsPostmortem,
          },
        },
        {
          onSuccess: () => {
            toast.success(`Animal ${animalId} actualizado correctamente`);
            const selectedCount = animalWeights.filter((a) => a.selected).length;
            onSave(selectedCount);
          },
          onError: () => {
            toast.error(`Error al actualizar el animal ${animalId}`);
          },
        }
      );

      return;
    }

    if (!animal.weight) {
      toast.error("Debe ingresar el peso de la canal");
      return;
    }

    const weight = parseFloat(animal.weight);
    if (isNaN(weight) || weight <= 0) {
      toast.error("El peso debe ser un número válido mayor a 0");
      return;
    }

    const bodyPartComment = (animal.bodyPartComment ?? "").trim();
    const image = computePayloadImage({
      currentPreview: animal.imagePreview,
      currentExistingUrl: animal.existingImageUrl,
      savedExistingUrl: existingTotal?.urlImage || null,
    });
    // Para decomiso total, no se especifica idBodyPart, solo el peso total
    const productsPostmortem: ProductPostmortem[] = [
      {
        idBodyPart: 0, // 0 indica decomiso total (toda la canal)
        weight: weight,
        isTotalConfiscation: true,
        status: true,
        bodyPartComment: bodyPartComment,
        image,
      },
    ];

    if (existingPostmortem) {
      updatePostmortem(
        {
          id: existingPostmortem.id,
          request: {
            status: true,
            productsPostmortem,
          },
        },
        {
          onSuccess: () => {
            toast.success(`Animal ${animalId} actualizado correctamente`);
            const selectedCount = animalWeights.filter((a) => a.selected).length;
            onSave(selectedCount);
          },
          onError: () => {
            toast.error(`Error al actualizar el animal ${animalId}`);
          },
        }
      );
      return;
    }

    savePostmortem(
      {
        idDetailsSpeciesCertificate: parseInt(animalId),
        status: true,
        productsPostmortem,
      },
      {
        onSuccess: () => {
          toast.success(`Animal ${animalId} guardado correctamente`);
          // Actualizar el contador en la tabla
          const selectedCount = animalWeights.filter((a) => a.selected).length;
          onSave(selectedCount);
        },
        onError: () => {
          toast.error(`Error al guardar el animal ${animalId}`);
        },
      }
    );
  };

  const handleUpdateAll = () => {
    const animalsToUpdate = animalWeights.filter((animal) => {
      if (!hasAnimalChanges(animal)) return false;
      const existingPostmortem = postmortemData?.data?.find(
        (item) => item.idDetailsSpeciesCertificate === parseInt(animal.animalId)
      );
      const existingTotal = existingPostmortem?.productPostmortem?.find(
        (prod) => prod.isTotalConfiscation === true
      );
      return !!existingTotal;
    });

    if (animalsToUpdate.length === 0) {
      toast.info("No hay cambios para actualizar");
      return;
    }

    const hasInvalidWeight = animalsToUpdate.some((animal) => {
      if (!animal.selected) return false;
      const weight = parseFloat(animal.weight);
      return !animal.weight || isNaN(weight) || weight <= 0;
    });

    if (hasInvalidWeight) {
      toast.error("Debe ingresar un peso valido para actualizar");
      return;
    }

    setIsUpdatingAll(true);
    updateAllRemainingRef.current = animalsToUpdate.length;

    const finalizeUpdateAll = () => {
      updateAllRemainingRef.current -= 1;
      if (updateAllRemainingRef.current <= 0) {
        setIsUpdatingAll(false);
        onClose();
      }
    };

    animalsToUpdate.forEach((animal) => {
      const existingPostmortem = postmortemData?.data?.find(
        (item) => item.idDetailsSpeciesCertificate === parseInt(animal.animalId)
      );
      const existingTotal = existingPostmortem?.productPostmortem?.find(
        (prod) => prod.isTotalConfiscation === true
      );

      if (!existingPostmortem || !existingTotal) {
        finalizeUpdateAll();
        return;
      }

      if (!animal.selected) {
        const productsPostmortem: ProductPostmortem[] = [
          {
            idBodyPart: existingTotal.idBodyPart || 0,
            weight: parseFloat(existingTotal.weight) || 0,
            isTotalConfiscation: true,
            status: false,
            bodyPartComment: "",
            image: existingTotal.urlImage ? null : undefined,
          },
        ];

        updatePostmortem(
          {
            id: existingPostmortem.id,
            request: {
              status: true,
              productsPostmortem,
            },
          },
          {
            onSuccess: () => {
              const selectedCount = animalWeights.filter((a) => a.selected).length;
              onSave(selectedCount);
              finalizeUpdateAll();
            },
            onError: () => {
              toast.error(`Error al actualizar el animal ${animal.animalId}`);
              finalizeUpdateAll();
            },
          }
        );

        return;
      }

      const weight = parseFloat(animal.weight);
      const bodyPartComment = (animal.bodyPartComment ?? "").trim();
      const image = computePayloadImage({
        currentPreview: animal.imagePreview,
        currentExistingUrl: animal.existingImageUrl,
        savedExistingUrl: existingTotal.urlImage || null,
      });
      const productsPostmortem: ProductPostmortem[] = [
        {
          idBodyPart: 0,
          weight: weight,
          isTotalConfiscation: true,
          status: true,
          bodyPartComment: bodyPartComment,
          image,
        },
      ];

      updatePostmortem(
        {
          id: existingPostmortem.id,
          request: {
            status: true,
            productsPostmortem,
          },
        },
        {
          onSuccess: () => {
            const selectedCount = animalWeights.filter((a) => a.selected).length;
            onSave(selectedCount);
            finalizeUpdateAll();
          },
          onError: () => {
            toast.error(`Error al actualizar el animal ${animal.animalId}`);
            finalizeUpdateAll();
          },
        }
      );
    });
  };

  const handleCancel = () => {
    if (animalsData?.data) {
      setAnimalWeights(
        animalsData.data.map((animal) => ({
          animalId: animal.id.toString(),
          selected: false,
          weight: "",
          bodyPartComment: "",
          imagePreview: null,
          existingImageUrl: null,
        }))
      );
    }
    onClose();
  };

  const selectedCount = animalWeights.filter((a) => a.selected).length;
  const hasChanges = animalWeights.some((animal) => hasAnimalChanges(animal));

  return (
    <>
    <Dialog open={isOpen} onOpenChange={handleCancel}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto scrollbar-hide">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-full bg-teal-100 flex items-center justify-center">
              <Info className="h-4 w-4 text-teal-600" />
            </div>
            Gestión de Animales – Decomiso Total
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
                const savedData = postmortemData?.data?.find(
                  (item) => item.idDetailsSpeciesCertificate === parseInt(animalId)
                );
                const hasTotalConfiscation = savedData?.productPostmortem?.some(
                  (prod) => prod.isTotalConfiscation === true
                );
                return (
                  <div key={animal.id} className="border rounded-lg p-4 space-y-3 bg-white">
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={animalWeight.selected}
                        onCheckedChange={() => handleAnimalToggle(animalId)}
                        id={`animal-${animal.id}`}
                        disabled={!canEdit}
                      />
                      <label
                        htmlFor={`animal-${animal.id}`}
                        className="flex items-center gap-3 cursor-pointer flex-1"
                      >
                        <div className="flex items-center justify-center w-16 h-12 bg-gray-100 rounded-lg">
                          <span className="font-mono text-sm font-semibold">
                            {animal.code}
                          </span>
                        </div>
                        <span className="text-sm text-gray-600">
                          Animal #{animal.code}
                        </span>
                      </label>
                    </div>

                    {animalWeight.selected && (
                      <div className="ml-14 space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-gray-700">
                            Peso de la Canal ({unitSymbol}) *
                          </span>
                          <Info className="h-3 w-3 text-gray-400" />
                          <Badge
                            variant="secondary"
                            className="bg-green-100 text-green-700 hover:bg-green-100"
                          >
                            Manual
                          </Badge>
                        </div>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder={`Peso de la canal en ${unitSymbol}`}
                          value={animalWeight.weight}
                          onChange={e => handleWeightChange(animalId, e.target.value)}
                          disabled={!canEdit}
                          className="flex-1 h-10"
                        />

                        <div className="flex flex-col md:flex-row items-end justify-center gap-2">
                          <label className="text-xs font-medium text-gray-700 w-full">
                            Observación (Opcional)
                            <Textarea
                              placeholder="Observación"
                              className="w-full bg-white text-xs"
                              value={animalWeight?.bodyPartComment ?? ""}
                              onChange={e => {
                                handleWeightCommentChange(animalId, e.target.value);
                                const textarea = e.target as HTMLTextAreaElement;
                                textarea.style.height = "auto";
                                textarea.style.height =
                                  Math.min(textarea.scrollHeight, 120) + "px";
                              }}
                              style={{
                                minHeight: "60px",
                                maxHeight: "120px",
                                overflow: "auto",
                                wordWrap: "break-word",
                                whiteSpace: "pre-wrap",
                                wordBreak: "break-word",
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
                              ref={(el) => {
                                imageInputRefs.current[animalId] = el;
                              }}
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleAnimalImage(animalId, file);
                              }}
                            />
                            {(animalWeight.imagePreview || animalWeight.existingImageUrl) ? (
                              <div className="flex flex-col items-center gap-1">
                                <div
                                  className="w-16 h-16 rounded-lg overflow-hidden border bg-gray-50 cursor-pointer relative"
                                  onClick={() => {
                                    const url = animalWeight.imagePreview || animalWeight.existingImageUrl;
                                    if (url) setPreviewImageUrl(url);
                                  }}
                                  onMouseEnter={(e) => {
                                    const overlay = e.currentTarget.querySelector(
                                      "[data-overlay]"
                                    ) as HTMLElement | null;
                                    if (overlay) overlay.style.opacity = "1";
                                  }}
                                  onMouseLeave={(e) => {
                                    const overlay = e.currentTarget.querySelector(
                                      "[data-overlay]"
                                    ) as HTMLElement | null;
                                    if (overlay) overlay.style.opacity = "0";
                                  }}
                                  title="Ver imagen completa"
                                >
                                  <img
                                    src={animalWeight.imagePreview || animalWeight.existingImageUrl || ""}
                                    alt="Vista previa"
                                    className="w-full h-full object-cover"
                                  />
                                  <div
                                    data-overlay="true"
                                    className="absolute inset-0 bg-black/30 flex items-center justify-center rounded-lg transition-opacity"
                                    style={{ opacity: 0 }}
                                  >
                                    <ZoomIn className="h-4 w-4 text-white" />
                                  </div>
                                </div>
                                <div className="flex gap-1">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="h-6 px-2"
                                    onClick={() => imageInputRefs.current[animalId]?.click()}
                                    disabled={!canEdit}
                                  >
                                    <Upload className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="h-6 px-2 text-red-600 border-red-200 hover:bg-red-50"
                                    onClick={() => handleClearImage(animalId)}
                                    disabled={!canEdit}
                                  >
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
                          {canEdit && (
                            <Button
                              size="sm"
                              onClick={() => handleSaveAnimal(animalId)}
                              disabled={!animalWeight.weight || isSavingOrUpdating || hasTotalConfiscation}
                              className="bg-teal-600 hover:bg-teal-700"
                            >
                              {isSavingOrUpdating ? (
                                <>
                                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                  Guardando...
                                </>
                              ) : (
                                "Guardar"
                              )}
                            </Button>
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
          {canEdit && (
            <Button onClick={handleUpdateAll} disabled={!hasChanges || isUpdatingAll}>
              {isUpdatingAll ? (
                <>
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  Actualizando...
                </>
              ) : (
                "Actualizar"
              )}
            </Button>
          )}
          <Button variant="outline" onClick={handleCancel} disabled={isSavingOrUpdating}>
            {canEdit ? "Cancelar" : "Cerrar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    {/* Visor de imagen */}
    <Dialog open={!!previewImageUrl} onOpenChange={(open) => !open && setPreviewImageUrl(null)}>
      <DialogContent className="max-w-[95vw] sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Imagen</DialogTitle>
        </DialogHeader>
        {previewImageUrl ? (
          <div className="w-full flex items-center justify-center">
            <img src={previewImageUrl} alt="Imagen" className="max-h-[70vh] w-auto object-contain rounded" />
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
    </>
  );
}
