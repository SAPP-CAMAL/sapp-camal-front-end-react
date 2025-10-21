"use client";

import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AnimalSignsSelection,
  createEmptySelection,
  cloneSelection,
  countSelection,
  SignWithBodyParts,
  SimpleSign,
  processClinicalSigns,
  DISPOSAL_TYPES,
  DisposalType,
  convertSelectionToSaveRequest,
  convertAntemortemDataToSelection,
  convertSelectionToUpdateRequest,
} from "../domain/signs";
import { Lock, Loader2, Skull } from "lucide-react";
import { toast } from "sonner";
import { 
  getAnimalsByBrandService, 
  getClinicalSignsBySpecieService, 
  getCausesOfDeathService,
  getOpinionsService,
  saveAntemortemService,
  getAntemortemByAnimalService,
  updateAntemortemService
} from "../server/db/antemortem.service";
import { AnimalDetail, CauseOfDeath, Opinion, AntemortemData } from "../domain/line.types";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  marcaLabel: string;
  settingCertificateBrandsId?: number;
  idSpecie: number;
  initial?: Record<string, AnimalSignsSelection>;
  onSave?: (sel: Record<string, AnimalSignsSelection>) => void;
};

export function SignosClinicosModal({ 
  open, 
  onOpenChange, 
  marcaLabel, 
  settingCertificateBrandsId, 
  idSpecie, 
  initial, 
  onSave 
}: Props) {
  const [animales, setAnimales] = useState<AnimalDetail[]>([]);
  const [isLoadingAnimales, setIsLoadingAnimales] = useState(false);
  const [signsWithBodyParts, setSignsWithBodyParts] = useState<SignWithBodyParts[]>([]);
  const [simpleSigns, setSimpleSigns] = useState<SimpleSign[]>([]);
  const [isLoadingSignos, setIsLoadingSignos] = useState(false);
  const [causesOfDeath, setCausesOfDeath] = useState<CauseOfDeath[]>([]);
  const [isLoadingCauses, setIsLoadingCauses] = useState(false);
  const [opinions, setOpinions] = useState<Opinion[]>([]);
  const [isLoadingOpinions, setIsLoadingOpinions] = useState(false);
  const [selections, setSelections] = useState<Record<string, AnimalSignsSelection>>({});
  const [currentId, setCurrentId] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const [savedAnimalIds, setSavedAnimalIds] = useState<Record<string, number>>({}); // animalCode -> antemortemId
  const [savedAnimalData, setSavedAnimalData] = useState<Record<string, AntemortemData>>({}); // animalCode -> raw API data
  const [animalTotalSigns, setAnimalTotalSigns] = useState<Record<string, number>>({}); // animalCode -> totalSigns de la API
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [initialSelections, setInitialSelections] = useState<Record<string, AnimalSignsSelection>>({});
  const [isLoadingAnimalData, setIsLoadingAnimalData] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingAnimalChange, setPendingAnimalChange] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !idSpecie) return;
    const loadSignosClinicos = async () => {
      try {
        setIsLoadingSignos(true);
        const response = await getClinicalSignsBySpecieService(idSpecie);
        if (response.code === 200 && response.data) {
          const { signsWithBodyParts: withParts, simpleSigns: simple } = processClinicalSigns(response.data);
          setSignsWithBodyParts(withParts);
          setSimpleSigns(simple);
        }
      } catch (error) {
        setSignsWithBodyParts([]);
        setSimpleSigns([]);
      } finally {
        setIsLoadingSignos(false);
      }
    };
    loadSignosClinicos();
  }, [open, idSpecie]);

  // Cargar causas de muerte
  useEffect(() => {
    if (!open) return;
    const loadCausesOfDeath = async () => {
      try {
        setIsLoadingCauses(true);
        const response = await getCausesOfDeathService();
        if (response.code === 200 && response.data) {
          setCausesOfDeath(response.data.filter(cause => cause.status));
        }
      } catch (error) {
        setCausesOfDeath([]);
      } finally {
        setIsLoadingCauses(false);
      }
    };
    loadCausesOfDeath();
  }, [open]);

  // Cargar opiniones/dictámenes
  useEffect(() => {
    if (!open) return;
    const loadOpinions = async () => {
      try {
        setIsLoadingOpinions(true);
        const response = await getOpinionsService();
        if (response.code === 200 && response.data) {
          setOpinions(response.data.filter(opinion => opinion.status));
        }
      } catch (error) {
        setOpinions([]);
      } finally {
        setIsLoadingOpinions(false);
      }
    };
    loadOpinions();
  }, [open]);

  useEffect(() => {
    if (!open || !settingCertificateBrandsId) return;
    const loadAnimales = async () => {
      try {
        setIsLoadingAnimales(true);
        const response = await getAnimalsByBrandService(settingCertificateBrandsId);
        if (response.code === 200 && response.data) {
          setAnimales(response.data);
          const base: Record<string, AnimalSignsSelection> = {};
          const totalSignsMap: Record<string, number> = {};
          
          response.data.forEach((animal) => {
            const animalId = animal.code;
            base[animalId] = initial?.[animalId] ? cloneSelection(initial[animalId]) : createEmptySelection();
            
            // Guardar totalSigns de cada animal
            if (animal.totalSigns !== undefined) {
              totalSignsMap[animalId] = animal.totalSigns;
            }
          });
          
          setSelections(base);
          setInitialSelections(base); // Guardar estado inicial
          setAnimalTotalSigns(totalSignsMap); // Guardar totalSigns de la API
          
          if (response.data.length > 0) {
            setCurrentId(response.data[0].code);
          }
        }
      } catch (error) {
        setAnimales([]);
      } finally {
        setIsLoadingAnimales(false);
      }
    };
    loadAnimales();
  }, [open, settingCertificateBrandsId, initial]);

  // Cargar datos existentes del animal cuando se selecciona
  useEffect(() => {
    if (!currentId || !animales.length) return;
    
    const loadAnimalData = async () => {
      const animal = animales.find(a => a.code === currentId);
      if (!animal) return;
      
      try {
        setIsLoadingAnimalData(true);
        const response = await getAntemortemByAnimalService(animal.id);
        
        if (response.code === 200 && response.data) {
          // Tiene datos guardados
          const loadedSelection = convertAntemortemDataToSelection(response.data);
          
          setSelections(prev => ({
            ...prev,
            [currentId]: loadedSelection
          }));
          
          setInitialSelections(prev => ({
            ...prev,
            [currentId]: cloneSelection(loadedSelection)
          }));
          
          setSavedAnimalIds(prev => ({
            ...prev,
            [currentId]: response.data!.id
          }));
          
          // Guardar datos crudos para uso en UPDATE
          setSavedAnimalData(prev => ({
            ...prev,
            [currentId]: response.data!
          }));
          
          setHasUnsavedChanges(false);
        } else {
          // No tiene datos guardados, usar selección vacía
          const emptySelection = createEmptySelection();
          
          setSelections(prev => ({
            ...prev,
            [currentId]: emptySelection
          }));
          
          setInitialSelections(prev => ({
            ...prev,
            [currentId]: emptySelection
          }));
          
          setHasUnsavedChanges(false);
        }
      } catch (error) {
        // En caso de error, usar selección vacía
        const emptySelection = createEmptySelection();
        setSelections(prev => ({
          ...prev,
          [currentId]: emptySelection
        }));
        setInitialSelections(prev => ({
          ...prev,
          [currentId]: emptySelection
        }));
      } finally {
        setIsLoadingAnimalData(false);
      }
    };
    
    loadAnimalData();
  }, [currentId, animales]);

  // Detectar cambios sin guardar
  useEffect(() => {
    if (!currentId) return;
    
    const currentSelection = selections[currentId];
    const initialSelection = initialSelections[currentId];
    
    if (!currentSelection || !initialSelection) {
      setHasUnsavedChanges(false);
      return;
    }
    
    // Comparar si hay cambios
    const hasChanges = JSON.stringify({
      signsWithBodyParts: Array.from(currentSelection.signsWithBodyParts.entries()).map(([k, v]) => [k, Array.from(v)]),
      simpleSigns: Array.from(currentSelection.simpleSigns.entries()),
      dictamen: Array.from(currentSelection.dictamen),
      isDeadAnimal: currentSelection.isDeadAnimal,
      selectedCauseOfDeath: currentSelection.selectedCauseOfDeath,
      disposalType: currentSelection.disposalType
    }) !== JSON.stringify({
      signsWithBodyParts: Array.from(initialSelection.signsWithBodyParts.entries()).map(([k, v]) => [k, Array.from(v)]),
      simpleSigns: Array.from(initialSelection.simpleSigns.entries()),
      dictamen: Array.from(initialSelection.dictamen),
      isDeadAnimal: initialSelection.isDeadAnimal,
      selectedCauseOfDeath: initialSelection.selectedCauseOfDeath,
      disposalType: initialSelection.disposalType
    });
    
    setHasUnsavedChanges(hasChanges);
  }, [selections, initialSelections, currentId]);
  const handleAnimalChange = (newAnimalCode: string) => {
    if (newAnimalCode === currentId) return; // No hacer nada si es el mismo animal
    
    if (hasUnsavedChanges) {
      setPendingAnimalChange(newAnimalCode);
      setShowConfirmDialog(true);
    } else {
      // No hay cambios, cambiar directamente
      setCurrentId(newAnimalCode);
      setHasUnsavedChanges(false);
    }
  };

  // Confirmar cambio de animal
  const handleConfirmAnimalChange = () => {
    if (pendingAnimalChange) {
      // Revertir cambios del animal actual
      setSelections(prev => ({
        ...prev,
        [currentId]: cloneSelection(initialSelections[currentId] || createEmptySelection())
      }));
      
      // Cambiar al animal pendiente
      setCurrentId(pendingAnimalChange);
      setHasUnsavedChanges(false);
      setPendingAnimalChange(null);
      setShowConfirmDialog(false);
    }
  };

  // Cancelar cambio de animal
  const handleCancelAnimalChange = () => {
    setPendingAnimalChange(null);
    setShowConfirmDialog(false);
  };

  const current = selections[currentId] ?? createEmptySelection();
  const currentCount = useMemo(() => countSelection(current), [current]);
  const totalCount = useMemo(() => Object.values(selections).reduce((acc, s) => acc + countSelection(s), 0), [selections]);
  const currentAnimalHasSavedData = savedAnimalIds[currentId] !== undefined;
  
  const matanzaNormalId = 1;

  const toggleBodyPart = (signId: number, bodyPartId: number) => {
    setSelections((prev) => {
      const next = { ...prev };
      const base = prev[currentId] ?? createEmptySelection();
      const sel = cloneSelection(base);
      if (!sel.signsWithBodyParts.has(signId)) {
        sel.signsWithBodyParts.set(signId, new Set([bodyPartId]));
      } else {
        const bodyParts = sel.signsWithBodyParts.get(signId)!;
        if (bodyParts.has(bodyPartId)) {
          bodyParts.delete(bodyPartId);
          if (bodyParts.size === 0) sel.signsWithBodyParts.delete(signId);
        } else {
          bodyParts.add(bodyPartId);
        }
      }
      next[currentId] = sel;
      return next;
    });
  };

  const toggleAllBodyParts = (signId: number, bodyParts: Array<{ id: number }>, checked: boolean) => {
    setSelections((prev) => {
      const next = { ...prev };
      const base = prev[currentId] ?? createEmptySelection();
      const sel = cloneSelection(base);
      if (checked) {
        sel.signsWithBodyParts.set(signId, new Set(bodyParts.map(bp => bp.id)));
      } else {
        sel.signsWithBodyParts.delete(signId);
      }
      next[currentId] = sel;
      return next;
    });
  };

  const toggleSimpleSign = (signId: number) => {
    setSelections((prev) => {
      const next = { ...prev };
      const base = prev[currentId] ?? createEmptySelection();
      const sel = cloneSelection(base);
      const currentValue = sel.simpleSigns.get(signId) || false;
      sel.simpleSigns.set(signId, !currentValue);
      next[currentId] = sel;
      return next;
    });
  };

  const toggleDictamen = (opinionId: number) => {
    setSelections((prev) => {
      const next = { ...prev };
      const base = prev[currentId] ?? createEmptySelection();
      const sel = cloneSelection(base);
      
      if (opinionId === matanzaNormalId) {
        // Si es "Matanza Normal", exclusiva
        if (sel.dictamen.has(opinionId)) {
          sel.dictamen.delete(opinionId);
        } else {
          sel.dictamen.clear();
          sel.dictamen.add(opinionId);
        }
      } else {
        // Otras opiniones
        if (!sel.dictamen.has(matanzaNormalId)) {
          if (sel.dictamen.has(opinionId)) {
            sel.dictamen.delete(opinionId);
          } else {
            sel.dictamen.add(opinionId);
          }
        }
      }
      
      next[currentId] = sel;
      return next;
    });
  };

  const toggleDeadAnimal = () => {
    setSelections((prev) => {
      const next = { ...prev };
      const base = prev[currentId] ?? createEmptySelection();
      const sel = cloneSelection(base);
      sel.isDeadAnimal = !sel.isDeadAnimal;
      
      // Si se activa animales muertos, quitar Matanza Normal
      if (sel.isDeadAnimal) {
        sel.dictamen.delete(matanzaNormalId);
        // Valores por defecto
        if (!sel.disposalType) {
          sel.disposalType = "Decomiso";
        }
      } else {
        // Si se desactiva, limpiar datos de animales muertos y restaurar Matanza Normal
        sel.selectedCauseOfDeath = undefined;
        sel.disposalType = undefined;
        // Restaurar Matanza Normal si no hay otros dictámenes
        if (sel.dictamen.size === 0) {
          sel.dictamen.add(matanzaNormalId);
        }
      }
      
      next[currentId] = sel;
      return next;
    });
  };

  const setCauseOfDeath = (causeId: number) => {
    setSelections((prev) => {
      const next = { ...prev };
      const base = prev[currentId] ?? createEmptySelection();
      const sel = cloneSelection(base);
      sel.selectedCauseOfDeath = causeId;
      next[currentId] = sel;
      return next;
    });
  };

  const setDisposal = (disposal: DisposalType) => {
    setSelections((prev) => {
      const next = { ...prev };
      const base = prev[currentId] ?? createEmptySelection();
      const sel = cloneSelection(base);
      sel.disposalType = disposal;
      next[currentId] = sel;
      return next;
    });
  };

  const handleClear = () => {
    setSelections((prev) => {
      const next = { ...prev };
      next[currentId] = createEmptySelection();
      return next;
    });
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      
      // Solo guardar el animal actual
      const animal = animales.find(a => a.code === currentId);
      if (!animal) {
        toast.error('Animal no encontrado');
        return;
      }
      
      const selection = selections[currentId];
      if (!selection) {
        toast.error('No hay datos para guardar');
        return;
      }
      
      // ✅ VALIDACIÓN: Siempre debe tener al menos un dictamen
      if (selection.dictamen.size === 0) {
        toast.error('Debe seleccionar al menos un dictamen');
        return;
      }
      
      // ✅ VALIDACIÓN: Si está marcado como animal muerto, debe tener causa de muerte y disposición
      if (selection.isDeadAnimal) {
        if (!selection.selectedCauseOfDeath) {
          toast.error('Debe seleccionar una causa de muerte');
          return;
        }
        if (!selection.disposalType) {
          toast.error('Debe seleccionar un tipo de disposición');
          return;
        }
      }
      
      // Siempre hay datos para guardar si hay al menos un dictamen seleccionado
      const hasData = 
        selection.dictamen.size > 0 || // Al menos un dictamen seleccionado
        selection.signsWithBodyParts.size > 0 || 
        Array.from(selection.simpleSigns.values()).some(v => v) ||
        selection.isDeadAnimal;
      
      if (!hasData) {
        toast.info('No hay datos para guardar');
        return;
      }
      
      // Verificar si es actualización o creación
      const currentAnimalHasSavedData = Boolean(savedAnimalIds[currentId]);
      
      if (currentAnimalHasSavedData) {
        try {
          const antemortemId = savedAnimalIds[currentId];
          if (!antemortemId) {
            throw new Error('No se encontró el ID del registro a actualizar');
          }
          
          const existingData = savedAnimalData[currentId] || null;
          
          const updateRequest = convertSelectionToUpdateRequest(
            animal.id,
            antemortemId,
            selection,
            existingData
          );
          
          // Actualizar en la API
          const response = await updateAntemortemService(antemortemId, updateRequest);
          
          if (response && (response.code === 200 || response.code === 201)) {
            toast.success(`Datos del animal ${currentId} actualizados exitosamente`);
            const updatedAnimalData = {
              ...existingData,
              ...updateRequest,
              id: antemortemId,
              updatedAt: new Date().toISOString()
            };
            
            // Actualizar el estado con los nuevos datos
            setSavedAnimalData(prev => ({
              ...prev,
              [currentId]: updatedAnimalData
            }));
            
            // Actualizar el estado inicial para detectar cambios futuros
            setInitialSelections(prev => ({
              ...prev,
              [currentId]: cloneSelection(selection)
            }));
            
            setHasUnsavedChanges(false);
            
            const currentCount = countSelection(selection);
            setAnimalTotalSigns(prev => ({
              ...prev,
              [currentId]: currentCount
            }));
            onSave?.({ ...selections, [currentId]: selection });
            const currentIndex = animales.findIndex(a => a.code === currentId);
            const nextIndex = currentIndex + 1 >= animales.length ? 0 : currentIndex + 1;
            const nextAnimal = animales[nextIndex];
            if (nextAnimal) {
              setCurrentId(nextAnimal.code);
            }
          } else {
            const errorMessage = response?.message || 'Error desconocido al actualizar';
            throw new Error(errorMessage);
          }
        } catch (error) {
          toast.error(`Error al actualizar: ${error instanceof Error ? error.message : 'Error desconocido'}`);
          throw error; // Re-lanzar para que el catch exterior lo maneje
        }
      } else {
        try {
          // CREAR nuevo registro
          const saveRequest = convertSelectionToSaveRequest(animal.id, selection);
          
          // Guardar en la API
          const response = await saveAntemortemService(saveRequest);
          
          if (response && (response.code === 200 || response.code === 201) && response.data) {
            toast.success(`Datos del animal ${currentId} guardados exitosamente`);
            
            const newAntemortemId = response.data.id;
            if (!newAntemortemId) {
              throw new Error('No se recibió un ID válido del servidor');
            }
            
            setSavedAnimalIds(prev => ({
              ...prev,
              [currentId]: newAntemortemId
            }));
            
            setSavedAnimalData(prev => ({
              ...prev,
              [currentId]: response.data
            }));
            
            // Actualizar el estado inicial para detectar cambios futuros
            setInitialSelections(prev => ({
              ...prev,
              [currentId]: cloneSelection(selection)
            }));
            
            // Forzar actualización del estado de cambios no guardados
            setHasUnsavedChanges(false);
            
            // Actualizar totalSigns con el contador actual
            const currentCount = countSelection(selection);
            setAnimalTotalSigns(prev => ({
              ...prev,
              [currentId]: currentCount
            }));
            
            // Llamar al callback onSave con los datos actualizados
            onSave?.({ ...selections, [currentId]: selection });
            
            // 🎯 SALTAR AL SIGUIENTE ANIMAL
            const currentIndex = animales.findIndex(a => a.code === currentId);
            const nextIndex = currentIndex + 1 >= animales.length ? 0 : currentIndex + 1;
            const nextAnimal = animales[nextIndex];
            if (nextAnimal) {
              setCurrentId(nextAnimal.code);
            }
          } else {
            const errorMessage = response?.message || 'Error desconocido al guardar';
            throw new Error(errorMessage);
          }
        } catch (error) {
          toast.error(`Error al guardar: ${error instanceof Error ? error.message : 'Error desconocido'}`);
          throw error;
        }
      }
    } catch (error) {
      toast.error('Error al procesar los datos. Por favor intente nuevamente.');
    } finally {
      setIsSaving(false);
    }
  };

  const listItemCount = (id: string) => {
    const hasLoadedData = savedAnimalData[id] !== undefined;
    const initialSelection = initialSelections[id];
    const currentSelection = selections[id];
    const hasBeenModified = initialSelection && currentSelection && 
      JSON.stringify(currentSelection) !== JSON.stringify(initialSelection);
    if (hasLoadedData || hasBeenModified) {
      return countSelection(currentSelection ?? createEmptySelection());
    }
    if (animalTotalSigns[id] !== undefined && animalTotalSigns[id] > 0) {
      return animalTotalSigns[id];
    }
    // Por defecto retornar 1 (Matanza Normal está seleccionado por defecto)
    return 1;
  };

  if (isLoadingAnimales || isLoadingSignos || isLoadingCauses || isLoadingOpinions) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogTitle className="sr-only">Cargando datos</DialogTitle>
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-600 mb-4" />
            <p className="text-sm text-muted-foreground">
              {isLoadingAnimales ? "Cargando animales..." : 
               isLoadingSignos ? "Cargando signos clínicos..." : 
               isLoadingCauses ? "Cargando causas de muerte..." :
               "Cargando opiniones..."}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-none sm:!max-w-none w-[98vw] h-[95vh] max-h-[95vh] md:w-[95vw] lg:w-[90vw] xl:w-[85vw] 2xl:w-[80vw] p-0 overflow-hidden flex flex-col">
        <DialogHeader className="px-4 sm:px-6 pt-4 sm:pt-5 pb-3 border-b">
          <DialogTitle>
            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-base font-semibold">Signos Clínicos</span>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200 text-xs sm:text-sm">
                    {marcaLabel}
                  </Badge>
                  <Badge variant="outline" className="bg-blue-500 text-white border-blue-500 text-xs sm:text-sm">
                    {animales.length} {animales.length === 1 ? 'animal' : 'animales'}
                  </Badge>
                  <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs sm:text-sm">
                    {totalCount} {totalCount === 1 ? 'signo' : 'signos'}
                  </Badge>
                </div>
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
          {/* Mobile animal selector - Mejorado para mejor UX */}
          <div className="md:hidden border-b p-3 bg-muted/20">
            <label className="block text-xs font-medium text-muted-foreground mb-2">
              Seleccionar Animal ({animales.length} total)
            </label>
            <select 
              value={currentId}
              onChange={(e) => handleAnimalChange(e.target.value)}
              disabled={isLoadingAnimalData}
              className="w-full p-3 border-2 rounded-lg text-base font-bold bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                color: animales.find(a => a.code === currentId)?.idAnimalSex === 1 ? '#E3AAAA' : '#2563eb'
              }}
            >
              {animales.map((animal) => {
                const isHembra = animal.idAnimalSex === 1;
                const sexo = isHembra ? 'H' : 'M';
                return (
                  <option 
                    key={animal.code} 
                    value={animal.code}
                    style={{
                      color: isHembra ? '#E3AAAA' : '#2563eb',
                      fontWeight: 'bold'
                    }}
                  >
                    {animal.code} {sexo}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Desktop animal list */}
          <div className="hidden md:block w-56 lg:w-64 border-r overflow-y-auto p-3">
            <div className="text-neutral-950 mb-2 font-semibold">Animales de la marca</div>
            <div className="text-xs text-muted-foreground mb-3">
              Total: {animales.length} animales
            </div>
            <div className="space-y-2 pr-1">
              {animales.map((animal) => {
                const selection = selections[animal.code] ?? createEmptySelection();
                const isAnimalMuerto = selection.isDeadAnimal;
                const isHembra = animal.idAnimalSex === 1;
                
                return (
                  <button
                    key={animal.code}
                    onClick={() => handleAnimalChange(animal.code)}
                    disabled={isLoadingAnimalData}
                    className={`w-full flex items-center justify-between rounded-lg px-3 py-2.5 text-left transition-colors border text-sm disabled:opacity-50 disabled:cursor-not-allowed
                      ${isAnimalMuerto 
                        ? 'bg-red-50 border-red-200 hover:bg-red-100' 
                        : animal.code === currentId 
                        ? (isHembra ? 'bg-rose-50 border-rose-300' : 'bg-blue-50 border-blue-300')
                        : 'bg-white border-gray-200 hover:bg-gray-50'}`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`font-medium ${
                        isAnimalMuerto 
                          ? 'text-red-600 ' 
                          : isHembra 
                          ? 'text-rose-400' 
                          : 'text-blue-400'
                      }`}>
                        {animal.code}
                      </span>
                      {isAnimalMuerto && (
                        <span className="text-red-600 text-xs bg-red-100 px-1.5 py-0.5 rounded-full flex items-center gap-1">
                          <Skull className="h-3 w-3" />
                          Muerto
                        </span>
                      )}
                      {!isAnimalMuerto && (
                        <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                          isHembra 
                            ? 'text-rose-400 bg-rose-100' 
                            : 'text-blue-400 bg-blue-100'
                        }`}>
                          {isHembra ? 'H' : 'M'}
                        </span>
                      )}
                    </div>
                    <Badge 
                      className={`ml-2 min-w-[24px] justify-center ${
                        isAnimalMuerto 
                          ? 'bg-red-500 hover:bg-red-700 ' 
                          : isHembra
                          ? 'bg-rose-400 hover:bg-rose-700'
                          : 'bg-blue-400 hover:bg-blue-700'
                      } text-white`}
                    >
                      {listItemCount(animal.code)}
                    </Badge>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right panel - animal details */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            {isLoadingAnimalData ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-600 mb-4" />
                <p className="text-sm text-muted-foreground">Cargando datos del animal...</p>
              </div>
            ) : (
              <>
                <div className="hidden md:flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div>
                      <span className="text-base font-medium">Animal:</span>
                      <span className="font-semibold text-lg ml-2">{currentId}</span>
                      {currentAnimalHasSavedData && (
                        <Badge variant="outline" className="ml-2 bg-green-50 text-green-700 border-green-200 text-xs">
                          Guardado
                        </Badge>
                      )}
                    </div>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-sm">
                      {currentCount} {currentCount === 1 ? 'signo' : 'signos'}
                    </Badge>
                  </div>
                </div>

            <div className="space-y-5">
              {/* Signos con ubicación */}
              {signsWithBodyParts.length > 0 && signsWithBodyParts.map((sign) => {
                const selectedParts = current.signsWithBodyParts.get(sign.id) || new Set();
                const allChecked = selectedParts.size === sign.bodyParts.length;
                
                return (
                  <div key={sign.id} className="rounded-md border">
                    <div className="px-4 py-3 text-sm font-medium flex items-center gap-3 bg-muted/30">
                      <Checkbox
                        id={`sign-header-${sign.id}`}
                        className="data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600 h-5 w-5"
                        checked={allChecked}
                        onCheckedChange={(checked) => toggleAllBodyParts(sign.id, sign.bodyParts, checked as boolean)}
                      />
                      <Label 
                        htmlFor={`sign-header-${sign.id}`}
                        className="flex-1 cursor-pointer flex items-center justify-between"
                      >
                        <span>{sign.description}</span>
                        <Badge variant="secondary" className="text-xs ml-2">
                          {selectedParts.size}/{sign.bodyParts.length}
                        </Badge>
                      </Label>
                    </div>
                    <div className="p-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                      {sign.bodyParts.map((bp) => {
                        const isChecked = selectedParts.has(bp.id);
                        
                        return (
                          <div key={bp.id} className="flex items-center space-x-2 p-2 rounded hover:bg-muted/30 transition-colors">
                            <Checkbox 
                              id={`${sign.id}-${bp.id}`} 
                              className="data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600 h-5 w-5"
                              checked={isChecked}
                              onCheckedChange={() => toggleBodyPart(sign.id, bp.id)} 
                            />
                            <Label htmlFor={`${sign.id}-${bp.id}`} className="text-sm cursor-pointer flex-1">
                              {bp.description}
                            </Label>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {/* Signos generales */}
              {simpleSigns.length > 0 && (
                <div className="rounded-md border">
                  <div className="px-4 py-3 text-sm font-medium bg-muted/30 border-b flex items-center justify-between">
                    <span>Signos Generales</span>
                    <Badge variant="secondary" className="text-xs">
                      {Array.from(current.simpleSigns.values()).filter(v => v).length}/{simpleSigns.length}
                    </Badge>
                  </div>
                  <div className="p-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {simpleSigns.map((sign) => {
                      const isChecked = current.simpleSigns.get(sign.id) || false;
                      
                      return (
                        <div key={sign.id} className="flex items-center space-x-2 p-2 rounded hover:bg-muted/30 transition-colors">
                          <Checkbox 
                            id={`s-${sign.id}`} 
                            className="data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600 h-5 w-5"
                            checked={isChecked}
                            onCheckedChange={() => toggleSimpleSign(sign.id)} 
                          />
                          <Label htmlFor={`s-${sign.id}`} className="text-sm cursor-pointer flex-1">
                            {sign.description}
                          </Label>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Animales Muertos */}
              <div className="rounded-md border border-red-300 overflow-hidden">
                <div className="px-4 py-3 bg-red-50/70 flex items-center gap-3">
                  <Checkbox 
                    id="dead-animal-check"
                    className="data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600 h-5 w-5"
                    checked={current.isDeadAnimal}
                    onCheckedChange={toggleDeadAnimal}
                  />
                  <Label 
                    htmlFor="dead-animal-check" 
                    className="cursor-pointer font-semibold text-base flex items-center gap-2 flex-1"
                    onClick={(e) => {
                      e.preventDefault();
                      toggleDeadAnimal();
                    }}
                  >
                    <Skull className="h-5 w-5 text-red-600" />
                    Animales Muertos
                  </Label>
                </div>
                
                {current.isDeadAnimal && (
                  <div className="p-4 space-y-4 bg-red-50/30">
                    {/* Selector de Causa de Muerte */}
                    <div className="space-y-2">
                      <Label htmlFor="cause-select" className="text-sm font-semibold">Causa de Muerte *</Label>
                      <Select 
                        value={current.selectedCauseOfDeath?.toString() || ""} 
                        onValueChange={(val) => setCauseOfDeath(Number(val))}
                      >
                        <SelectTrigger id="cause-select" className="w-full bg-white h-11 text-base">
                          <SelectValue placeholder="Selecciona una causa" />
                        </SelectTrigger>
                        <SelectContent>
                          {causesOfDeath.map((cause) => (
                            <SelectItem key={cause.id} value={cause.id.toString()} className="text-base py-3">
                              {cause.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {/* Tipo de Disposición */}
                    <div className="space-y-2">
                      <Label className="font-semibold text-sm">Tipo de Disposición *</Label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {DISPOSAL_TYPES.map((type) => (
                          <div 
                            key={type} 
                            className={`flex items-center space-x-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                              current.disposalType === type 
                                ? "bg-emerald-100 border-emerald-500 shadow-sm" 
                                : "bg-white hover:bg-gray-50 border-gray-200"
                            }`}
                            onClick={() => setDisposal(type)}
                          >
                            <Checkbox 
                              id={`disposal-${type}`}
                              className="data-[state=checked]:bg-primary data-[state=checked]:border-emerald-600 h-5 w-5"
                              checked={current.disposalType === type}
                              onCheckedChange={() => setDisposal(type)}
                            />
                            <Label htmlFor={`disposal-${type}`} className="cursor-pointer font-medium text-sm sm:text-base flex-1">
                              {type}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Dictamen Section */}
            <div className="rounded-md border">
              <div className="p-3 bg-muted/30 border-b">
                <h3 className="font-semibold text-base">Dictamen *</h3>
              </div>
              <div className="p-4 space-y-3">
                {opinions.filter(opinion => {
                  // Si el animal está muerto, ocultar Matanza Normal
                  if (current.isDeadAnimal && opinion.id === matanzaNormalId) {
                    return false;
                  }
                  return true;
                }).map((opinion) => {
                  const isMatanzaNormal = opinion.id === matanzaNormalId;
                  const matanzaNormalSelected = current.dictamen.has(matanzaNormalId);
                  const isDisabled = !isMatanzaNormal && matanzaNormalSelected;
                  const isChecked = current.dictamen.has(opinion.id);
                  
                  // Función para obtener colores según el tipo de opinión
                  const getOptionColors = () => {
                    if (isDisabled) {
                      return "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed";
                    }
                    
                    // Colores basados en el nombre de la opinión
                    const name = opinion.name.toLowerCase();
                    if (name.includes("matanza normal")) {
                      return isChecked 
                        ? "bg-green-100 border-green-400 text-green-800" 
                        : "border-green-200 hover:bg-green-50 text-green-700";
                    } else if (name.includes("precauciones")) {
                      return isChecked 
                        ? "bg-orange-100 border-orange-400 text-orange-800" 
                        : "border-orange-200 hover:bg-orange-50 text-orange-700";
                    } else if (name.includes("emergencia")) {
                      return isChecked 
                        ? "bg-red-100 border-red-400 text-red-800" 
                        : "border-red-200 hover:bg-red-50 text-red-700";
                    } else if (name.includes("aplazamiento")) {
                      return isChecked 
                        ? "bg-amber-100 border-amber-400 text-amber-800" 
                        : "border-amber-200 hover:bg-amber-50 text-amber-700";
                    }
                    return "border-gray-200";
                  };
                  
                  return (
                    <label 
                      key={opinion.id}
                      htmlFor={`dictamen-${opinion.id}`}
                      className={`flex items-start gap-3 rounded-lg border p-4 transition-colors ${getOptionColors()} ${
                        !isDisabled ? 'cursor-pointer hover:shadow-sm' : 'cursor-not-allowed'
                      }`}
                      title={isDisabled ? "Esta opción está bloqueada cuando 'MATANZA NORMAL' está seleccionada" : ""}
                    >
                      <Checkbox 
                        id={`dictamen-${opinion.id}`}
                        className={`h-5 w-5 mt-0.5 flex-shrink-0 ${
                          isMatanzaNormal 
                            ? 'data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600' 
                            : 'data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600'
                        } text-white ${isDisabled ? 'opacity-50' : ''}`}
                        checked={isChecked} 
                        disabled={isDisabled}
                        onCheckedChange={() => toggleDictamen(opinion.id)} 
                      />
                      <div className="flex-1">
                        <span className={`text-sm font-medium ${isDisabled ? 'opacity-70' : ''}`}>
                          {opinion.name}
                        </span>
                        {isDisabled && (
                          <div className="text-xs text-gray-500 mt-1 flex items-center">
                            <Lock className="w-3 h-3 mr-1" />
                            No disponible cuando 'MATANZA NORMAL' está seleccionada
                          </div>
                        )}
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
              </>
            )}
          </div>
        </div>
        <div className="border-t p-4 bg-background/95 backdrop-blur">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-sm text-muted-foreground hidden sm:block">
              Animal {currentId}: {currentCount} {currentCount === 1 ? 'signo' : 'signos'}
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <Button 
                variant="outline" 
                onClick={handleClear}
                className="w-full sm:w-auto h-11 sm:h-10"
              >
                Limpiar
              </Button>
              <Button 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                className="w-full sm:w-auto h-11 sm:h-10"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving || isLoadingAnimalData || (currentAnimalHasSavedData && !hasUnsavedChanges)}
                className="bg-emerald-600 hover:bg-emerald-700 w-full sm:w-auto h-11 sm:h-10 font-semibold"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {currentAnimalHasSavedData ? 'Actualizando...' : 'Guardando...'}
                  </>
                ) : (
                  <>
                    {currentAnimalHasSavedData ? 'Actualizar' : 'Guardar'} ({currentCount})
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>

      {/* Modal de confirmación para cambios sin guardar */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-amber-600">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Cambios sin guardar
            </DialogTitle>
            <DialogDescription className="text-base pt-4">
              Tienes cambios sin guardar en el animal <strong>{currentId}</strong>.
              <br /><br />
              Si cambias de animal, se perderán los cambios no guardados.
              <br /><br />
              ¿Deseas continuar sin guardar?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={handleCancelAnimalChange}
              className="sm:mr-2"
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmAnimalChange}
              className="bg-amber-600 hover:bg-amber-700"
            >
              Continuar sin guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}

export default SignosClinicosModal;
