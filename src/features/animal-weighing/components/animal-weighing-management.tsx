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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CalendarIcon, Download, Search, Scale, Calendar, Tag, Package, MapPin, Weight, Settings, User, Edit, Trash2 } from "lucide-react";
import { useState, useMemo, useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useLines } from "@/features/postmortem/hooks/use-lines";
import { useSerialScale } from "@/hooks/use-serial-scale";
import { toast } from "sonner";
import {
  useAnimalWeighingByFilters,
  useSaveAnimalWeighing,
  useUpdateAnimalWeighing,
  useDeleteAnimalWeighing,
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
import { Step2AddresseeSelection } from "@/features/order-entry/components/step-2-addressee-selection";
import { AddresseeSummaryCard } from "@/features/order-entry/components/addressee-summary-card";
import { Step3CarrierSelection } from "@/features/order-entry/components/step-3-carrier-selection";
import { CarrierSummaryCard } from "@/features/order-entry/components/carrier-summary-card";
import type { Addressees } from "@/features/addressees/domain";
import type { Carrier } from "@/features/carriers/domain";
import { toCapitalize } from "@/lib/toCapitalize";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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
  const [addresseeSelectionRowId, setAddresseeSelectionRowId] = useState<string | null>(null);
  const [modalStep, setModalStep] = useState<1 | 2>(1); // 1: Seleccionar destinatario, 2: Seleccionar transportista
  const [tempAddressee, setTempAddressee] = useState<Addressees | null>(null);
  const [tempCarrier, setTempCarrier] = useState<Carrier | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    idAnimalWeighing: number | null;
    animalCode: string;
  }>({
    isOpen: false,
    idAnimalWeighing: null,
    animalCode: "",
  });

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
  const deleteWeighingMutation = useDeleteAnimalWeighing();

  const handleDeleteClick = (idAnimalWeighing: number, animalCode: string) => {
    setDeleteConfirmation({
      isOpen: true,
      idAnimalWeighing,
      animalCode,
    });
  };

  const handleConfirmDelete = () => {
    if (deleteConfirmation.idAnimalWeighing) {
      deleteWeighingMutation.mutate(deleteConfirmation.idAnimalWeighing, {
        onSuccess: () => {
          setDeleteConfirmation({ isOpen: false, idAnimalWeighing: null, animalCode: "" });
        },
      });
    }
  };

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
        let idAnimalWeighing: number | undefined = undefined;
        let addresseeData = undefined;
        let carrierData = undefined;
        if (animal.animalWeighing && animal.animalWeighing.length > 0) {
          const weighingForStage = animal.animalWeighing.find(
            (w: any) => w.idWeighingStage === weighingStageId
          );
          if (weighingForStage && weighingForStage.detailAnimalWeighing && weighingForStage.detailAnimalWeighing.length > 0) {
            // Para EN PIE, tomar el primer detalle
            savedWeight = parseFloat(weighingForStage.detailAnimalWeighing[0].netWeight) || 0;
            idAnimalWeighing = weighingForStage.id;
          }
          // Extraer addressee si existe
          if (weighingForStage?.addressee?.personRole?.person) {
            addresseeData = {
              id: weighingForStage.addressee.id,
              fullName: weighingForStage.addressee.personRole.person.fullName,
              identification: weighingForStage.addressee.personRole.person.identification,
            };
          }
          // Extraer carrier (shipping) si existe
          if (weighingForStage?.shipping) {
            carrierData = {
              id: weighingForStage.shipping.id,
              fullName: weighingForStage.shipping.person?.fullName || '',
              identification: weighingForStage.shipping.person?.identification || '',
              plate: weighingForStage.shipping.vehicle?.plate || '',
            };
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
          addressee: addresseeData,
          carrier: carrierData,
          idAnimalWeighing: idAnimalWeighing,
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

        // Extraer addressee y carrier si existen
        let addresseeData = undefined;
        let carrierData = undefined;
        if (animal.animalWeighing && animal.animalWeighing.length > 0) {
          const weighingForStage = animal.animalWeighing.find(
            (w: any) => w.idWeighingStage === weighingStageId
          );
          if (weighingForStage?.addressee?.personRole?.person) {
            addresseeData = {
              id: weighingForStage.addressee.id,
              fullName: weighingForStage.addressee.personRole.person.fullName,
              identification: weighingForStage.addressee.personRole.person.identification,
            };
          }
          // Extraer carrier (shipping) si existe
          if (weighingForStage?.shipping) {
            carrierData = {
              id: weighingForStage.shipping.id,
              fullName: weighingForStage.shipping.person?.fullName || '',
              identification: weighingForStage.shipping.person?.identification || '',
              plate: weighingForStage.shipping.vehicle?.plate || '',
            };
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
              addressee: addresseeData,
              carrier: carrierData,
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
                addressee: addresseeData,
                carrier: carrierData,
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
              addressee: addresseeData,
              carrier: carrierData,
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

  const handleAddresseeSelect = (rowId: string, addressee: Addressees, carrier?: Carrier) => {
    // Encontrar el código del animal de la fila seleccionada
    const selectedRow = rows.find(row => row.id === rowId);
    if (!selectedRow) return;
    
    const animalCode = selectedRow.code;
    
    // Asignar el destinatario y transportista a TODAS las filas del mismo animal
    setRows((prev) =>
      prev.map((row) => 
        row.code === animalCode ? { 
          ...row, 
          addressee: {
            id: addressee.id, // ID del destinatario para enviar al backend
            fullName: addressee.fullName,
            identification: addressee.identification,
          },
          carrier: carrier ? {
            id: carrier.id, // ID del shipping para enviar al backend
            fullName: carrier.person.fullName,
            identification: carrier.person.identification,
            plate: carrier.vehicle.plate,
          } : undefined
        } : row
      )
    );
    setAddresseeSelectionRowId(null);
    toast.success(`Destinatario y transportista asignados al animal ${animalCode}`);
  };

  const handleRemoveAddressee = (rowId: string) => {
    // Encontrar el código del animal de la fila seleccionada
    const selectedRow = rows.find(row => row.id === rowId);
    if (!selectedRow) return;
    
    const animalCode = selectedRow.code;
    
    // Remover el destinatario de TODAS las filas del mismo animal
    setRows((prev) =>
      prev.map((row) => 
        row.code === animalCode ? { ...row, addressee: undefined } : row
      )
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

    // Si NO es EN PIE, validar que haya destinatario y transportista
    if (weighingStageId !== 1) {
      if (!row.addressee?.id) {
        toast.error("Debe agregar un destinatario");
        return;
      }
      if (!row.carrier?.id) {
        toast.error("Debe agregar un transportista");
        return;
      }
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
        const updateData: any = {
          idWeighingStage: weighingStageId,
          idSpecie: selectedSpecieId,
          detailsAnimalWeighing: [detailsAnimalWeighing]
        };
        
        // Agregar idAddressee si existe y NO es EN PIE
        if (weighingStageId !== 1 && row.addressee?.id) {
          updateData.idAddressee = row.addressee.id;
        }
        
        // Agregar idShipping si existe y NO es EN PIE
        if (weighingStageId !== 1 && row.carrier?.id) {
          updateData.idShipping = row.carrier.id;
        }
        
        await updateWeighingMutation.mutateAsync({
          idAnimalWeighing: row.idAnimalWeighing,
          data: updateData
        });
      } else {
        // POST - Crear nuevo peso
        const saveData: any = {
          idWeighingStage: weighingStageId,
          idDetailsSpeciesCertificate: row.animalId,
          idSpecie: selectedSpecieId,
          observation: "",
          detailsAnimalWeighing: [detailsAnimalWeighing]
        };
        
        // Agregar idAddressee si existe y NO es EN PIE
        if (weighingStageId !== 1 && row.addressee?.id) {
          saveData.idAddressee = row.addressee.id;
        }
        
        // Agregar idShipping si existe y NO es EN PIE
        if (weighingStageId !== 1 && row.carrier?.id) {
          saveData.idShipping = row.carrier.id;
        }
        
        await saveWeighingMutation.mutateAsync(saveData);
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

      const unitCode = unitMeasureData?.data?.code || 'LB';
      const isLbUnit = unitCode === 'LB';
      const unitSymbol = 'lb'; // Siempre mostrar en lb
      
      // La balanza envía en kg, convertir a lb para mostrar si la unidad configurada es LB
      const weightFromScale = currentWeight.value;
      let weightToDisplay = isLbUnit ? convertKgToLb(weightFromScale) : weightFromScale;

      // Si NO es EN PIE y hay gancho seleccionado, restar el peso del gancho
      if (weighingStageId !== 1 && selectedHook) {
        const selectedHookData = hookTypesData?.data.find(h => h.id === selectedHook);
        if (selectedHookData) {
          const hookWeightKg = parseFloat(selectedHookData.weight);
          const hookWeightLb = isLbUnit ? convertKgToLb(hookWeightKg) : hookWeightKg;
          weightToDisplay = weightToDisplay - hookWeightLb;
        }
      }

      // Evitar capturas duplicadas del mismo peso
      const roundedWeight = Math.round(weightToDisplay * 100) / 100;
      if (lastCapturedWeightRef.current === roundedWeight) {
        return;
      }

      lastCapturedWeightRef.current = roundedWeight;
      setCapturedWeight(roundedWeight);

      // Actualizar el peso en la fila
      setRows((prev) =>
        prev.map((row) =>
          row.id === selectedRowId ? { ...row, peso: roundedWeight } : row
        )
      );

      const message = weighingStageId !== 1 && selectedHook
        ? `Peso neto capturado: ${roundedWeight.toFixed(2)} ${unitSymbol} (con gancho restado)`
        : `Peso capturado: ${roundedWeight.toFixed(2)} ${unitSymbol}`;
      
      toast.success(message);
    }
  }, [currentWeight?.value, currentWeight?.unit, currentWeight?.stable, selectedRowId, unitMeasureData, weighingStageId, selectedHook, hookTypesData]);

  // Calcular pesos a mostrar (convertidos a lb)
  const rowsWithDisplayWeight = useMemo(() => {
    const unitCode = unitMeasureData?.data?.code || 'LB';
    const isLbUnit = unitCode === 'LB';
    
    return rows.map(row => {
      // Si hay peso capturado (row.peso > 0), mostrarlo
      // Si no, mostrar el peso guardado convertido
      let displayWeight = 0;
      
      if (row.peso > 0) {
        // Peso capturado ya está en lb y con gancho restado si aplica
        displayWeight = row.peso;
      } else if (row.savedWeight > 0) {
        // El peso guardado está en kg, convertir a lb para mostrar
        displayWeight = calculateDisplayWeight(
          row.savedWeight,
          isLbUnit,
          weighingStageId
        );
      }
      
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
              {totalAnimals} animal{totalAnimals !== 1 ? "es" : ""} ({totalRecords} registro{totalRecords !== 1 ? "s" : ""})
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
            {/* <Button
              variant="outline"
              size="sm"
              className="text-blue-600 border-blue-600"
            >
              <Download className="h-4 w-4 mr-1" />
              Reporte
            </Button> */}
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
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                          <Package className="h-3 w-3" />
                          <span>Género - Etapa Productiva</span>
                        </div>
                        <div className="text-sm">{animalRows[0].producto}</div>
                      </div>
                      {animalRows[0].idAnimalWeighing && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                          onClick={() => handleDeleteClick(animalRows[0].idAnimalWeighing!, animalCode)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
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

                        {/* Destinatario en móvil */}
                        {weighingStageId !== 1 && (
                          <div className="mb-2 pb-2 border-b">
                            <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                              <User className="h-3 w-3" />
                              <span>Destinatario</span>
                            </div>
                            {row.addressee ? (
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="text-sm font-medium">{toCapitalize(row.addressee.fullName, true)}</div>
                                  <div className="text-xs text-muted-foreground">{row.addressee.identification}</div>
                                </div>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-teal-600 hover:text-teal-700 h-7 px-2"
                                  onClick={() => setAddresseeSelectionRowId(row.id)}
                                >
                                  <Edit className="h-3 w-3 mr-1" />
                                  Cambiar
                                </Button>
                              </div>
                            ) : (
                              <Button
                                size="sm"
                                className="bg-teal-600 hover:bg-teal-700 w-full"
                                onClick={() => setAddresseeSelectionRowId(row.id)}
                              >
                                Agregar Destinatario
                              </Button>
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
                              className={`text-[10px] whitespace-nowrap h-6 px-1.5 ${
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
                                className="bg-blue-600 text-[10px] whitespace-nowrap h-6 px-1.5"
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
        <div className="hidden lg:block overflow-x-auto">
          {(() => {
            // Verificar si hay algún animal con idAnimalWeighing
            const hasDeleteButton = paginatedRows.some(row => row.idAnimalWeighing);
            
            return (
          <Table className="min-w-full border [&_td]:!rounded-none [&_th]:!rounded-none [&_tr]:!rounded-none">
            <TableHeader>
              <TableRow>
                <TableHead className="text-center text-xs py-0.5 px-1">
                  <div className="flex flex-col items-center gap-0.5">
                    <Calendar className="h-3 w-3" />
                    <span className="leading-tight">Fecha de</span>
                    <span className="leading-tight">Ingreso</span>
                  </div>
                </TableHead>
                <TableHead className="text-center text-xs whitespace-nowrap py-0.5 px-1">
                  <div className="flex items-center justify-center gap-1">
                    <Tag className="h-3 w-3" />
                    <span>ID-Marca</span>
                  </div>
                </TableHead>
                <TableHead className="text-center text-xs py-0.5 px-1">
                  <div className="flex flex-col items-center gap-0.5">
                    <Package className="h-3 w-3" />
                    <span className="leading-tight">Género - Etapa</span>
                    <span className="leading-tight">Productiva</span>
                  </div>
                </TableHead>
                {weighingStageId !== 1 && (
                  <TableHead className="text-center text-xs whitespace-nowrap py-0.5 px-1">
                    <div className="flex items-center justify-center gap-1">
                      <User className="h-3 w-3" />
                      <span>Destinatario</span>
                    </div>
                  </TableHead>
                )}
                {weighingStageId !== 1 && (
                  <TableHead className="text-center text-xs whitespace-nowrap py-0.5 px-1">
                    <div className="flex items-center justify-center gap-1">
                      <MapPin className="h-3 w-3" />
                      <span>Sección</span>
                    </div>
                  </TableHead>
                )}
                <TableHead className="text-center text-xs whitespace-nowrap py-0.5 px-1">
                  <div className="flex items-center justify-center gap-1">
                    <Weight className="h-3 w-3" />
                    <span>Peso</span>
                  </div>
                </TableHead>
                <TableHead className="text-center text-xs whitespace-nowrap py-0.5 px-1" colSpan={hasDeleteButton ? 2 : 1}>
                  <div className="flex items-center justify-center gap-1">
                    <Settings className="h-3 w-3" />
                    <span>Acción</span>
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={weighingStageId !== 1 ? 6 : 4} className="text-center py-8">
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
                          rounded-none
                          ${row.isComplete ? "[&]:!bg-[#86c6c5] hover:!bg-[#86c6c5]" : "bg-green-50 hover:!bg-green-50"}
                          ${isFirstRow ? "border-t-4 border-t-teal-600 shadow-[0_-2px_4px_rgba(0,0,0,0.1)]" : ""}
                          ${isLastRow ? "border-b-4 border-b-teal-600 shadow-[0_2px_4px_rgba(0,0,0,0.1)]" : ""}
                        `}
                      >
                        {/* Fecha de Ingreso - solo en la primera fila del animal */}
                        {index === 0 && (
                          <TableCell className="text-center text-xs py-0.5 px-1" rowSpan={rowSpan}>
                            {new Date(row.fechaIngreso).toLocaleDateString("es-ES", {
                              year: "numeric",
                              month: "2-digit",
                              day: "2-digit",
                            })}
                          </TableCell>
                        )}
                        {/* Código del Animal - solo en la primera fila del animal */}
                        {index === 0 && (
                          <TableCell className="text-center font-medium text-xs py-0.5 px-1" rowSpan={rowSpan}>
                            {row.brandName ? `${row.code} - ${row.brandName}` : row.code}
                          </TableCell>
                        )}
                        {/* Producto - solo en la primera fila del animal */}
                        {index === 0 && (
                          <TableCell className="text-center text-xs py-0.5 px-1" rowSpan={rowSpan}>
                            {row.producto}
                          </TableCell>
                        )}
                        {/* Destinatario - solo en la primera fila del animal cuando no es EN PIE */}
                        {weighingStageId !== 1 && index === 0 && (
                          <TableCell className="text-center py-0.5 px-1" rowSpan={rowSpan}>
                            {row.addressee ? (
                              <div className="flex flex-col items-center gap-0.5">
                                <div className="flex items-center gap-1">
                                  <User className="h-3 w-3 text-teal-600" />
                                  <span className="text-xs font-medium leading-tight">{toCapitalize(row.addressee.fullName, true)}</span>
                                </div>
                                <span className="text-[10px] text-muted-foreground leading-tight">{row.addressee.identification}</span>
                                <div className="w-full border-t border-gray-200 my-0.5"></div>
                                {row.carrier ? (
                                  <>
                                    <div className="flex items-center gap-1">
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/>
                                        <path d="M15 18H9"/>
                                        <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/>
                                        <circle cx="17" cy="18" r="2"/>
                                        <circle cx="7" cy="18" r="2"/>
                                      </svg>
                                      <span className="text-xs font-medium leading-tight text-blue-600">{toCapitalize(row.carrier.fullName, true)}</span>
                                    </div>
                                    <span className="text-[10px] text-muted-foreground leading-tight">{row.carrier.plate}</span>
                                  </>
                                ) : (
                                  <div className="flex items-center gap-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                      <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/>
                                      <path d="M15 18H9"/>
                                      <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/>
                                      <circle cx="17" cy="18" r="2"/>
                                      <circle cx="7" cy="18" r="2"/>
                                    </svg>
                                    <span className="text-xs text-gray-400 leading-tight">Sin transportista</span>
                                  </div>
                                )}
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-teal-600 hover:text-teal-700 h-5 px-1.5 text-[10px]"
                                  onClick={() => setAddresseeSelectionRowId(row.id)}
                                >
                                  <Edit className="h-2.5 w-2.5 mr-0.5" />
                                  Cambiar
                                </Button>
                              </div>
                            ) : (
                              <div className="flex justify-center">
                                <Button
                                  size="sm"
                                  className="bg-teal-600 hover:bg-teal-700 h-6 text-xs px-2"
                                  onClick={() => setAddresseeSelectionRowId(row.id)}
                                >
                                  Agregar
                                </Button>
                              </div>
                            )}
                          </TableCell>
                        )}
                        {/* Sección - siempre visible cuando no es EN PIE */}
                        {weighingStageId !== 1 && (
                          <TableCell className="text-center py-0.5 px-1">
                            {row.sectionCode ? (
                              <div className="flex flex-col items-center gap-0">
                                <span className="font-bold text-blue-600 text-xs leading-tight">{row.sectionCode}</span>
                                <span className="text-[10px] text-muted-foreground leading-tight">{row.sectionDescription}</span>
                                {row.hasPartialConfiscation && (
                                  <div className="flex items-center gap-0.5 mt-0.5 text-yellow-600">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                    <span className="text-[10px] font-semibold leading-tight">Decomiso</span>
                                  </div>
                                )}
                              </div>
                            ) : (
                              "-"
                            )}
                          </TableCell>
                        )}
                    <TableCell className="text-center py-0.5 px-1">
                      <span className={`font-semibold text-xs ${row.displayWeight < 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {row.displayWeight !== 0 ? `${row.displayWeight.toFixed(2)} lb` : "-"}
                      </span>
                    </TableCell>
                    <TableCell className="py-0.5 px-1">
                      <div className="flex gap-0 justify-start items-center">
                        <Button
                          size="sm"
                          variant={
                            selectedRowId === row.id ? "default" : "outline"
                          }
                          className={`text-[9px] whitespace-nowrap h-6 px-1.5 rounded-r-none ${
                            selectedRowId === row.id
                              ? "bg-green-600"
                              : "text-primary border-primary"
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
                          {selectedRowId === row.id
                            ? "CAPTURADO"
                            : "CAPTURAR"}
                        </Button>
                        {selectedRowId === row.id && (
                          <Button
                            size="sm"
                            className="bg-blue-600 text-[9px] whitespace-nowrap h-6 px-1.5 rounded-l-none border-l-0"
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
                    {hasDeleteButton && index === 0 && (
                      <TableCell className="py-0.5 px-0 w-8" rowSpan={rowSpan}>
                        {row.idAnimalWeighing && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 h-6 w-6 p-0 mx-auto"
                            onClick={() => handleDeleteClick(row.idAnimalWeighing!, row.code)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                      );
                    });
                  });
                })()
              )}
            </TableBody>
          </Table>
            );
          })()}
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

      {/* Dialog de Selección de Destinatario y Transportista */}
      <Dialog 
        open={addresseeSelectionRowId !== null} 
        onOpenChange={(open) => {
          if (!open) {
            setAddresseeSelectionRowId(null);
            setModalStep(1);
            setTempAddressee(null);
            setTempCarrier(null);
          }
        }}
      >
        <DialogContent className="!w-[95vw] sm:!w-[90vw] md:!w-[85vw] lg:!w-[82vw] !max-w-[1000px] h-[88vh] max-h-[88vh] overflow-y-auto overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] p-3 sm:p-4">
          <DialogHeader className="pb-2">
            <DialogTitle className="text-base sm:text-lg font-bold truncate">
              {modalStep === 1 ? "Seleccionar Destinatario y Transportista" : "Seleccionar Destinatario y Transportista"}
            </DialogTitle>
          </DialogHeader>
          <div className="w-full min-w-0 space-y-4">
            {/* Paso 1: Seleccionar Destinatario */}
            {modalStep === 1 && !tempAddressee && (
              <Step2AddresseeSelection
                onSelect={(addressee) => {
                  setTempAddressee(addressee);
                }}
                onBack={() => {
                  setAddresseeSelectionRowId(null);
                  setModalStep(1);
                  setTempAddressee(null);
                  setTempCarrier(null);
                }}
              />
            )}

            {/* Card de resumen del destinatario seleccionado */}
            {tempAddressee && (
              <AddresseeSummaryCard
                addressee={tempAddressee}
                onEdit={() => {
                  setTempAddressee(null);
                  setTempCarrier(null);
                  setModalStep(1);
                }}
              />
            )}

            {/* Paso 2: Seleccionar Transportista (solo si ya hay destinatario) */}
            {tempAddressee && !tempCarrier && (
              <Step3CarrierSelection
                onSelect={(carrier) => {
                  setTempCarrier(carrier);
                }}
                onBack={() => {
                  setTempAddressee(null);
                  setModalStep(1);
                }}
              />
            )}

            {/* Card de resumen del transportista seleccionado */}
            {tempCarrier && (
              <CarrierSummaryCard
                carrier={tempCarrier}
                onEdit={() => {
                  setTempCarrier(null);
                }}
              />
            )}

            {/* Botón Finalizar (solo cuando ambos están seleccionados) */}
            {tempAddressee && tempCarrier && (
              <div className="flex justify-end pt-4">
                <Button
                  className="bg-teal-600 hover:bg-teal-700"
                  onClick={() => {
                    if (addresseeSelectionRowId) {
                      handleAddresseeSelect(addresseeSelectionRowId, tempAddressee, tempCarrier);
                    }
                    setAddresseeSelectionRowId(null);
                    setModalStep(1);
                    setTempAddressee(null);
                    setTempCarrier(null);
                  }}
                >
                  Finalizar
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de Confirmación de Eliminación */}
      <AlertDialog
        open={deleteConfirmation.isOpen}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteConfirmation({ isOpen: false, idAnimalWeighing: null, animalCode: "" });
          }
        }}
      >
        <AlertDialogContent className="p-4 sm:p-6">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg sm:text-xl font-bold">
              Confirmar Eliminación
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm sm:text-base text-muted-foreground">
              ¿Estás seguro de que deseas eliminar el registro de pesaje del animal <span className="font-semibold">{deleteConfirmation.animalCode}</span>? Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex justify-end gap-2 pt-4">
            <AlertDialogCancel asChild>
              <Button variant="outline" size="sm">
                Cancelar
              </Button>
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button
                className="bg-red-600 hover:bg-red-700"
                size="sm"
                onClick={handleConfirmDelete}
                disabled={deleteWeighingMutation.isPending}
              >
                {deleteWeighingMutation.isPending ? "Eliminando..." : "Eliminar"}
              </Button>
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
