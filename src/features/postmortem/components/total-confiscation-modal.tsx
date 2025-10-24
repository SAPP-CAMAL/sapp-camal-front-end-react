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
import { Badge } from "@/components/ui/badge";
import { Loader2, Info } from "lucide-react";
import { useAnimalsByBrand } from "../hooks/use-animals-by-brand";
import { useSavePostmortem } from "../hooks/use-save-postmortem";
import { usePostmortemByBrand } from "../hooks/use-postmortem-by-brand";
import type { ProductPostmortem } from "../domain/save-postmortem.types";
import { toast } from "sonner";

type AnimalWeight = {
  animalId: string;
  selected: boolean;
  weight: string;
};

type TotalConfiscationModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (selectedCount: number) => void;
  introductor: string;
  localizacion: string;
  certId: number | null;
};

export function TotalConfiscationModal({
  isOpen,
  onClose,
  onSave,
  introductor,
  localizacion,
  certId,
}: TotalConfiscationModalProps) {
  const { data: animalsData, isLoading } = useAnimalsByBrand(certId);
  const { mutate: savePostmortem, isPending: isSaving } = useSavePostmortem();
  
  // Obtener datos guardados de postmortem
  const { data: postmortemData } = usePostmortemByBrand(certId);
  
  const [animalWeights, setAnimalWeights] = useState<AnimalWeight[]>([]);

  useEffect(() => {
    if (animalsData?.data) {
      const weights = animalsData.data.map((animal) => {
        // Buscar si este animal ya tiene datos guardados de decomiso total
        const savedData = postmortemData?.data?.find(
          (item) => item.idDetailsSpeciesCertificate === animal.id
        );
        
        const savedProduct = savedData?.productPostmortem.find(
          (prod) => prod.isTotalConfiscation === true
        );

        return {
          animalId: animal.id.toString(),
          selected: !!savedProduct,
          weight: savedProduct ? savedProduct.weight : "",
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

  const handleSaveAnimal = (animalId: string) => {
    const animal = animalWeights.find((a) => a.animalId === animalId);
    
    if (!animal || !animal.weight) {
      toast.error("Debe ingresar el peso de la canal");
      return;
    }

    const weight = parseFloat(animal.weight);
    if (isNaN(weight) || weight <= 0) {
      toast.error("El peso debe ser un número válido mayor a 0");
      return;
    }

    // Para decomiso total, no se especifica idBodyPart, solo el peso total
    const productsPostmortem: ProductPostmortem[] = [
      {
        idBodyPart: 0, // 0 indica decomiso total (toda la canal)
        weight: weight,
        isTotalConfiscation: true,
        status: true,
      },
    ];

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

  return (
    <Dialog open={isOpen} onOpenChange={handleCancel}>
      <DialogContent className="max-w-[95vw] sm:max-w-4xl max-h-[90vh] overflow-y-auto scrollbar-hide">
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

                return (
                  <div
                    key={animal.id}
                    className="border rounded-lg p-4 space-y-3 bg-white"
                  >
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={animalWeight.selected}
                        onCheckedChange={() => handleAnimalToggle(animalId)}
                        id={`animal-${animal.id}`}
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
                            Peso de la Canal (kg) *
                          </span>
                          <Info className="h-3 w-3 text-gray-400" />
                          <Badge
                            variant="secondary"
                            className="bg-green-100 text-green-700 hover:bg-green-100"
                          >
                            Manual
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="Peso de la canal en kg"
                            value={animalWeight.weight}
                            onChange={(e) =>
                              handleWeightChange(animalId, e.target.value)
                            }
                            className="flex-1 h-10"
                          />
                          <Button
                            size="sm"
                            onClick={() => handleSaveAnimal(animalId)}
                            disabled={!animalWeight.weight || isSaving}
                            className="bg-teal-600 hover:bg-teal-700"
                          >
                            {isSaving ? (
                              <>
                                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                {animalWeight.selected ? "Actualizando..." : "Guardando..."}
                              </>
                            ) : (
                              animalWeight.selected ? "Actualizar" : "Guardar"
                            )}
                          </Button>
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
          <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
            Cancelar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
