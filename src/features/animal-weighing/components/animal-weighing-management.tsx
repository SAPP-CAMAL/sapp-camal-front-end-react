"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CalendarIcon, Download, Search, Scale, Calendar, Tag, Package, MapPin, Weight, Settings } from "lucide-react";
import { useState, useMemo, useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useLines } from "@/features/postmortem/hooks/use-lines";
import { useSerialScale } from "@/hooks/use-serial-scale";
import { toast } from "sonner";
import {
  useAnimalWeighingByFilters,
  useSaveAnimalWeighing,
  useUpdateAnimalWeighing,
  useWeighingStages,
  useHookTypesBySpecie,
  useChannelTypes,
  useChannelSectionsByType,
  useUnitMeasure,
} from "../hooks";
import type { ProductType, AnimalWeighingRow, WeighingStage } from "../domain";
import {
  getLocalDateString,
  parseLocalDateString,
} from "@/features/postmortem/utils/postmortem-helpers";
import { DatePicker } from "@/components/ui/date-picker";
import { format, parseISO } from "date-fns";

// Constantes de conversión
const LB_TO_KG = 0.453592; // 1 lb = 0.453592 kg
const KG_TO_LB = 2.20462;  // 1 kg = 2.20462 lb

// Funciones de conversión
const convertLbToKg = (lb: number): number => lb * LB_TO_KG;
const convertKgToLb = (kg: number): number => kg * KG_TO_LB;

// Función para redondear hacia arriba a 2 decimales
const roundUpToTwoDecimals = (value: number): number => {
  return Math.ceil(value * 100) / 100;
};

// Función para calcular el peso a mostrar (convertido a lb y con gancho restado si aplica)
const calculateDisplayWeight = (
  savedWeightKg: number,
  isLbUnit: boolean,
  weighingStageId: number | null,
  hookWeightKg: number = 0
): number => {
  if (savedWeightKg === 0) return 0;
  
  // Convertir de kg a lb si la unidad es LB
  const weightInLb = isLbUnit ? convertKgToLb(savedWeightKg) : savedWeightKg;
  
  // Si NO es EN PIE, el peso guardado ya es neto (sin gancho), así que solo convertir
  // Si es EN PIE, no hay gancho que restar
  return weightInLb;
};

