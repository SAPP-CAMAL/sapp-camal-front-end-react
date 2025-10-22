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
import { Save, Loader2, ShieldAlert } from "lucide-react";
import type { AnimalSelection } from "../domain/postmortem.types";
import { useAnimalsByBrand } from "../hooks/use-animals-by-brand";

type AnimalSelectionModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (selectedCount: number) => void;
  introductor: string;
  localizacion: string;
  patologia: string;
  certId: number | null;
};

export function AnimalSelectionModal({
  isOpen,
  onClose,
  onSave,
  introductor,
  localizacion,
  patologia,
  certId,
}: AnimalSelectionModalProps) {
  // Obtener animales desde la API
  const { data: animalsData, isLoading } = useAnimalsByBrand(certId);
  
  const [animalSelections, setAnimalSelections] = useState<AnimalSelection[]>([]);

  const [generalPercentage, setGeneralPercentage] = useState<string>("");

  // Inicializar selecciones cuando se cargan los animales
  useEffect(() => {
    if (animalsData?.data) {
      setAnimalSelections(
        animalsData.data.map((animal) => ({
          animalId: animal.id.toString(),
          selected: false,
          percentage: 40,
        }))
      );
    }
  }, [animalsData]);

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

  const handleApplyGeneralPercentage = (percentage: number) => {
    setAnimalSelections((prev) =>
      prev.map((animal) =>
        animal.selected ? { ...animal, percentage } : animal
      )
    );
  };

  const handleSave = () => {
    const selectedCount = animalSelections.filter((a) => a.selected).length;
    onSave(selectedCount);
    onClose();
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
    setGeneralPercentage("");
    onClose();
  };

  const selectedCount = animalSelections.filter((a) => a.selected).length;

  return (
    <Dialog open={isOpen} onOpenChange={handleCancel}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto scrollbar-hide">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
           <ShieldAlert className="h-5 w-5 text-primary"/>
            Gestión de Animales – {patologia}
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
            <div className="text-sm text-gray-600">{patologia}</div>
          </div>
        </div>

        {/* % de Afectación General */}
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
                value={generalPercentage}
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

        {/* Lista de Animales */}
        <div className="space-y-2">
          <h3 className="font-semibold text-sm">
            Animales Disponibles ({selectedCount} seleccionados)
          </h3>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-teal-600" />
              <span className="ml-2 text-sm text-gray-600">Cargando animales...</span>
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
                      <div className="ml-14 space-y-2">
                        <div className="text-xs font-medium text-gray-700">
                          Porcentaje de Afectación (%) *
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant={
                              selection.percentage === 20 ? "default" : "outline"
                            }
                            size="sm"
                            onClick={() => handleAnimalPercentage(animalId, 20)}
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
                              selection.percentage === 40 ? "default" : "outline"
                            }
                            size="sm"
                            onClick={() => handleAnimalPercentage(animalId, 40)}
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
                              selection.percentage === 60 ? "default" : "outline"
                            }
                            size="sm"
                            onClick={() => handleAnimalPercentage(animalId, 60)}
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
                            value={selection.percentage}
                            onChange={(e) =>
                              handleAnimalPercentage(
                                animalId,
                                parseInt(e.target.value) || 0
                              )
                            }
                            className="w-20 h-8 text-center bg-gray-50"
                          />
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
          <Button variant="outline" onClick={handleCancel}>
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            className="bg-teal-600 hover:bg-teal-700"
          >
            <Save className="h-4 w-4 mr-2" />
            Guardar ({selectedCount} animales)
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