export function AnimalWeighingManagement() {
  const [selectedLineId, setSelectedLineId] = useState<string>("");
  const [selectedSpecieId, setSelectedSpecieId] = useState<number | null>(4);
  const [slaughterDate, setSlaughterDate] = useState<string>(
    getLocalDateString()
  );
  const [weighingStage, setWeighingStage] = useState<WeighingStage>("ANTE");
  const [weighingStageId, setWeighingStageId] = useState<number | null>(null);
  const [productType, setProductType] = useState<ProductType>("MEDIA_CANAL");
  const [selectedHook, setSelectedHook] = useState<number | null>(null);
  const [selectedChannelTypeId, setSelectedChannelTypeId] = useState<
    number | null
  >(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [rows, setRows] = useState<AnimalWeighingRow[]>([]);
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);
  const [capturedWeight, setCapturedWeight] = useState<number | null>(null);
  const lastCapturedWeightRef = useRef<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const queryClient = useQueryClient();

  // Hook de balanza serial
  const {
    isConnected,
    currentWeight,
    error: scaleError,
    isSupported,
    connect: connectScale,
    disconnect: disconnectScale,
    resetWeight,
  } = useSerialScale();

  const { data: lines, isLoading: isLoadingLines } = useLines();
  const { data: weighingStagesData, isLoading: isLoadingWeighingStages } =
    useWeighingStages();
  const { data: hookTypesData, isLoading: isLoadingHookTypes } =
    useHookTypesBySpecie(selectedSpecieId);
  const { data: channelTypesData, isLoading: isLoadingChannelTypes } =
    useChannelTypes();
  const { data: channelSectionsData, isLoading: isLoadingChannelSections } =
    useChannelSectionsByType(selectedChannelTypeId);

  // Cargar secciones de todos los tipos de canal para tener la información completa
  const { data: mediaCanalSections } = useChannelSectionsByType(1); // Media Canal
  const { data: canalSections } = useChannelSectionsByType(2); // Canal
  const { data: cuartaSections } = useChannelSectionsByType(3); // Cuarta

  const { data: unitMeasureData } = useUnitMeasure();

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

  // Seleccionar automáticamente el primer ID de etapa de pesaje
  useEffect(() => {
    if (weighingStagesData?.data && weighingStagesData.data.length > 0) {
      const firstStage = weighingStagesData.data[0];
      setWeighingStage(firstStage.code as WeighingStage);
      setWeighingStageId(firstStage.id);
    }
  }, [weighingStagesData]);

  // Seleccionar automáticamente el primer gancho cuando se carguen
  useEffect(() => {
    if (hookTypesData?.data && hookTypesData.data.length > 0 && weighingStageId !== 1) {
      const firstHook = hookTypesData.data[0];
      setSelectedHook(firstHook.id);
    }
  }, [hookTypesData, weighingStageId]);

  // Seleccionar automáticamente el primer tipo de canal cuando se carguen
  useEffect(() => {
    if (channelTypesData?.data && channelTypesData.data.length > 0 && weighingStageId !== 1) {
      const firstChannel = channelTypesData.data[0];
      setSelectedChannelTypeId(firstChannel.id);
    }
  }, [channelTypesData, weighingStageId]);

  const weighingRequest = useMemo(() => {
    if (!slaughterDate || !selectedSpecieId || !weighingStageId) return null;
    return {
      slaughterDate,
      idSpecie: selectedSpecieId,
      idWeighingStage: weighingStageId,
    };
  }, [slaughterDate, selectedSpecieId, weighingStageId]);

  const { data: weighingData, isLoading: isLoadingWeighingData } = useAnimalWeighingByFilters(weighingRequest);
  const saveWeighingMutation = useSaveAnimalWeighing();
  const updateWeighingMutation = useUpdateAnimalWeighing();

  // Función helper para verificar si hay decomiso parcial
  // Los datos de productPostmortem ya vienen en weighingData dentro de cada animal
  const checkPartialConfiscation = (animal: any, sectionCode: string): boolean => {
    if (!animal?.productPostmortem || animal.productPostmortem.length === 0) {
      return false;
    }
    
    // Buscar si hay algún producto con decomiso parcial en esta sección
    const hasPartial = animal.productPostmortem.some(
      (product: any) => {
        const productSectionCode = product.sectionCode;
        
        // Si el producto tiene sectionCode y coincide con el de la tabla
        // Y NO es decomiso total, entonces hay decomiso parcial
        return productSectionCode && productSectionCode === sectionCode && product.isTotalConfiscation === false;
      }
    );
    
    return hasPartial;
  };

  // Generar filas basadas en datos de pesaje y secciones de canal
  useEffect(() => {
    if (!weighingData?.data) {
      setRows([]);
      return;
    }

    // Si NO es EN PIE y aún no se han cargado las secciones, esperar
    if (weighingStageId !== 1 && selectedChannelTypeId && !channelSectionsData?.data) {
      return; // No limpiar las filas, solo esperar a que se carguen las secciones
    }

    const newRows: AnimalWeighingRow[] = [];

    // Combinar animales de ingreso normal y emergencia
    const allAnimals = [
      ...weighingData.data.ingressNormal,
      ...weighingData.data.ingressEmergency,
    ];

    // Crear un mapa de todas las secciones conocidas (de todos los tipos de canal)
    const allKnownSections = new Map<number, { code: string; description: string }>();

    // Agregar secciones de Media Canal
    if (mediaCanalSections?.data) {
      mediaCanalSections.data.forEach(section => {
        allKnownSections.set(section.id, {
          code: section.sectionCode,
          description: section.description
        });
      });
    }

    // Agregar secciones de Canal
    if (canalSections?.data) {
      canalSections.data.forEach(section => {
        allKnownSections.set(section.id, {
          code: section.sectionCode,
          description: section.description
        });
      });
    }

    // Agregar secciones de Cuarta
    if (cuartaSections?.data) {
      cuartaSections.data.forEach(section => {
        allKnownSections.set(section.id, {
          code: section.sectionCode,
          description: section.description
        });
      });
    }

    // Agregar las del tipo actual si aún no están
    if (channelSectionsData?.data) {
      channelSectionsData.data.forEach(section => {
        if (!allKnownSections.has(section.id)) {
          allKnownSections.set(section.id, {
            code: section.sectionCode,
            description: section.description
          });
        }
      });
    }

    // Extraer información de secciones de los datos guardados como último recurso
    allAnimals.forEach((animal) => {
      if (animal.animalWeighing && animal.animalWeighing.length > 0) {
        animal.animalWeighing.forEach((weighing: any) => {
          if (weighing.detailAnimalWeighing) {
            weighing.detailAnimalWeighing.forEach((detail: any) => {
              if (detail.idConfigSectionChannel && detail.configSectionChannel) {
                if (!allKnownSections.has(detail.idConfigSectionChannel)) {
                  allKnownSections.set(detail.idConfigSectionChannel, {
                    code: detail.configSectionChannel.sectionCode,
                    description: detail.configSectionChannel.description
                  });
                }
              }
            });
          }
        });
      }
    });

    // Si es EN PIE (weighingStageId === 1) o no hay secciones, mostrar 1 fila por animal
    if (weighingStageId === 1 || !channelSectionsData?.data || channelSectionsData.data.length === 0) {
      allAnimals.forEach((animal) => {
        // Buscar si tiene peso guardado para esta etapa
        let savedWeight = 0;
        if (animal.animalWeighing && animal.animalWeighing.length > 0) {
          const weighingForStage = animal.animalWeighing.find(
            (w: any) => w.idWeighingStage === weighingStageId
          );
          if (weighingForStage && weighingForStage.detailAnimalWeighing && weighingForStage.detailAnimalWeighing.length > 0) {
            // Para EN PIE, tomar el primer detalle
            savedWeight = parseFloat(weighingForStage.detailAnimalWeighing[0].netWeight) || 0;
          }
        }

        const brandName = animal.detailCertificateBrands?.detailsCertificateBrand?.brand?.name;
        
        newRows.push({
          id: `${animal.id}`,
          animalId: animal.id,
          code: animal.code,
          producto: `${animal.animalSex.name} - ${animal.detailCertificateBrands.productiveStage.name}`,
          brandName: brandName,
          peso: savedWeight,
          savedWeight: savedWeight,
          fechaIngreso: animal.detailCertificateBrands.detailsCertificateBrand.createdAt,
          idDetailsCertificateBrands: animal.idDetailsCertificateBrands,
          idAnimalSex: animal.idAnimalSex,
        });
      });
    } else {
      // Si hay secciones de canal, solo mostrar filas con datos guardados
      allAnimals.forEach((animal) => {
        // Obtener TODAS las secciones guardadas para este animal en esta etapa
        const savedSections = new Map<number, number>(); // Map<idConfigSectionChannel, peso>
        let idAnimalWeighing: number | undefined = undefined;

        if (animal.animalWeighing && animal.animalWeighing.length > 0) {
          const weighingForStage = animal.animalWeighing.find(
            (w: any) => w.idWeighingStage === weighingStageId
          );
          if (weighingForStage) {
            idAnimalWeighing = weighingForStage.id; // Guardar el ID del registro de pesaje
            if (weighingForStage.detailAnimalWeighing) {
              weighingForStage.detailAnimalWeighing.forEach((detail: any) => {
                if (detail.idConfigSectionChannel) {
                  savedSections.set(
                    detail.idConfigSectionChannel,
                    parseFloat(detail.netWeight) || 0
                  );
                }
              });
            }
          }
        }

        // Verificar qué secciones guardadas pertenecen al tipo de canal actual
        const savedSectionsInCurrentType = new Set<number>();
        savedSections.forEach((weight, sectionId) => {
          const belongsToCurrentType = channelSectionsData.data.some(s => s.id === sectionId);
          if (belongsToCurrentType) {
            savedSectionsInCurrentType.add(sectionId);
          }
        });

        // Si tiene secciones guardadas del tipo actual, mostrar TODAS las secciones del tipo actual
        // (las guardadas con peso y las faltantes sin peso)
        if (savedSectionsInCurrentType.size > 0) {
          channelSectionsData.data.forEach((section) => {
            const savedWeight = savedSections.get(section.id) || 0;
            const hasPartialConfiscation = checkPartialConfiscation(animal, section.sectionCode);

            newRows.push({
              id: `${animal.id}-${section.id}`,
              animalId: animal.id,
              code: animal.code,
              producto: `${animal.animalSex.name} - ${animal.detailCertificateBrands.productiveStage.name}`,
              brandName: animal.detailCertificateBrands?.detailsCertificateBrand?.brand?.name,
              peso: savedWeight,
              savedWeight: savedWeight,
              fechaIngreso: animal.detailCertificateBrands.detailsCertificateBrand.createdAt,
              idDetailsCertificateBrands: animal.idDetailsCertificateBrands,
              idAnimalSex: animal.idAnimalSex,
              sectionCode: section.sectionCode,
              sectionDescription: section.description,
              idChannelSection: section.id,
              idAnimalWeighing: savedWeight > 0 ? idAnimalWeighing : undefined,
              hasPartialConfiscation,
            });
          });
        } else if (savedSections.size > 0) {
          // Si tiene secciones guardadas pero NO del tipo actual, mostrar solo las guardadas
          savedSections.forEach((weight, sectionId) => {
            const sectionInfo = allKnownSections.get(sectionId);
            if (sectionInfo) {
              const hasPartialConfiscation = checkPartialConfiscation(animal, sectionInfo.code);

              newRows.push({
                id: `${animal.id}-${sectionId}`,
                animalId: animal.id,
                code: animal.code,
                producto: `${animal.animalSex.name} - ${animal.detailCertificateBrands.productiveStage.name}`,
                brandName: animal.detailCertificateBrands?.detailsCertificateBrand?.brand?.name,
                peso: weight,
                savedWeight: weight,
                fechaIngreso: animal.detailCertificateBrands.detailsCertificateBrand.createdAt,
                idDetailsCertificateBrands: animal.idDetailsCertificateBrands,
                idAnimalSex: animal.idAnimalSex,
                sectionCode: sectionInfo.code,
                sectionDescription: sectionInfo.description,
                idChannelSection: sectionId,
                idAnimalWeighing: idAnimalWeighing,
                hasPartialConfiscation,
              });
            }
          });
        } else {
          // Si no hay datos guardados, mostrar todas las secciones del tipo actual
          channelSectionsData.data.forEach((section) => {
            const hasPartialConfiscation = checkPartialConfiscation(animal, section.sectionCode);

            newRows.push({
              id: `${animal.id}-${section.id}`,
              animalId: animal.id,
              code: animal.code,
              producto: `${animal.animalSex.name} - ${animal.detailCertificateBrands.productiveStage.name}`,
              brandName: animal.detailCertificateBrands?.detailsCertificateBrand?.brand?.name,
              peso: 0,
              savedWeight: 0,
              fechaIngreso: animal.detailCertificateBrands.detailsCertificateBrand.createdAt,
              idDetailsCertificateBrands: animal.idDetailsCertificateBrands,
              idAnimalSex: animal.idAnimalSex,
              sectionCode: section.sectionCode,
              sectionDescription: section.description,
              idChannelSection: section.id,
              hasPartialConfiscation,
            });
          });
        }
      });
    }

    // Calcular si cada animal está completo
    const animalCompletionMap = new Map<string, boolean>();

    // Para EN PIE o sin secciones: completo si tiene peso
    if (weighingStageId === 1 || !channelSectionsData?.data || channelSectionsData.data.length === 0) {
      allAnimals.forEach((animal) => {
        let hasWeight = false;
        if (animal.animalWeighing && animal.animalWeighing.length > 0) {
          const weighingForStage = animal.animalWeighing.find(
            (w: any) => w.idWeighingStage === weighingStageId
          );
          if (weighingForStage && weighingForStage.detailAnimalWeighing && weighingForStage.detailAnimalWeighing.length > 0) {
            hasWeight = weighingForStage.detailAnimalWeighing.some(
              (d: any) => parseFloat(d.netWeight) > 0
            );
          }
        }
        animalCompletionMap.set(animal.code, hasWeight);
      });
    } else {
      // Para canales con secciones: completo si tiene TODAS las secciones de CUALQUIER tipo de canal
      allAnimals.forEach((animal) => {
        const savedSectionIds = new Set<number>();

        if (animal.animalWeighing && animal.animalWeighing.length > 0) {
          const weighingForStage = animal.animalWeighing.find(
            (w: any) => w.idWeighingStage === weighingStageId
          );
          if (weighingForStage && weighingForStage.detailAnimalWeighing) {
            weighingForStage.detailAnimalWeighing.forEach((detail: any) => {
              if (detail.idConfigSectionChannel && parseFloat(detail.netWeight) > 0) {
                savedSectionIds.add(detail.idConfigSectionChannel);
              }
            });
          }
        }

        // Verificar si está completo en CUALQUIER tipo de canal
        let isComplete = false;

        // Verificar Canal Entera
        if (canalSections?.data) {
          const canalIds = canalSections.data.map(s => s.id);
          if (canalIds.length > 0 && canalIds.every(id => savedSectionIds.has(id))) {
            isComplete = true;
          }
        }

        // Verificar Media Canal
        if (!isComplete && mediaCanalSections?.data) {
          const mediaCanalIds = mediaCanalSections.data.map(s => s.id);
          if (mediaCanalIds.length > 0 && mediaCanalIds.every(id => savedSectionIds.has(id))) {
            isComplete = true;
          }
        }

        // Verificar Cuarta
        if (!isComplete && cuartaSections?.data) {
          const cuartaIds = cuartaSections.data.map(s => s.id);
          if (cuartaIds.length > 0 && cuartaIds.every(id => savedSectionIds.has(id))) {
            isComplete = true;
          }
        }

        animalCompletionMap.set(animal.code, isComplete);
      });
    }

    // Marcar cada fila con isComplete
    newRows.forEach(row => {
      row.isComplete = animalCompletionMap.get(row.code) || false;
    });

    // Ordenar: primero los incompletos, luego los completos
    // Dentro de cada grupo, ordenar por código de animal y sección
    newRows.sort((a, b) => {
      // Primero ordenar por completitud (incompletos primero)
      if (a.isComplete !== b.isComplete) {
        return a.isComplete ? 1 : -1;
      }

      // Luego por código de animal
      const codeCompare = a.code.localeCompare(b.code);
      if (codeCompare !== 0) return codeCompare;

      // Finalmente por sección
      if (a.sectionCode && b.sectionCode) {
        return a.sectionCode.localeCompare(b.sectionCode);
      }
      return 0;
    });

    setRows(newRows);
  }, [weighingData, weighingStageId, channelSectionsData, selectedChannelTypeId, mediaCanalSections, canalSections, cuartaSections]);

  const handleHookSelect = (hookId: number) => {
    setSelectedHook(hookId);
  };

  const handleWeightChange = (rowId: string, weight: number) => {
    setRows((prev) =>
      prev.map((row) => (row.id === rowId ? { ...row, peso: weight } : row))
    );
  };

  const handleSaveWeight = async (row: AnimalWeighingRow) => {
    if (row.peso <= 0) {
      toast.error("El peso debe ser mayor a 0");
      return;
    }

    // Validar que haya especie e ID de etapa de pesaje
    if (!selectedSpecieId || !weighingStageId) {
      toast.error("Faltan datos requeridos");
      return;
    }

    // Si NO es EN PIE, validar que haya un gancho seleccionado
    if (weighingStageId !== 1 && !selectedHook) {
      toast.error("Debe seleccionar un gancho");
      return;
    }

    const unitCode = unitMeasureData?.data?.code || 'LB';
    const unitSymbol = 'lb'; // Siempre mostrar en lb en pantalla
    const isLbUnit = unitCode === 'LB';
    
    // Peso en pantalla (siempre en lb)
    const grossWeightDisplay = row.peso; // Peso bruto mostrado en pantalla
    let netWeightDisplay = grossWeightDisplay;
    let hookWeightDisplay = 0;

    // Si NO es EN PIE, calcular peso neto restando el gancho
    if (weighingStageId !== 1 && selectedHook) {
      const selectedHookData = hookTypesData?.data.find(h => h.id === selectedHook);
      // Los ganchos vienen en kg, convertir a lb para mostrar
      const hookWeightKg = selectedHookData ? parseFloat(selectedHookData.weight) : 0;
      hookWeightDisplay = convertKgToLb(hookWeightKg);
      netWeightDisplay = grossWeightDisplay - hookWeightDisplay;
    }

    try {
      // Obtener el ID de la unidad de medida desde la API
      const unitMeasureId = unitMeasureData?.data?.id || 2; // Default a 2 si no hay datos

      // Convertir pesos a kg si la unidad configurada es LB y redondear hacia arriba a 2 decimales
      const grossWeightToSave = isLbUnit 
        ? roundUpToTwoDecimals(convertLbToKg(grossWeightDisplay)) 
        : roundUpToTwoDecimals(grossWeightDisplay);
      
      const netWeightToSave = isLbUnit 
        ? roundUpToTwoDecimals(convertLbToKg(netWeightDisplay)) 
        : roundUpToTwoDecimals(netWeightDisplay);

      const detailsAnimalWeighing: any = {
        grossWeight: grossWeightToSave,
        netWeight: netWeightToSave,
        idUnitMeasure: unitMeasureId, // Agregar ID de unidad de medida
      };

      // Solo agregar idHookType si NO es EN PIE
      if (weighingStageId !== 1 && selectedHook) {
        detailsAnimalWeighing.idHookType = selectedHook;
      }

      // Solo agregar idConfigSectionChannel si existe (cuando hay secciones)
      if (row.idChannelSection) {
        detailsAnimalWeighing.idConfigSectionChannel = row.idChannelSection;
      }

      // Decidir si es POST (nuevo) o PATCH (actualización)
      if (row.idAnimalWeighing) {
        // PATCH - Actualizar peso existente
        await updateWeighingMutation.mutateAsync({
          idAnimalWeighing: row.idAnimalWeighing,
          data: {
            idWeighingStage: weighingStageId,
            idSpecie: selectedSpecieId,
            detailsAnimalWeighing: [detailsAnimalWeighing]
          }
        });
      } else {
        // POST - Crear nuevo peso
        await saveWeighingMutation.mutateAsync({
          idWeighingStage: weighingStageId,
          idDetailsSpeciesCertificate: row.animalId,
          idSpecie: selectedSpecieId,
          observation: "",
          detailsAnimalWeighing: [detailsAnimalWeighing]
        });
      }

      const message = weighingStageId === 1
        ? `Peso ${row.idAnimalWeighing ? 'actualizado' : 'guardado'}: ${grossWeightDisplay.toFixed(2)} ${unitSymbol}`
        : `Peso ${row.idAnimalWeighing ? 'actualizado' : 'guardado'}: Bruto ${grossWeightDisplay.toFixed(2)} ${unitSymbol}, Neto ${netWeightDisplay.toFixed(2)} ${unitSymbol}`;

      toast.success(message);

      // Invalidar la query para refrescar los datos desde la API
      queryClient.invalidateQueries({ queryKey: ["animal-weighing"] });

      setSelectedRowId(null);
      setCapturedWeight(null);
      lastCapturedWeightRef.current = null;
    } catch (error) {
      console.error('Error al guardar:', error);
      toast.error("Error al guardar el peso");
    }
  };

  // Capturar peso estable de la balanza
  useEffect(() => {
    if (currentWeight && selectedRowId) {
      console.log('⚖️ Peso recibido de balanza:', {
        value: currentWeight.value,
        unit: currentWeight.unit,
        stable: currentWeight.stable,
        selectedRowId
      });

      const unitCode = unitMeasureData?.data?.code || 'LB';
      const isLbUnit = unitCode === 'LB';
      const unitSymbol = 'lb'; // Siempre mostrar en lb
      
      // La balanza envía en kg, convertir a lb para mostrar si la unidad configurada es LB
      const weightFromScale = currentWeight.value;
      const weightToDisplay = isLbUnit ? convertKgToLb(weightFromScale) : weightFromScale;

      // Evitar capturas duplicadas del mismo peso
      const roundedWeight = Math.round(weightToDisplay * 100) / 100;
      if (lastCapturedWeightRef.current === roundedWeight) {
        console.log('❌ Peso duplicado, ignorando:', roundedWeight);
        return;
      }

      console.log('✅ Actualizando peso en fila:', {
        rowId: selectedRowId,
        pesoOriginal: weightFromScale,
        pesoConvertido: roundedWeight,
        unidad: unitSymbol
      });

      lastCapturedWeightRef.current = roundedWeight;
      setCapturedWeight(roundedWeight);

      // Actualizar el peso en la fila
      setRows((prev) => {
        const updated = prev.map((row) =>
          row.id === selectedRowId ? { ...row, peso: roundedWeight } : row
        );
        console.log('📊 Filas actualizadas:', updated.find(r => r.id === selectedRowId));
        return updated;
      });

      toast.success(
        `Peso capturado: ${roundedWeight.toFixed(2)} ${unitSymbol}`
      );
    }
  }, [currentWeight?.value, currentWeight?.unit, currentWeight?.stable, selectedRowId, unitMeasureData]);

  // Calcular pesos a mostrar (convertidos a lb)
  const rowsWithDisplayWeight = useMemo(() => {
    const unitCode = unitMeasureData?.data?.code || 'LB';
    const isLbUnit = unitCode === 'LB';
    
    return rows.map(row => {
      // El peso guardado está en kg, convertir a lb para mostrar
      const displayWeight = calculateDisplayWeight(
        row.savedWeight,
        isLbUnit,
        weighingStageId
      );
      
      return {
        ...row,
        displayWeight: displayWeight
      };
    });
  }, [rows, unitMeasureData, weighingStageId]);

  const filteredRows = useMemo(() => {
    if (!searchTerm) return rowsWithDisplayWeight;
    return rowsWithDisplayWeight.filter((row) =>
      row.code.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [rowsWithDisplayWeight, searchTerm]);

  // Agrupar filas por animal
  const groupedByAnimal = useMemo(() => {
    const groups: { [key: string]: typeof filteredRows } = {};
    filteredRows.forEach((row) => {
      if (!groups[row.code]) {
        groups[row.code] = [];
      }
      groups[row.code].push(row);
    });
    return groups;
  }, [filteredRows]);

  // Obtener lista de códigos de animales únicos
  const animalCodes = useMemo(() => Object.keys(groupedByAnimal), [groupedByAnimal]);

  // Calcular paginación por animales (no por filas)
  const totalAnimals = animalCodes.length;
  const totalPages = Math.ceil(totalAnimals / itemsPerPage);
  const startAnimalIndex = (currentPage - 1) * itemsPerPage;
  const endAnimalIndex = startAnimalIndex + itemsPerPage;
  const paginatedAnimalCodes = animalCodes.slice(startAnimalIndex, endAnimalIndex);

  // Obtener todas las filas de los animales paginados
  const paginatedRows = useMemo(() => {
    const rows: typeof filteredRows = [];
    paginatedAnimalCodes.forEach((code) => {
      rows.push(...groupedByAnimal[code]);
    });
    return rows;
  }, [paginatedAnimalCodes, groupedByAnimal]);

  // Resetear a página 1 cuando cambie el filtro de búsqueda o el tamaño de página
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, itemsPerPage]);

  const totalRecords = filteredRows.length;

  return (
    <div className="space-y-4 p-2 sm:p-4 pb-64 max-w-full overflow-x-hidden min-h-full">
      <div className="text-center">
        <h1 className="text-lg sm:text-xl font-semibold mb-2">PESAJE DE ANIMALES</h1>
        <p className="text-muted-foreground text-xs sm:text-sm">
          Fecha de Faenamiento:{" "}
          {parseLocalDateString(slaughterDate).toLocaleDateString("es-ES", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      {/* Balanza Serial */}
      <Card className="p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3">
            <div className="flex items-center gap-2">
              <Scale className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
              <Label className="text-sm sm:text-base font-semibold">
                EQUIPOS DE PESAJE INDUSTRIAL X1
              </Label>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {isConnected ? (
                <>
                  <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-xs sm:text-sm text-green-700 font-medium">
                    Conectada
                  </span>
                  <Button size="sm" variant="outline" onClick={disconnectScale} className="text-xs sm:text-sm">
                    Desconectar
                  </Button>
                </>
              ) : (
                <>
                  <span className="flex h-2 w-2 rounded-full bg-gray-400" />
                  <span className="text-xs sm:text-sm text-gray-600">Desconectada</span>
                  <Button
                    size="sm"
                    onClick={connectScale}
                    disabled={!isSupported}
                    className="text-xs sm:text-sm"
                  >
                    Conectar Balanza
                  </Button>
                </>
              )}
            </div>
          </div>

          {isConnected && (
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 sm:gap-4 p-3 sm:p-4 bg-white rounded-lg border-2 border-blue-300">
              <div className="flex-1 w-full">
                <p className="text-xs sm:text-sm text-gray-600 mb-2">Peso Actual</p>
                {currentWeight ? (
                  <div className="space-y-2">
                    {/* Peso principal convertido a lb */}
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span className={`text-2xl sm:text-3xl md:text-4xl font-bold ${currentWeight.value < 0 ? 'text-red-900' : 'text-blue-900'}`}>
                        {(() => {
                          const unitCode = unitMeasureData?.data?.code || 'LB';
                          const isLbUnit = unitCode === 'LB';
                          const displayWeight = isLbUnit ? convertKgToLb(currentWeight.value) : currentWeight.value;
                          return displayWeight.toFixed(2);
                        })()}
                      </span>
                      <span className={`text-xl sm:text-2xl font-semibold ${currentWeight.value < 0 ? 'text-red-700' : 'text-blue-700'}`}>
                        lb
                      </span>
                      {currentWeight.stable && (
                        <span className="ml-2 px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded">
                          ESTABLE
                        </span>
                      )}
                    </div>
                  </div>
                ) : (
                  <span className="text-lg sm:text-xl md:text-2xl text-gray-400">
                    Esperando lectura...
                  </span>
                )}
              </div>
              {selectedRowId && (
                <div className="text-left md:text-right w-full md:w-auto">
                  <p className="text-xs sm:text-sm text-gray-600">Animal Seleccionado</p>
                  <p className="text-base sm:text-lg font-semibold text-blue-900">
                    {rows.find((r) => r.id === selectedRowId)?.code}
                  </p>
                </div>
              )}
            </div>
          )}

          {scaleError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{scaleError}</p>
            </div>
          )}

          {!isSupported && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                Tu navegador no soporta Web Serial API. Usa Chrome o Edge.
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Etapa de Pesaje y Fecha */}
      <Card className="p-3 sm:p-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 sm:gap-4">
          {/* Fecha a la izquierda */}
          <div className="flex items-center gap-2 w-full lg:w-auto">
            <Label className="whitespace-nowrap font-semibold">
              Fecha de Faenamiento:
            </Label>
            {/* <div className="relative flex-1 lg:flex-initial">
              <Input
                id="fecha-weighing"
                type="date"
                className="w-full lg:w-52 bg-white pl-10 cursor-pointer [&::-webkit-calendar-picker-indicator]:hidden"
                value={slaughterDate}
                onChange={(e) => setSlaughterDate(e.target.value)}
                onClick={(e) => {
                  const input = e.currentTarget;
                  input.showPicker?.();
                }}
              />
              <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            </div> */}

            <DatePicker
              inputClassName='bg-secondary'
              selected={parseISO(slaughterDate)}
              onChange={date => {
                if (!date) return;
                const formattedDate = format(date, 'yyyy-MM-dd');
                setSlaughterDate(formattedDate);
              }}
            />

          </div>

          {/* Etapa de Pesaje a la derecha */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full lg:w-auto">
            <Label className="whitespace-nowrap font-semibold">
              Etapa de Pesaje:
            </Label>

            {/* Versión móvil - Select */}
            <div className="block lg:hidden w-full">
              {isLoadingWeighingStages ? (
                <span className="text-sm text-muted-foreground">Cargando...</span>
              ) : (
                <Select
                  value={weighingStageId?.toString()}
                  onValueChange={(value) => {
                    const stage = weighingStagesData?.data.find(s => s.id.toString() === value);
                    if (stage) {
                      setWeighingStage(stage.code as WeighingStage);
                      setWeighingStageId(stage.id);
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione etapa" />
                  </SelectTrigger>
                  <SelectContent>
                    {weighingStagesData?.data.map((stage) => (
                      <SelectItem key={stage.id} value={stage.id.toString()}>
                        {stage.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Versión desktop - Botones */}
            <TooltipProvider>
              <div className="hidden lg:flex gap-2 w-full sm:w-auto">
                {isLoadingWeighingStages ? (
                  <span className="text-sm text-muted-foreground">
                    Cargando...
                  </span>
                ) : (
                  weighingStagesData?.data.map((stage) => (
                    <Tooltip key={stage.code}>
                      <TooltipTrigger asChild>
                        <Button
                          variant={
                            weighingStage === stage.code ? "default" : "outline"
                          }
                          size="lg"
                          onClick={() => {
                            setWeighingStage(stage.code as WeighingStage);
                            setWeighingStageId(stage.id);
                          }}
                          className="flex-1 sm:flex-initial"
                        >
                          {stage.name}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">{stage.description}</p>
                      </TooltipContent>
                    </Tooltip>
                  ))
                )}
              </div>
            </TooltipProvider>
          </div>
        </div>
      </Card>

      {/* Especie - Siempre visible */}
      <Card className="p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
          <Label className="whitespace-nowrap font-semibold">Especie:</Label>

          {/* Versión móvil - Select */}
          <div className="block lg:hidden w-full">
            {isLoadingLines ? (
              <span className="text-sm text-muted-foreground">Cargando...</span>
            ) : (
              <Select
                value={selectedLineId}
                onValueChange={(value) => {
                  const line = lines?.find(l => l.id.toString() === value);
                  if (line) {
                    setSelectedLineId(value);
                    setSelectedSpecieId(line.idSpecie);
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione especie" />
                </SelectTrigger>
                <SelectContent>
                  {lines?.map((line) => (
                    <SelectItem key={line.id} value={line.id.toString()}>
                      {line.description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Versión desktop - Botones */}
          <div className="hidden lg:flex flex-wrap gap-2 w-full sm:w-auto">
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
                  className="flex-1 sm:flex-initial"
                >
                  {line.description}
                </Button>
              ))
            )}
          </div>
        </div>
      </Card>

      {/* Ganchos - Solo mostrar cuando weighingStageId !== 1 (no es EN PIE) */}
      {weighingStageId !== null && weighingStageId !== 1 && (
      <Card className="p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
          <Label className="whitespace-nowrap font-semibold">Ganchos:</Label>

          {/* Versión móvil - Select */}
          <div className="block lg:hidden w-full">
            {isLoadingHookTypes ? (
              <span className="text-sm text-muted-foreground">Cargando...</span>
            ) : (
              <Select
                value={selectedHook?.toString()}
                onValueChange={(value) => handleHookSelect(parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione gancho" />
                </SelectTrigger>
                <SelectContent>
                  {hookTypesData?.data.map((hook) => (
                    <SelectItem key={hook.id} value={hook.id.toString()}>
                      {hook.name} ({hook.weight} kg)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Versión desktop - Botones */}
          <div className="hidden lg:flex flex-wrap gap-2 w-full sm:w-auto">
            {isLoadingHookTypes ? (
              <span className="text-sm text-muted-foreground">
                Cargando...
              </span>
            ) : (
              hookTypesData?.data.map((hook) => (
                <Button
                  key={hook.id}
                  variant={selectedHook === hook.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleHookSelect(hook.id)}
                  className="flex-1 sm:flex-initial min-w-[80px]"
                >
                  {hook.name}{" "}
                  <span className="text-xs ml-1">({hook.weight} kg)</span>
                </Button>
              ))
            )}
          </div>
        </div>
      </Card>
      )}

      {/* Tipo de Canal - Solo mostrar cuando weighingStageId !== 1 (no es EN PIE) */}
      {weighingStageId !== null && weighingStageId !== 1 && (
      <>
        <Card className="p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
            <Label className="flex-shrink-0 font-semibold">Tipo de Canal:</Label>

            {/* Versión móvil - Select */}
            <div className="block lg:hidden w-full">
              {isLoadingChannelTypes ? (
                <span className="text-sm text-muted-foreground">Cargando...</span>
              ) : (
                <Select
                  value={selectedChannelTypeId?.toString()}
                  onValueChange={(value) => setSelectedChannelTypeId(parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione tipo de canal" />
                  </SelectTrigger>
                  <SelectContent>
                    {channelTypesData?.data.map((channel) => (
                      <SelectItem key={channel.id} value={channel.id.toString()}>
                        {channel.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Versión desktop - Botones */}
            <TooltipProvider>
              <div className="hidden lg:flex gap-2 w-full sm:w-auto">
                {isLoadingChannelTypes ? (
                  <span className="text-sm text-muted-foreground">
                    Cargando...
                  </span>
                ) : (
                  channelTypesData?.data.map((channel) => (
                    <Tooltip key={channel.id}>
                      <TooltipTrigger asChild>
                        <Button
                          variant={
                            selectedChannelTypeId === channel.id
                              ? "default"
                              : "outline"
                          }
                          size="sm"
                          onClick={() => setSelectedChannelTypeId(channel.id)}
                          className="flex-1 sm:flex-initial"
                        >
                          {channel.name}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">{channel.description}</p>
                      </TooltipContent>
                    </Tooltip>
                  ))
                )}
              </div>
            </TooltipProvider>
          </div>
        </Card>


      </>
      )}

      {/* Búsqueda y Tabla */}
      <Card className="p-2 sm:p-3 md:p-4">
        <div className="mb-3 sm:mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {totalRecords} registro{totalRecords !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por código de animal"
                className="pl-8 w-full"
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

        {/* Versión móvil - Cards */}
        <div className="block lg:hidden space-y-3">
          {filteredRows.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {isLoadingWeighingData ? "Cargando animales..." : "No hay registros disponibles"}
            </div>
          ) : (
            (() => {
              const groupedRows: { [key: string]: typeof filteredRows } = {};
              filteredRows.forEach((row) => {
                if (!groupedRows[row.code]) {
                  groupedRows[row.code] = [];
                }
                groupedRows[row.code].push(row);
              });

              return Object.entries(groupedRows).map(([animalCode, animalRows]) => (
                <Card key={animalCode} className={`p-3 border-4 border-teal-600 shadow-lg ${animalRows[0].isComplete ? 'bg-[#86c6c5]' : 'bg-green-50'}`}>
                  {/* Información del animal */}
                  <div className="mb-3 pb-3 border-b">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                          <Tag className="h-3 w-3" />
                          <span>ID-Marca</span>
                        </div>
                        <div className="text-lg font-bold">
                          {animalRows[0].brandName ? `${animalCode} - ${animalRows[0].brandName}` : animalCode}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1 justify-end">
                          <Calendar className="h-3 w-3" />
                          <span>Fecha de Ingreso</span>
                        </div>
                        <div className="text-sm">
                          {new Date(animalRows[0].fechaIngreso).toLocaleDateString("es-ES", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          })}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                      <Package className="h-3 w-3" />
                      <span>Género - Etapa Productiva</span>
                    </div>
                    <div className="text-sm">{animalRows[0].producto}</div>
                  </div>

                  {/* Secciones */}
                  <div className="space-y-2">
                    {animalRows.map((row) => (
                      <div key={row.id} className="p-2 bg-white/50 rounded border">
                        {weighingStageId !== 1 && row.sectionCode && (
                          <div className="mb-2">
                            <div className="flex items-center gap-1 mb-1">
                              <MapPin className="h-3 w-3 text-blue-600" />
                              <span className="font-bold text-blue-600 text-sm">{row.sectionCode}</span>
                              <span className="text-xs text-muted-foreground ml-1">{row.sectionDescription}</span>
                            </div>
                            {row.hasPartialConfiscation && (
                              <div className="flex items-center gap-1 mt-1 text-yellow-600">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                <span className="text-xs font-semibold">Decomiso parcial</span>
                              </div>
                            )}
                          </div>
                        )}

                        <div className="flex items-center justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                              <Weight className="h-3 w-3" />
                              <span>Peso</span>
                            </div>
                            <div className={`font-semibold ${row.displayWeight < 0 ? 'text-red-600' : 'text-green-600'}`}>
                              {row.displayWeight !== 0 ? `${row.displayWeight.toFixed(2)} lb` : "-"}
                            </div>
                          </div>

                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant={selectedRowId === row.id ? "default" : "outline"}
                              className={`text-xs whitespace-nowrap ${
                                selectedRowId === row.id ? "bg-green-600" : "text-green-600 border-green-600"
                              }`}
                              onClick={() => {
                                if (selectedRowId === row.id) {
                                  setSelectedRowId(null);
                                  setCapturedWeight(null);
                                } else {
                                  setSelectedRowId(row.id);
                                  setCapturedWeight(null);
                                  resetWeight();
                                }
                              }}
                              disabled={!isConnected}
                            >
                              {selectedRowId === row.id ? "CAPTURADO" : "CAPTURAR"}
                            </Button>
                            {selectedRowId === row.id && (
                              <Button
                                size="sm"
                                className="bg-blue-600 text-xs whitespace-nowrap"
                                onClick={() => handleSaveWeight(row)}
                                disabled={saveWeighingMutation.isPending || updateWeighingMutation.isPending || !capturedWeight}
                              >
                                {(saveWeighingMutation.isPending || updateWeighingMutation.isPending)
                                  ? (row.savedWeight > 0 ? "ACTUALIZANDO..." : "GUARDANDO...")
                                  : (row.savedWeight > 0 ? "ACTUALIZAR" : "GUARDAR")}
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              ));
            })()
          )}
        </div>

        {/* Versión desktop - Tabla */}
        <div className="hidden lg:block overflow-x-auto border rounded-lg">
          <Table className="min-w-full">
            <TableHeader>
              <TableRow>
                <TableHead className="text-center text-xs sm:text-sm whitespace-nowrap">
                  <div className="flex items-center justify-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>Fecha de Ingreso</span>
                  </div>
                </TableHead>
                <TableHead className="text-center text-xs sm:text-sm whitespace-nowrap">
                  <div className="flex items-center justify-center gap-1">
                    <Tag className="h-4 w-4" />
                    <span>ID-Marca</span>
                  </div>
                </TableHead>
                <TableHead className="text-center text-xs sm:text-sm whitespace-nowrap">
                  <div className="flex items-center justify-center gap-1">
                    <Package className="h-4 w-4" />
                    <span>Género - Etapa Productiva</span>
                  </div>
                </TableHead>
                {weighingStageId !== 1 && (
                  <TableHead className="text-center text-xs sm:text-sm whitespace-nowrap">
                    <div className="flex items-center justify-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>Sección</span>
                    </div>
                  </TableHead>
                )}
                <TableHead className="text-center text-xs sm:text-sm whitespace-nowrap">
                  <div className="flex items-center justify-center gap-1">
                    <Weight className="h-4 w-4" />
                    <span>Peso</span>
                  </div>
                </TableHead>
                <TableHead className="text-center text-xs sm:text-sm whitespace-nowrap">
                  <div className="flex items-center justify-center gap-1">
                    <Settings className="h-4 w-4" />
                    <span>Acción</span>
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={weighingStageId !== 1 ? 6 : 5} className="text-center py-8">
                    {isLoadingWeighingData ? "Cargando animales..." : "No hay registros disponibles"}
                  </TableCell>
                </TableRow>
              ) : (
                (() => {
                  // Agrupar filas por código de animal para hacer rowspan
                  const groupedRows: { [key: string]: typeof paginatedRows } = {};
                  paginatedRows.forEach((row) => {
                    if (!groupedRows[row.code]) {
                      groupedRows[row.code] = [];
                    }
                    groupedRows[row.code].push(row);
                  });

                  return Object.entries(groupedRows).map(([animalCode, animalRows]) => {
                    const rowSpan = animalRows.length;
                    return animalRows.map((row, index) => {
                      const isFirstRow = index === 0;
                      const isLastRow = index === animalRows.length - 1;
                      return (
                      <TableRow
                        key={row.id}
                        className={`
                          ${row.isComplete ? "[&]:!bg-[#86c6c5] hover:!bg-[#86c6c5]" : "bg-green-50 hover:!bg-green-50"}
                          ${isFirstRow ? "border-t-4 border-t-teal-600 shadow-[0_-2px_4px_rgba(0,0,0,0.1)]" : ""}
                          ${isLastRow ? "border-b-4 border-b-teal-600 shadow-[0_2px_4px_rgba(0,0,0,0.1)]" : ""}
                        `}
                      >
                        {/* Fecha de Ingreso - solo en la primera fila del animal */}
                        {index === 0 && (
                          <TableCell className="text-center" rowSpan={rowSpan}>
                            {new Date(row.fechaIngreso).toLocaleDateString("es-ES", {
                              year: "numeric",
                              month: "2-digit",
                              day: "2-digit",
                            })}
                          </TableCell>
                        )}
                        {/* Código del Animal - solo en la primera fila del animal */}
                        {index === 0 && (
                          <TableCell className="text-center font-medium" rowSpan={rowSpan}>
                            {row.brandName ? `${row.code} - ${row.brandName}` : row.code}
                          </TableCell>
                        )}
                        {/* Producto - solo en la primera fila del animal */}
                        {index === 0 && (
                          <TableCell className="text-center" rowSpan={rowSpan}>
                            {row.producto}
                          </TableCell>
                        )}
                        {/* Sección - siempre visible cuando no es EN PIE */}
                        {weighingStageId !== 1 && (
                          <TableCell className="text-center">
                            {row.sectionCode ? (
                              <div className="flex flex-col items-center">
                                <span className="font-bold text-blue-600">{row.sectionCode}</span>
                                <span className="text-xs text-muted-foreground">{row.sectionDescription}</span>
                                {row.hasPartialConfiscation && (
                                  <div className="flex items-center gap-1 mt-1 text-yellow-600">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                    <span className="text-xs font-semibold">Decomiso parcial</span>
                                  </div>
                                )}
                              </div>
                            ) : (
                              "-"
                            )}
                          </TableCell>
                        )}
                    <TableCell className="text-center">
                      <span className={`font-semibold ${row.displayWeight < 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {row.displayWeight !== 0 ? `${row.displayWeight.toFixed(2)} lb` : "-"}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex gap-2 justify-center">
                        <Button
                          size="sm"
                          variant={
                            selectedRowId === row.id ? "default" : "outline"
                          }
                          className={`text-xs sm:text-sm whitespace-nowrap ${
                            selectedRowId === row.id
                              ? "bg-green-600"
                              : "text-green-600 border-green-600"
                          }`}
                          onClick={() => {
                            if (selectedRowId === row.id) {
                              setSelectedRowId(null);
                              setCapturedWeight(null);
                            } else {
                              setSelectedRowId(row.id);
                              setCapturedWeight(null);
                              resetWeight(); // Resetear la balanza cuando se selecciona un animal
                            }
                          }}
                          disabled={!isConnected}
                        >
                          {selectedRowId === row.id
                            ? "CAPTURADO"
                            : "CAPTURAR"}
                        </Button>
                        {selectedRowId === row.id && (
                          <Button
                            size="sm"
                            className="bg-blue-600 text-xs sm:text-sm whitespace-nowrap"
                            onClick={() => handleSaveWeight(row)}
                            disabled={saveWeighingMutation.isPending || updateWeighingMutation.isPending || !capturedWeight}
                          >
                            {(saveWeighingMutation.isPending || updateWeighingMutation.isPending)
                              ? (row.savedWeight > 0 ? "ACTUALIZANDO..." : "GUARDANDO...")
                              : (row.savedWeight > 0 ? "ACTUALIZAR" : "GUARDAR")}
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                      );
                    });
                  });
                })()
              )}
            </TableBody>
          </Table>
        </div>

        {/* Paginación */}
        {totalAnimals > 0 && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 px-4">
            <div className="flex items-center gap-3">
              <div className="text-sm text-muted-foreground">
                Mostrando {startAnimalIndex + 1} a{" "}
                {Math.min(endAnimalIndex, totalAnimals)} de{" "}
                {totalAnimals} animales ({filteredRows.length} registros)
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Mostrar:</span>
                <Select
                  value={itemsPerPage.toString()}
                  onValueChange={(value) => setItemsPerPage(Number(value))}
                >
                  <SelectTrigger className="w-20 h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {totalPages > 1 && (
              <div className="flex items-center gap-x-2">
              <Button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => prev - 1)}
                variant="outline"
                size="sm"
              >
                Anterior
              </Button>
              {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => {
                const pageNumber = i + 1;
                const isCurrentPage = pageNumber === currentPage;

                // Mostrar primera página, última página, página actual y páginas alrededor
                const showPage =
                  pageNumber === 1 ||
                  pageNumber === totalPages ||
                  Math.abs(pageNumber - currentPage) <= 2;

                if (!showPage) return null;

                return (
                  <Button
                    key={pageNumber}
                    variant="outline"
                    size="sm"
                    className={
                      isCurrentPage
                        ? "bg-teal-600 text-white hover:bg-teal-700 hover:text-white"
                        : ""
                    }
                    onClick={() => setCurrentPage(pageNumber)}
                  >
                    {pageNumber}
                  </Button>
                );
              })}
              {totalPages > 10 && (
                <span className="px-2 text-sm text-muted-foreground">
                  ... {totalPages}
                </span>
              )}
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((prev) => prev + 1)}
              >
                Siguiente
              </Button>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
