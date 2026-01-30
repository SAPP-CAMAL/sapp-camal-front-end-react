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
import {
  CalendarIcon,
  Download,
  Search,
  Scale,
  Calendar,
  Tag,
  Package,
  MapPin,
  Weight,
  Settings,
  User,
  Edit,
  Trash2,
  Ticket,
  Layers,
  PawPrint,
  Activity,
  Truck,
  MessageCircle,
} from "lucide-react";
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
  useChannelTypes,
  useChannelSectionsByType,
  useUnitMeasure,
  useHookTypesBySpecie,
} from "../hooks";
import type { ProductType, AnimalWeighingRow, WeighingStage } from "../domain";
import {
  getLocalDateString,
  parseLocalDateString,
} from "@/features/postmortem/utils/postmortem-helpers";
import { DatePicker } from "@/components/ui/date-picker";
import { format, parseISO } from "date-fns";
import { AddresseeSelectionWeighing } from "./addressee-selection-weighing";
import { AddresseeSummaryCardWeighing } from "./addressee-summary-card-weighing";
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
import { http } from "@/lib/ky";
import { Loader2 } from "lucide-react";

// Constantes de conversión
const LB_TO_KG = 0.453592; // 1 lb = 0.453592 kg
const KG_TO_LB = 2.20462; // 1 kg = 2.20462 lb

// Funciones de conversión
const convertLbToKg = (lb: number): number => lb * LB_TO_KG;
const convertKgToLb = (kg: number): number => kg * KG_TO_LB;

// Función para redondear hacia arriba a 2 decimales
const roundUpToTwoDecimals = (value: number): number => {
  return Math.ceil(value * 100) / 100;
};

// Función para calcular el peso a mostrar en la unidad configurada
const calculateDisplayWeight = (
  savedWeightKg: number,
  isLbUnit: boolean,
  weighingStageId: number | null,
  hookWeightKg: number = 0,
): number => {
  if (savedWeightKg === 0) return 0;

  // El peso guardado siempre está en kg
  // Convertir a lb solo si la unidad configurada es LB, de lo contrario mostrar en kg
  const weightInUnit = isLbUnit ? convertKgToLb(savedWeightKg) : savedWeightKg;

  return weightInUnit;
};

export function AnimalWeighingManagement() {
  const [selectedLineId, setSelectedLineId] = useState<string>("");
  const [selectedSpecieId, setSelectedSpecieId] = useState<number | null>(4);
  const [slaughterDate, setSlaughterDate] =
    useState<string>(getLocalDateString());
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
  const [addresseeSelectionRowId, setAddresseeSelectionRowId] = useState<
    string | null
  >(null);
  const [modalStep, setModalStep] = useState<1 | 2>(1); // 1: Seleccionar destinatario, 2: Seleccionar transportista
  const [tempAddressee, setTempAddressee] = useState<Addressees | null>(null);
  const [tempCarrier, setTempCarrier] = useState<Carrier | null>(null);
  const [skipAutoSelect, setSkipAutoSelect] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    idAnimalWeighing: number | null;
    animalCode: string;
  }>({
    isOpen: false,
    idAnimalWeighing: null,
    animalCode: "",
  });
  const [downloadingPdfId, setDownloadingPdfId] = useState<number | null>(null);
  const [isDefaultAddressSelected, setIsDefaultAddressSelected] =
    useState(false);

  const queryClient = useQueryClient();

  // Verificar si la fecha seleccionada es hoy
  const isToday = useMemo(() => {
    const today = getLocalDateString();
    return slaughterDate === today;
  }, [slaughterDate]);

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
  const { data: channelTypesData, isLoading: isLoadingChannelTypes } =
    useChannelTypes();

  const { data: channelSectionsData, isLoading: isLoadingChannelSections } =
    useChannelSectionsByType(selectedChannelTypeId);

  const { data: mediaCanalSections } = useChannelSectionsByType(1); // Media Canal
  const { data: canalSections } = useChannelSectionsByType(2); // Canal
  const { data: cuartaSections } = useChannelSectionsByType(3); // Cuarta

  const { data: unitMeasureData } = useUnitMeasure();

  // Hook para obtener tipos de gancho por especie
  const { data: hookTypesData, isLoading: isLoadingHookTypes } =
    useHookTypesBySpecie(selectedSpecieId);

  // Seleccionar Bovinos por defecto
  useEffect(() => {
    if (lines && lines.length > 0 && !selectedLineId) {
      const bovinosLine = lines.find((line) =>
        line.description.toLowerCase().includes("bovino"),
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
    if (
      hookTypesData?.data &&
      hookTypesData.data.length > 0 &&
      weighingStageId !== 1
    ) {
      const firstHook = hookTypesData.data[0];
      setSelectedHook(firstHook.id);
    }
  }, [hookTypesData, weighingStageId]);

  // Seleccionar automáticamente el primer tipo de canal cuando se carguen
  useEffect(() => {
    if (
      channelTypesData?.data &&
      channelTypesData.data.length > 0 &&
      weighingStageId !== 1
    ) {
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

  const { data: weighingData, isLoading: isLoadingWeighingData } =
    useAnimalWeighingByFilters(weighingRequest);
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
          setDeleteConfirmation({
            isOpen: false,
            idAnimalWeighing: null,
            animalCode: "",
          });
        },
      });
    }
  };

  const handleDownloadPdf = async (idDetailAnimalWeighing: number) => {
    try {
      setDownloadingPdfId(idDetailAnimalWeighing);

      const response = await http.get(
        `v1/1.0.0/detail-specie-cert/pdf-report-animal-tag-data-by-id?idDetailsAnimalWeighing=${idDetailAnimalWeighing}`,
        {
          headers: {
            Accept: "application/pdf",
          },
        },
      );

      // Convertir la respuesta a blob
      const blob = await response.blob();

      // Crear un URL temporal para el blob
      const url = window.URL.createObjectURL(blob);

      // Crear un elemento <a> temporal para descargar el archivo
      const link = document.createElement("a");
      link.href = url;
      link.download = `ticket-${idDetailAnimalWeighing}.pdf`;
      document.body.appendChild(link);
      link.click();

      // Limpiar
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("PDF descargado exitosamente");
    } catch (error) {
      toast.error("Error al descargar el PDF");
    } finally {
      setDownloadingPdfId(null);
    }
  };

  // Función para abrir PDF en nueva pestaña
  const handleOpenPdf = async (
    idDetailAnimalWeighing: number,
    existingWindow?: Window | null,
  ) => {
    let newWindow = existingWindow;
    try {
      // Si no hay ventana, crear una nueva (para llamadas manuales desde el icono)
      if (!newWindow) {
        newWindow = window.open("", "_blank");
      }

      if (!newWindow) {
        toast.error(
          "No se pudo abrir el PDF. Por favor, permite ventanas emergentes.",
        );
        return;
      }

      // Mostrar mensaje de carga en la ventana si es nueva
      if (!existingWindow) {
        newWindow.document.write(`
          <html>
            <head>
              <title>Generando ticket...</title>
              <style>
                @keyframes spin {
                  from { transform: rotate(0deg); }
                  to { transform: rotate(360deg); }
                }
                body {
                  margin: 0;
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  height: 100vh;
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                  background: linear-gradient(135deg, #0ea38d 0%, #0b7f68 100%);
                  color: white;
                }
                .container {
                  text-align: center;
                  padding: 40px;
                  background: rgba(255, 255, 255, 0.1);
                  border-radius: 20px;
                  backdrop-filter: blur(10px);
                  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
                }
                .spinner {
                  width: 80px;
                  height: 80px;
                  margin: 0 auto 30px;
                  animation: spin 2s linear infinite;
                }
                .spinner svg {
                  width: 100%;
                  height: 100%;
                  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
                }
                h2 {
                  margin: 0 0 15px 0;
                  font-size: 24px;
                  font-weight: 600;
                }
                p {
                  margin: 0;
                  font-size: 16px;
                  opacity: 0.9;
                }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="spinner">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="3"></circle>
                    <path d="M12 1v6m0 6v6m5.7-15.7l-4.2 4.2m0 5l-4.2 4.2m15.7-5.7h-6m-6 0H1m15.7 5.7l-4.2-4.2m0-5l-4.2-4.2"></path>
                  </svg>
                </div>
                <h2>Generando ticket...</h2>
                <p>Por favor espere un momento.</p>
              </div>
            </body>
          </html>
        `);
      }

      // Obtener el PDF
      const response = await http.get(
        `v1/1.0.0/detail-specie-cert/pdf-report-animal-tag-data-by-id?idDetailsAnimalWeighing=${idDetailAnimalWeighing}`,
        {
          headers: {
            Accept: "application/pdf",
          },
        },
      );

      // Convertir la respuesta a blob
      const blob = await response.blob();

      // Verificar que sea un PDF válido
      if (blob.size === 0 || !blob.type.includes("pdf")) {
        throw new Error("Respuesta inválida del servidor");
      }

      // Crear un URL temporal para el blob
      const url = window.URL.createObjectURL(blob);

      // Cargar el PDF en la ventana que ya abrimos
      newWindow.location.href = url;

      // Limpiar la URL después de un tiempo para liberar memoria
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 60000); // 60 segundos
    } catch (error) {
      toast.error("Error al abrir el PDF");
      console.error("Error opening PDF:", error);
      // Cerrar la ventana si hay error
      if (newWindow && !newWindow.closed) {
        newWindow.close();
      }
    }
  };

  // Función helper para verificar si hay decomiso parcial
  // Los datos de productPostmortem ya vienen en weighingData dentro de cada animal
  const checkPartialConfiscation = (
    animal: any,
    sectionCode: string,
  ): boolean => {
    if (!animal?.productPostmortem || animal.productPostmortem.length === 0) {
      return false;
    }

    // Buscar si hay algún producto con decomiso parcial en esta sección
    const hasPartial = animal.productPostmortem.some((product: any) => {
      const productSectionCode = product.sectionCode;

      // Si el producto tiene sectionCode y coincide con el de la tabla
      // Y NO es decomiso total, entonces hay decomiso parcial
      return (
        productSectionCode &&
        productSectionCode === sectionCode &&
        product.isTotalConfiscation === false
      );
    });

    return hasPartial;
  };

  // Generar filas basadas en datos de pesaje y secciones de canal
  useEffect(() => {
    if (!weighingData?.data) {
      setRows([]);
      return;
    }

    // Si NO es EN PIE y aún no se han cargado las secciones, esperar
    if (
      weighingStageId !== 1 &&
      selectedChannelTypeId &&
      !channelSectionsData?.data
    ) {
      return; // No limpiar las filas, solo esperar a que se carguen las secciones
    }

    const newRows: AnimalWeighingRow[] = [];

    // Combinar animales de ingreso normal y emergencia
    const allAnimals = [
      ...weighingData.data.ingressNormal,
      ...weighingData.data.ingressEmergency,
    ];

    // Crear un mapa de todas las secciones conocidas (de todos los tipos de canal)
    const allKnownSections = new Map<
      number,
      { code: string; description: string }
    >();

    // Agregar secciones de Media Canal
    if (mediaCanalSections?.data) {
      mediaCanalSections.data.forEach((section) => {
        allKnownSections.set(section.id, {
          code: section.sectionCode,
          description: section.description,
        });
      });
    }

    // Agregar secciones de Canal
    if (canalSections?.data) {
      canalSections.data.forEach((section) => {
        allKnownSections.set(section.id, {
          code: section.sectionCode,
          description: section.description,
        });
      });
    }

    // Agregar secciones de Cuarta
    if (cuartaSections?.data) {
      cuartaSections.data.forEach((section) => {
        allKnownSections.set(section.id, {
          code: section.sectionCode,
          description: section.description,
        });
      });
    }

    // Agregar las del tipo actual si aún no están
    if (channelSectionsData?.data) {
      channelSectionsData.data.forEach((section) => {
        if (!allKnownSections.has(section.id)) {
          allKnownSections.set(section.id, {
            code: section.sectionCode,
            description: section.description,
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
              if (
                detail.idConfigSectionChannel &&
                detail.configSectionChannel
              ) {
                if (!allKnownSections.has(detail.idConfigSectionChannel)) {
                  allKnownSections.set(detail.idConfigSectionChannel, {
                    code: detail.configSectionChannel.sectionCode,
                    description: detail.configSectionChannel.description,
                  });
                }
              }
            });
          }
        });
      }
    });

    // Si es EN PIE (weighingStageId === 1) o no hay secciones, mostrar 1 fila por animal
    if (
      weighingStageId === 1 ||
      !channelSectionsData?.data ||
      channelSectionsData.data.length === 0
    ) {
      allAnimals.forEach((animal) => {
        // Buscar si tiene peso guardado para esta etapa
        let savedWeight = 0;
        let idAnimalWeighing: number | undefined = undefined;
        let idDetailAnimalWeighing: number | undefined = undefined;
        let addresseeData = undefined;
        let carrierData = undefined;
        let commentary: string | undefined = undefined;
        if (animal.animalWeighing && animal.animalWeighing.length > 0) {
          const weighingForStage = animal.animalWeighing.find(
            (w: any) => w.idWeighingStage === weighingStageId,
          );
          if (
            weighingForStage &&
            weighingForStage.detailAnimalWeighing &&
            weighingForStage.detailAnimalWeighing.length > 0
          ) {
            // Para EN PIE, tomar el primer detalle
            savedWeight =
              parseFloat(weighingForStage.detailAnimalWeighing[0].netWeight) ||
              0;
            idAnimalWeighing = weighingForStage.id;
            idDetailAnimalWeighing =
              weighingForStage.detailAnimalWeighing[0].id; // Capturar el ID del detalle
            commentary =
              weighingForStage.detailAnimalWeighing[0].commentary || "";
          }
          // Si no hay comentario en la etapa actual, buscar en cualquier otra etapa
          if (!commentary) {
            commentary =
              animal.animalWeighing
                ?.flatMap((w: any) => w.detailAnimalWeighing || [])
                .find((d: any) => d.commentary)?.commentary ||
              animal.detailCertificateBrands?.detailsCertificateBrand
                ?.commentary ||
              "";
          }
          // Extraer addressee si existe
          if (weighingForStage?.addressee?.personRole?.person) {
            addresseeData = {
              id: weighingForStage.addressee.id,
              fullName: weighingForStage.addressee.personRole.person.fullName,
              identification:
                weighingForStage.addressee.personRole.person.identification,
            };
          }
          // Extraer carrier (shipping) si existe
          if (weighingForStage?.shipping) {
            carrierData = {
              id: weighingForStage.shipping.id,
              fullName: weighingForStage.shipping.person?.fullName || "",
              identification:
                weighingForStage.shipping.person?.identification || "",
              plate: weighingForStage.shipping.vehicle?.plate || "",
            };
          }
        }

        const brandData =
          animal.detailCertificateBrands?.detailsCertificateBrand?.brand;
        const brandName = brandData?.name;
        const brandId = brandData?.id;

        newRows.push({
          id: `${animal.id}`,
          animalId: animal.id,
          code: animal.code,
          producto: `${animal.animalSex.name} - ${animal.detailCertificateBrands.productiveStage.name}`,
          brandId: brandId,
          brandName: brandName,
          peso: savedWeight,
          savedWeight: savedWeight,
          fechaIngreso:
            animal.detailCertificateBrands.detailsCertificateBrand.createdAt,
          idDetailsCertificateBrands: animal.idDetailsCertificateBrands,
          idAnimalSex: animal.idAnimalSex,
          addressee: addresseeData,
          carrier: carrierData,
          idAnimalWeighing: idAnimalWeighing,
          idDetailAnimalWeighing: idDetailAnimalWeighing, // Agregar el ID del detalle
          commentary: commentary,
        });
      });
    } else {
      // Si hay secciones de canal, solo mostrar filas con datos guardados
      allAnimals.forEach((animal) => {
        // Obtener TODAS las secciones guardadas para este animal en esta etapa
        const savedSections = new Map<
          number,
          { weight: number; detailId: number; commentary?: string }
        >(); // Map<idConfigSectionChannel, {peso, idDetail, commentary}>
        let idAnimalWeighing: number | undefined = undefined;

        if (animal.animalWeighing && animal.animalWeighing.length > 0) {
          const weighingForStage = animal.animalWeighing.find(
            (w: any) => w.idWeighingStage === weighingStageId,
          );
          if (weighingForStage) {
            idAnimalWeighing = weighingForStage.id; // Guardar el ID del registro de pesaje
            if (weighingForStage.detailAnimalWeighing) {
              weighingForStage.detailAnimalWeighing.forEach((detail: any) => {
                if (detail.idConfigSectionChannel) {
                  savedSections.set(detail.idConfigSectionChannel, {
                    weight: parseFloat(detail.netWeight) || 0,
                    detailId: detail.id, // Guardar el ID del detalle (204)
                    commentary: detail.commentary || "",
                  });
                }
              });
            }
          }
        }

        // Si no hay comentario en la etapa actual, buscar en cualquier otra etapa
        let commentary =
          savedSections.get(channelSectionsData.data[0]?.id || -1)
            ?.commentary || "";
        if (!commentary) {
          commentary =
            animal.animalWeighing
              ?.flatMap((w: any) => w.detailAnimalWeighing || [])
              .find((d: any) => d.commentary)?.commentary ||
            animal.detailCertificateBrands?.detailsCertificateBrand
              ?.commentary ||
            "";
        }

        // Extraer addressee y carrier si existen
        let addresseeData = undefined;
        let carrierData = undefined;
        if (animal.animalWeighing && animal.animalWeighing.length > 0) {
          const weighingForStage = animal.animalWeighing.find(
            (w: any) => w.idWeighingStage === weighingStageId,
          );
          if (weighingForStage?.addressee?.personRole?.person) {
            addresseeData = {
              id: weighingForStage.addressee.id,
              fullName: weighingForStage.addressee.personRole.person.fullName,
              identification:
                weighingForStage.addressee.personRole.person.identification,
            };
          }
          // Extraer carrier (shipping) si existe
          if (weighingForStage?.shipping) {
            carrierData = {
              id: weighingForStage.shipping.id,
              fullName: weighingForStage.shipping.person?.fullName || "",
              identification:
                weighingForStage.shipping.person?.identification || "",
              plate: weighingForStage.shipping.vehicle?.plate || "",
            };
          }
        }

        // Verificar qué secciones guardadas pertenecen al tipo de canal actual
        const savedSectionsInCurrentType = new Set<number>();
        savedSections.forEach((weight, sectionId) => {
          const belongsToCurrentType = channelSectionsData.data.some(
            (s) => s.id === sectionId,
          );
          if (belongsToCurrentType) {
            savedSectionsInCurrentType.add(sectionId);
          }
        });

        // Si tiene secciones guardadas del tipo actual, mostrar TODAS las secciones del tipo actual
        // (las guardadas con peso y las faltantes sin peso)
        if (savedSectionsInCurrentType.size > 0) {
          channelSectionsData.data.forEach((section) => {
            const sectionData = savedSections.get(section.id);
            const savedWeight = sectionData?.weight || 0;
            const detailId = sectionData?.detailId;
            const commentary = sectionData?.commentary || "";
            const hasPartialConfiscation = checkPartialConfiscation(
              animal,
              section.sectionCode,
            );

            const brandData =
              animal.detailCertificateBrands?.detailsCertificateBrand?.brand;

            newRows.push({
              id: `${animal.id}-${section.id}`,
              animalId: animal.id,
              code: animal.code,
              producto: `${animal.animalSex.name} - ${animal.detailCertificateBrands.productiveStage.name}`,
              brandId: brandData?.id,
              brandName: brandData?.name,
              peso: savedWeight,
              savedWeight: savedWeight,
              fechaIngreso:
                animal.detailCertificateBrands.detailsCertificateBrand
                  .createdAt,
              idDetailsCertificateBrands: animal.idDetailsCertificateBrands,
              idAnimalSex: animal.idAnimalSex,
              sectionCode: section.sectionCode,
              sectionDescription: section.description,
              idChannelSection: section.id,
              idAnimalWeighing: savedWeight > 0 ? idAnimalWeighing : undefined,
              idDetailAnimalWeighing: detailId, // ID del detalle específico (204)
              hasPartialConfiscation,
              addressee: addresseeData,
              carrier: carrierData,
              commentary:
                commentary ||
                animal.animalWeighing
                  ?.flatMap((w: any) => w.detailAnimalWeighing || [])
                  .find((d: any) => d.commentary)?.commentary ||
                animal.detailCertificateBrands?.detailsCertificateBrand
                  ?.commentary ||
                "",
            });
          });
        } else if (savedSections.size > 0) {
          // Si tiene secciones guardadas pero NO del tipo actual, mostrar solo las guardadas
          savedSections.forEach((sectionData, sectionId) => {
            const sectionInfo = allKnownSections.get(sectionId);
            if (sectionInfo) {
              const hasPartialConfiscation = checkPartialConfiscation(
                animal,
                sectionInfo.code,
              );

              const brandData =
                animal.detailCertificateBrands?.detailsCertificateBrand?.brand;

              newRows.push({
                id: `${animal.id}-${sectionId}`,
                animalId: animal.id,
                code: animal.code,
                producto: `${animal.animalSex.name} - ${animal.detailCertificateBrands.productiveStage.name}`,
                brandId: brandData?.id,
                brandName: brandData?.name,
                peso: sectionData.weight,
                savedWeight: sectionData.weight,
                fechaIngreso:
                  animal.detailCertificateBrands.detailsCertificateBrand
                    .createdAt,
                idDetailsCertificateBrands: animal.idDetailsCertificateBrands,
                idAnimalSex: animal.idAnimalSex,
                sectionCode: sectionInfo.code,
                sectionDescription: sectionInfo.description,
                idChannelSection: sectionId,
                idAnimalWeighing: idAnimalWeighing,
                idDetailAnimalWeighing: sectionData.detailId, // ID del detalle específico (204)
                hasPartialConfiscation,
                addressee: addresseeData,
                carrier: carrierData,
                commentary:
                  sectionData.commentary ||
                  animal.animalWeighing
                    ?.flatMap((w: any) => w.detailAnimalWeighing || [])
                    .find((d: any) => d.commentary)?.commentary ||
                  animal.detailCertificateBrands?.detailsCertificateBrand
                    ?.commentary ||
                  "",
              });
            }
          });
        } else {
          // Si no hay datos guardados, mostrar todas las secciones del tipo actual
          channelSectionsData.data.forEach((section) => {
            const hasPartialConfiscation = checkPartialConfiscation(
              animal,
              section.sectionCode,
            );
            const brandData =
              animal.detailCertificateBrands?.detailsCertificateBrand?.brand;

            newRows.push({
              id: `${animal.id}-${section.id}`,
              animalId: animal.id,
              code: animal.code,
              producto: `${animal.animalSex.name} - ${animal.detailCertificateBrands.productiveStage.name}`,
              brandId: brandData?.id,
              brandName: brandData?.name,
              peso: 0,
              savedWeight: 0,
              fechaIngreso:
                animal.detailCertificateBrands.detailsCertificateBrand
                  .createdAt,
              idDetailsCertificateBrands: animal.idDetailsCertificateBrands,
              idAnimalSex: animal.idAnimalSex,
              sectionCode: section.sectionCode,
              sectionDescription: section.description,
              idChannelSection: section.id,
              hasPartialConfiscation,
              addressee: addresseeData,
              carrier: carrierData,
              commentary:
                animal.animalWeighing
                  ?.flatMap((w: any) => w.detailAnimalWeighing || [])
                  .find((d: any) => d.commentary)?.commentary ||
                animal.detailCertificateBrands?.detailsCertificateBrand
                  ?.commentary ||
                "",
            });
          });
        }
      });
    }

    // Calcular si cada animal está completo
    const animalCompletionMap = new Map<string, boolean>();

    // Para EN PIE o sin secciones: completo si tiene peso
    if (
      weighingStageId === 1 ||
      !channelSectionsData?.data ||
      channelSectionsData.data.length === 0
    ) {
      allAnimals.forEach((animal) => {
        let hasWeight = false;
        if (animal.animalWeighing && animal.animalWeighing.length > 0) {
          const weighingForStage = animal.animalWeighing.find(
            (w: any) => w.idWeighingStage === weighingStageId,
          );
          if (
            weighingForStage &&
            weighingForStage.detailAnimalWeighing &&
            weighingForStage.detailAnimalWeighing.length > 0
          ) {
            hasWeight = weighingForStage.detailAnimalWeighing.some(
              (d: any) => parseFloat(d.netWeight) > 0,
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
            (w: any) => w.idWeighingStage === weighingStageId,
          );
          if (weighingForStage && weighingForStage.detailAnimalWeighing) {
            weighingForStage.detailAnimalWeighing.forEach((detail: any) => {
              if (
                detail.idConfigSectionChannel &&
                parseFloat(detail.netWeight) > 0
              ) {
                savedSectionIds.add(detail.idConfigSectionChannel);
              }
            });
          }
        }

        // Verificar si está completo en CUALQUIER tipo de canal
        let isComplete = false;

        // Verificar Canal Entera
        if (canalSections?.data) {
          const canalIds = canalSections.data.map((s) => s.id);
          if (
            canalIds.length > 0 &&
            canalIds.every((id) => savedSectionIds.has(id))
          ) {
            isComplete = true;
          }
        }

        // Verificar Media Canal
        if (!isComplete && mediaCanalSections?.data) {
          const mediaCanalIds = mediaCanalSections.data.map((s) => s.id);
          if (
            mediaCanalIds.length > 0 &&
            mediaCanalIds.every((id) => savedSectionIds.has(id))
          ) {
            isComplete = true;
          }
        }

        // Verificar Cuarta
        if (!isComplete && cuartaSections?.data) {
          const cuartaIds = cuartaSections.data.map((s) => s.id);
          if (
            cuartaIds.length > 0 &&
            cuartaIds.every((id) => savedSectionIds.has(id))
          ) {
            isComplete = true;
          }
        }

        animalCompletionMap.set(animal.code, isComplete);
      });
    }

    // Marcar cada fila con isComplete
    newRows.forEach((row) => {
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
  }, [
    weighingData,
    weighingStageId,
    channelSectionsData,
    selectedChannelTypeId,
    mediaCanalSections,
    canalSections,
    cuartaSections,
  ]);

  const handleHookSelect = (hookId: number) => {
    setSelectedHook(hookId);
  };

  const handleWeightChange = (rowId: string, weight: number) => {
    setRows((prev) =>
      prev.map((row) => (row.id === rowId ? { ...row, peso: weight } : row)),
    );
  };

  const handleAddresseeSelect = (
    rowId: string,
    addressee: Addressees,
    carrier?: Carrier,
  ) => {
    // Encontrar el código del animal de la fila seleccionada
    const selectedRow = rows.find((row) => row.id === rowId);
    if (!selectedRow) return;

    const animalCode = selectedRow.code;

    // Asignar el destinatario y transportista a TODAS las filas del mismo animal
    // Marcar la fila seleccionada como principal (isPrimaryRow: true)
    setRows((prev) =>
      prev.map((row) =>
        row.code === animalCode
          ? {
              ...row,
              addressee: {
                id: addressee.id, // ID del destinatario para enviar al backend
                fullName: addressee.fullName,
                identification: addressee.identification,
              },
              carrier: carrier
                ? {
                    id: carrier.id, // ID del shipping para enviar al backend
                    fullName: carrier.person.fullName,
                    identification: carrier.person.identification,
                    plate: carrier.vehicle.plate,
                  }
                : undefined,
              isPrimaryRow: row.id === rowId, // Marcar solo la fila seleccionada como principal
            }
          : row,
      ),
    );
    setAddresseeSelectionRowId(null);
    toast.success(
      `Destinatario y transportista asignados al animal ${animalCode}`,
    );
  };

  const handleRemoveAddressee = (rowId: string) => {
    // Encontrar el código del animal de la fila seleccionada
    const selectedRow = rows.find((row) => row.id === rowId);
    if (!selectedRow) return;

    const animalCode = selectedRow.code;

    // Remover el destinatario de TODAS las filas del mismo animal y limpiar isPrimaryRow
    setRows((prev) =>
      prev.map((row) =>
        row.code === animalCode
          ? {
              ...row,
              addressee: undefined,
              carrier: undefined,
              isPrimaryRow: false,
            }
          : row,
      ),
    );
  };

  const handleSaveWeight = async (row: AnimalWeighingRow) => {
    // Pre-abrir la ventana para evitar el bloqueo del navegador
    const ticketWindow = window.open("", "_blank");
    if (ticketWindow) {
      ticketWindow.document.write(`
        <html>
          <head>
            <title>Procesando...</title>
            <style>
              @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
              }
              body {
                margin: 0;
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                background: linear-gradient(135deg, #0ea38d 0%, #0b7f68 100%);
                color: white;
              }
              .container {
                text-align: center;
                padding: 40px;
                background: rgba(255, 255, 255, 0.1);
                border-radius: 20px;
                backdrop-filter: blur(10px);
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
              }
              .spinner {
                width: 80px;
                height: 80px;
                margin: 0 auto 30px;
                animation: spin 2s linear infinite;
              }
              .spinner svg {
                width: 100%;
                height: 100%;
                filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
              }
              h2 {
                margin: 0 0 15px 0;
                font-size: 24px;
                font-weight: 600;
              }
              p {
                margin: 0;
                font-size: 16px;
                opacity: 0.9;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="spinner">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="3"></circle>
                  <path d="M12 1v6m0 6v6m5.7-15.7l-4.2 4.2m0 5l-4.2 4.2m15.7-5.7h-6m-6 0H1m15.7 5.7l-4.2-4.2m0-5l-4.2-4.2"></path>
                </svg>
              </div>
              <h2>Procesando pesaje...</h2>
              <p>Generando ticket, por favor espere.</p>
            </div>
          </body>
        </html>
      `);
    }

    if (row.peso <= 0) {
      toast.error("El peso debe ser mayor a 0");
      if (ticketWindow) ticketWindow.close();
      return;
    }

    // Validar que haya especie e ID de etapa de pesaje
    if (!selectedSpecieId || !weighingStageId) {
      toast.error("Faltan datos requeridos");
      if (ticketWindow) ticketWindow.close();
      return;
    }

    // Si NO es EN PIE, validar que haya un gancho seleccionado
    if (weighingStageId !== 1 && !selectedHook) {
      toast.error("Debe seleccionar un gancho");
      if (ticketWindow) ticketWindow.close();
      return;
    }

    // Si NO es EN PIE, validar que haya destinatario y transportista
    if (weighingStageId !== 1) {
      if (!row.addressee?.id) {
        toast.error("Debe agregar un destinatario");
        if (ticketWindow) ticketWindow.close();
        return;
      }
      if (!row.carrier?.id) {
        toast.error("Debe agregar un transportista");
        if (ticketWindow) ticketWindow.close();
        return;
      }
    }

    const unitCode = unitMeasureData?.data?.code || "KG";
    const unitSymbol = unitMeasureData?.data?.symbol || "kg";
    const isLbUnit = unitCode === "LB";

    // row.peso ya tiene el gancho restado desde la captura de la balanza
    // Por lo tanto, row.peso es el peso NETO (sin gancho)
    const netWeightDisplay = row.peso;

    // Calcular el peso bruto sumando el gancho al peso neto
    let grossWeightDisplay = netWeightDisplay;
    let hookWeightDisplay = 0;

    if (weighingStageId !== 1 && selectedHook) {
      const selectedHookData = hookTypesData?.data.find(
        (h) => h.id === selectedHook,
      );
      // El peso del gancho ya está en la misma unidad que el sistema
      hookWeightDisplay = selectedHookData
        ? parseFloat(selectedHookData.weight)
        : 0;
      grossWeightDisplay = netWeightDisplay + hookWeightDisplay;
    }

    try {
      // Obtener el ID de la unidad de medida desde la API
      const unitMeasureId = unitMeasureData?.data?.id || 1; // Default a 1 (KG) si no hay datos

      // Guardar los pesos tal cual en la unidad configurada
      // La balanza ya envía el valor correcto en lb o kg según la configuración
      const grossWeightToSave = roundUpToTwoDecimals(grossWeightDisplay);
      const netWeightToSave = roundUpToTwoDecimals(netWeightDisplay);

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
      let response: any;
      if (row.idAnimalWeighing) {
        // PATCH - Actualizar peso existente
        const updateData: any = {
          idWeighingStage: weighingStageId,
          idSpecie: selectedSpecieId,
          detailsAnimalWeighing: [detailsAnimalWeighing],
        };

        // Agregar idAddressee si existe y NO es EN PIE
        if (weighingStageId !== 1 && row.addressee?.id) {
          updateData.idAddressee = row.addressee.id;
        }

        // Agregar idShipping si existe y NO es EN PIE
        if (weighingStageId !== 1 && row.carrier?.id) {
          updateData.idShipping = row.carrier.id;
        }

        response = await updateWeighingMutation.mutateAsync({
          idAnimalWeighing: row.idAnimalWeighing,
          data: updateData,
        });
      } else {
        // POST - Crear nuevo peso
        const saveData: any = {
          idWeighingStage: weighingStageId,
          idDetailsSpeciesCertificate: row.animalId,
          idSpecie: selectedSpecieId,
          observation: "",
          detailsAnimalWeighing: [detailsAnimalWeighing],
        };

        // Agregar idAddressee si existe y NO es EN PIE
        if (weighingStageId !== 1 && row.addressee?.id) {
          saveData.idAddressee = row.addressee.id;
        }

        // Agregar idShipping si existe y NO es EN PIE
        if (weighingStageId !== 1 && row.carrier?.id) {
          saveData.idShipping = row.carrier.id;
        }

        response = await saveWeighingMutation.mutateAsync(saveData);
      }

      const message =
        weighingStageId === 1
          ? `Peso ${row.idAnimalWeighing ? "actualizado" : "guardado"}: ${grossWeightDisplay.toFixed(2)} ${unitSymbol}`
          : `Peso ${row.idAnimalWeighing ? "actualizado" : "guardado"}: Bruto ${grossWeightDisplay.toFixed(2)} ${unitSymbol}, Neto ${netWeightDisplay.toFixed(2)} ${unitSymbol}`;

      toast.success(message);

      // Abrir PDF automáticamente en nueva pestaña
      console.log("📄 Respuesta completa del API:", response);

      // Intentar obtener el ID del detalle desde la respuesta de la API
      let detailId = row.idDetailAnimalWeighing; // fallback
      if (response?.data?.detailAnimalWeighing && Array.isArray(response.data.detailAnimalWeighing)) {
        detailId = response.data.detailAnimalWeighing[0]?.id || detailId;
      }


      console.log("📄 ID del detalle para ticket:", detailId);

      // Invalidar y esperar a que se recarguen los datos antes de abrir el ticket
      await queryClient.invalidateQueries({ queryKey: ["animal-weighing"] });

      // Pequeña espera para asegurar que los datos se actualizaron
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Si aún no tenemos el ID del detalle, intentar buscarlo en los datos actualizados
      if (!detailId) {
        const updatedData = queryClient.getQueryData<any>([
          "animal-weighing",
          weighingRequest,
        ]);
        console.log("📄 Datos actualizados después de invalidar:", updatedData);

        // Buscar el animal recién pesado en los datos actualizados
        if (updatedData?.data) {
          const animals = Array.isArray(updatedData.data)
            ? updatedData.data
            : [updatedData.data];
          const recentAnimal = animals.find((a: any) => a.code === row.code);

          if (recentAnimal?.detailsAnimalWeighing) {
            const details = Array.isArray(recentAnimal.detailsAnimalWeighing)
              ? recentAnimal.detailsAnimalWeighing
              : [recentAnimal.detailsAnimalWeighing];

            // Tomar el último detalle (el más reciente)
            const latestDetail = details[details.length - 1];
            detailId =
              latestDetail?.id || latestDetail?.idDetailAnimalWeighing || null;
            console.log("📄 ID encontrado en datos actualizados:", detailId);
          }
        }
      }

      if (detailId) {
        handleOpenPdf(detailId, ticketWindow);
      } else {
        console.error(
          "❌ No se pudo obtener el ID del detalle para generar el ticket",
        );
        if (ticketWindow) ticketWindow.close();
        toast.warning(
          "Peso guardado, pero no se pudo abrir el ticket automáticamente",
        );
      }

      setSelectedRowId(null);
      setCapturedWeight(null);
      lastCapturedWeightRef.current = null;
    } catch (error) {
      toast.error("Error al guardar el peso");
      if (ticketWindow) ticketWindow.close();
    }
  };

  // Capturar peso estable de la balanza
  useEffect(() => {
    if (currentWeight && selectedRowId) {
      const unitCode = unitMeasureData?.data?.code || "KG";
      const unitSymbol = unitMeasureData?.data?.symbol || "kg";

      // La balanza ya envía el valor en la unidad configurada (lb o kg)
      let weightToDisplay = currentWeight.value;

      // Restar el peso del gancho si aplica (no es EN PIE y hay gancho seleccionado)
      if (weighingStageId !== 1 && selectedHook) {
        const selectedHookData = hookTypesData?.data.find(
          (h) => h.id === selectedHook,
        );
        if (selectedHookData) {
          const hookWeight = parseFloat(selectedHookData.weight);
          // El peso del gancho está en la misma unidad que weightToDisplay
          weightToDisplay = weightToDisplay - hookWeight;
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
          row.id === selectedRowId ? { ...row, peso: roundedWeight } : row,
        ),
      );

      const message =
        weighingStageId !== 1 && selectedHook
          ? `Peso neto capturado: ${roundedWeight.toFixed(2)} ${unitSymbol} (con gancho restado)`
          : `Peso capturado: ${roundedWeight.toFixed(2)} ${unitSymbol}`;

      toast.success(message);
    }
  }, [
    currentWeight?.value,
    currentWeight?.unit,
    currentWeight?.stable,
    selectedRowId,
    unitMeasureData,
    weighingStageId,
    selectedHook,
    hookTypesData,
  ]);

  // Calcular pesos a mostrar (en la unidad configurada)
  const rowsWithDisplayWeight = useMemo(() => {
    const unitCode = unitMeasureData?.data?.code || "KG";
    const isLbUnit = unitCode === "LB";

    return rows.map((row) => {
      // Si hay peso capturado (row.peso > 0), mostrarlo
      // Si no, mostrar el peso guardado convertido
      let displayWeight = 0;

      if (row.peso > 0) {
        // Peso capturado ya está en la unidad configurada y con gancho restado si aplica
        displayWeight = row.peso;
      } else if (row.savedWeight > 0) {
        // El peso guardado está en kg, convertir a lb solo si la unidad configurada es LB
        displayWeight = calculateDisplayWeight(
          row.savedWeight,
          isLbUnit,
          weighingStageId,
        );
      }

      return {
        ...row,
        displayWeight: displayWeight,
      };
    });
  }, [rows, unitMeasureData, weighingStageId]);

  const filteredRows = useMemo(() => {
    if (!searchTerm) return rowsWithDisplayWeight;
    const searchLower = searchTerm.toLowerCase().trim();
    return rowsWithDisplayWeight.filter((row) => {
      // Búsqueda exacta en código de animal
      const codeMatch = row.code?.toLowerCase() === searchLower;
      // Búsqueda exacta en nombre de marca (opcional)
      const brandMatch = row.brandName?.toLowerCase() === searchLower;
      return codeMatch || brandMatch;
    });
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

  // Obtener lista de códigos de animales únicos y ordenarlos por prioridad
  const animalCodes = useMemo(() => {
    const codes = Object.keys(groupedByAnimal);

    // Ordenar animales: primero los que tienen destinatario sin peso, luego los demás
    return codes.sort((codeA, codeB) => {
      const rowsA = groupedByAnimal[codeA];
      const rowsB = groupedByAnimal[codeB];

      // Verificar si el animal tiene destinatario y alguna fila sin peso
      const aHasAddresseeAndNoPeso = rowsA.some(
        (r) => r.addressee && r.savedWeight === 0,
      );
      const bHasAddresseeAndNoPeso = rowsB.some(
        (r) => r.addressee && r.savedWeight === 0,
      );

      // Prioridad 1: Animales con destinatario y sin peso van primero
      if (aHasAddresseeAndNoPeso && !bHasAddresseeAndNoPeso) return -1;
      if (!aHasAddresseeAndNoPeso && bHasAddresseeAndNoPeso) return 1;

      // Prioridad 2: Si ambos tienen o no tienen destinatario, mantener orden original
      return 0;
    });
  }, [groupedByAnimal]);

  // Calcular paginación por animales (no por filas)
  const totalAnimals = animalCodes.length;
  const totalPages = Math.ceil(totalAnimals / itemsPerPage);
  const startAnimalIndex = (currentPage - 1) * itemsPerPage;
  const endAnimalIndex = startAnimalIndex + itemsPerPage;
  const paginatedAnimalCodes = animalCodes.slice(
    startAnimalIndex,
    endAnimalIndex,
  );

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
    <div className="space-y-3 p-3 sm:p-4 md:p-6 pb-16 max-w-full overflow-x-hidden min-h-full">
      <div className="text-center">
        <h1 className="text-lg sm:text-xl md:text-2xl font-semibold mb-2">
          PESAJE DE ANIMALES
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          Fecha de Faenamiento:{" "}
          {parseLocalDateString(slaughterDate).toLocaleDateString("es-ES", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      {/* Balanza Serial - Optimizado para Tablet */}
      <Card className="p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
        <div className="space-y-3 sm:space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Scale className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
              <Label className="text-base sm:text-lg font-semibold">
                EQUIPOS DE PESAJE INDUSTRIAL X1
              </Label>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              {isConnected ? (
                <>
                  <span className="flex h-3 w-3 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-sm sm:text-base text-green-700 font-medium">
                    Conectada
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={disconnectScale}
                    className="text-sm"
                  >
                    Desconectar
                  </Button>
                </>
              ) : (
                <>
                  <span className="flex h-3 w-3 rounded-full bg-gray-400" />
                  <span className="text-sm sm:text-base text-gray-600">
                    Desconectada
                  </span>
                  <Button
                    size="sm"
                    onClick={connectScale}
                    disabled={!isSupported}
                    className="text-sm"
                  >
                    Conectar Balanza
                  </Button>
                </>
              )}
            </div>
          </div>

          {isConnected && (
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 p-4 sm:p-5 bg-white rounded-lg border-2 border-blue-300">
              <div className="flex-1 w-full">
                <p className="text-sm sm:text-base text-gray-600 mb-3">
                  Peso Actual
                </p>
                {currentWeight ? (
                  <div className="space-y-2">
                    {/* Peso principal - mostrar en la unidad configurada */}
                    <div className="flex items-baseline gap-3 flex-wrap">
                      <span
                        className={`text-3xl sm:text-4xl md:text-5xl font-bold ${currentWeight.value < 0 ? "text-red-900" : "text-blue-900"}`}
                      >
                        {currentWeight.value.toFixed(2)}
                      </span>
                      <span
                        className={`text-2xl sm:text-3xl font-semibold ${currentWeight.value < 0 ? "text-red-700" : "text-blue-700"}`}
                      >
                        {unitMeasureData?.data?.symbol || "kg"}
                      </span>
                      {currentWeight.stable && (
                        <span className="ml-2 px-3 py-1 bg-green-100 text-green-700 text-sm font-semibold rounded">
                          ESTABLE
                        </span>
                      )}
                    </div>
                  </div>
                ) : (
                  <span className="text-xl sm:text-2xl md:text-3xl text-gray-400">
                    Esperando lectura...
                  </span>
                )}
              </div>
              {selectedRowId && (
                <div className="text-left lg:text-right w-full lg:w-auto">
                  <p className="text-sm sm:text-base text-gray-600">
                    Animal Seleccionado
                  </p>
                  <p className="text-lg sm:text-xl font-semibold text-blue-900">
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
            <Label className="whitespace-nowrap font-semibold flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
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
              inputClassName="bg-secondary"
              selected={parseISO(slaughterDate)}
              onChange={(date) => {
                if (!date) return;
                const formattedDate = format(date, "yyyy-MM-dd");
                setSlaughterDate(formattedDate);
              }}
            />
          </div>

          {/* Etapa de Pesaje a la derecha */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full lg:w-auto">
            <Label className="whitespace-nowrap font-semibold flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              Etapa de Pesaje:
            </Label>

            {/* Versión móvil - Select */}
            <div className="block lg:hidden w-full">
              {isLoadingWeighingStages ? (
                <span className="text-sm text-muted-foreground">
                  Cargando...
                </span>
              ) : (
                <Select
                  value={weighingStageId?.toString() || ""}
                  onValueChange={(value) => {
                    const stage = weighingStagesData?.data.find(
                      (s) => s.id.toString() === value,
                    );
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
                        <p className="max-w-xs text-black">
                          {stage.description}
                        </p>
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
          <Label className="whitespace-nowrap font-semibold flex items-center gap-2">
            <PawPrint className="h-4 w-4 text-primary" />
            Especie:
          </Label>

          {/* Versión móvil - Select */}
          <div className="block lg:hidden w-full">
            {isLoadingLines ? (
              <span className="text-sm text-muted-foreground">Cargando...</span>
            ) : (
              <Select
                value={selectedLineId || ""}
                onValueChange={(value) => {
                  const line = lines?.find((l) => l.id.toString() === value);
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
                    <SelectItem
                      key={line.id}
                      value={line.id.toString()}
                      className="text-black"
                    >
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
              <span className="text-sm text-muted-foreground">Cargando...</span>
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
                <span className="text-sm text-muted-foreground">
                  Cargando...
                </span>
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
                        {hook.name} ({hook.weight}{" "}
                        {unitMeasureData?.data?.symbol || "kg"})
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
                    <span className="text-xs ml-1">
                      ({hook.weight} {unitMeasureData?.data?.symbol || "kg"})
                    </span>
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
              <Label className="flex-shrink-0 font-semibold flex items-center gap-2">
                <Layers className="h-4 w-4 text-primary" />
                Tipo de Canal:
              </Label>

              {/* Versión móvil - Select */}
              <div className="block lg:hidden w-full">
                {isLoadingChannelTypes ? (
                  <span className="text-sm text-muted-foreground">
                    Cargando...
                  </span>
                ) : (
                  <Select
                    value={selectedChannelTypeId?.toString() || ""}
                    onValueChange={(value) =>
                      setSelectedChannelTypeId(parseInt(value))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione tipo de canal" />
                    </SelectTrigger>
                    <SelectContent>
                      {channelTypesData?.data.map((channel) => (
                        <SelectItem
                          key={channel.id}
                          value={channel.id.toString()}
                        >
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

      {/* Búsqueda y Tabla - Optimizado para Tablet */}
      <Card className="p-3 sm:p-4 md:p-6">
        <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm sm:text-base text-muted-foreground">
              {totalAnimals} animal{totalAnimals !== 1 ? "es" : ""} (
              {totalRecords} registro{totalRecords !== 1 ? "s" : ""})
            </span>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por marca"
                className="pl-10 w-full text-base"
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
        <div className="block lg:hidden space-y-1.5">
          {paginatedRows.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {isLoadingWeighingData
                ? "Cargando animales..."
                : "No hay registros disponibles"}
            </div>
          ) : (
            (() => {
              const groupedRows: { [key: string]: typeof paginatedRows } = {};
              paginatedRows.forEach((row) => {
                const groupKey = `${row.code}_${row.idDetailsCertificateBrands}`;
                if (!groupedRows[groupKey]) {
                  groupedRows[groupKey] = [];
                }
                groupedRows[groupKey].push(row);
              });

              return Object.entries(groupedRows).map(
                ([groupKey, animalRows]) => {
                  const animalCode = animalRows[0].code;
                  // Ordenar filas: priorizar las que tienen destinatario pero no tienen peso aún
                  const sortedRows = [...animalRows].sort((a, b) => {
                    // 1. Priorizar filas con destinatario Y sin peso (listas para pesar)
                    const aReadyToWeigh = !!a.addressee && a.savedWeight === 0;
                    const bReadyToWeigh = !!b.addressee && b.savedWeight === 0;
                    if (aReadyToWeigh && !bReadyToWeigh) return -1;
                    if (!aReadyToWeigh && bReadyToWeigh) return 1;

                    // 2. Dentro de las listas para pesar, priorizar la marcada como principal
                    if (aReadyToWeigh && bReadyToWeigh) {
                      if (a.isPrimaryRow && !b.isPrimaryRow) return -1;
                      if (!a.isPrimaryRow && b.isPrimaryRow) return 1;
                    }

                    // 3. Luego filas sin destinatario y sin peso (en espera)
                    const aWaiting = !a.addressee && a.savedWeight === 0;
                    const bWaiting = !b.addressee && b.savedWeight === 0;
                    if (aWaiting && !bWaiting) return -1;
                    if (!aWaiting && bWaiting) return 1;

                    // 4. Al final filas con peso ya guardado (completadas)
                    // Estas se ordenan por idChannelSection
                    const idA = a.idChannelSection || 0;
                    const idB = b.idChannelSection || 0;
                    return idA - idB;
                  });

                  // Log solo cuando hay destinatario asignado
                  if (sortedRows.some((r) => r.addressee)) {
                    console.log(
                      `👑 Animal ${animalCode}:`,
                      sortedRows.map((r) => ({
                        section: r.sectionCode,
                        prioridad:
                          r.addressee && r.savedWeight === 0
                            ? "1-LISTO PARA PESAR ⭐"
                            : !r.addressee && r.savedWeight === 0
                              ? "2-ESPERANDO"
                              : "3-COMPLETADO",
                        isPrimary: r.isPrimaryRow,
                        peso: r.savedWeight,
                      })),
                    );
                  }
                  return (
                    <Card
                      key={groupKey}
                      className={`p-1 border-2 border-teal-600 shadow-md ${sortedRows[0].isComplete ? "bg-[#86c6c5]" : "bg-green-50"}`}
                    >
                      {/* Información del animal - Compacta */}
                      <div className="mb-0.5 pb-0.5 border-b border-teal-400/30">
                        <div className="flex justify-between items-start gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1 text-[10px] text-muted-foreground/80 mb-0.5">
                                  <Tag className="h-2.5 w-2.5" />
                                  <span className="truncate">ID-Marca</span>
                                </div>
                                <div className="text-sm font-bold truncate">
                                  {sortedRows[0].brandName
                                    ? `${animalCode} - ${sortedRows[0].brandName}`
                                    : animalCode}
                                </div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1 text-[10px] text-muted-foreground/80 mb-0.5">
                                  <Package className="h-2.5 w-2.5" />
                                  <span className="truncate">
                                    Género - Etapa
                                  </span>
                                </div>
                                <div className="text-xs font-medium truncate">
                                  {sortedRows[0].producto}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-1 shrink-0">
                            <div className="text-right">
                              <div className="flex items-center gap-1 text-[10px] text-muted-foreground/80 mb-0.5 justify-end">
                                <Calendar className="h-2.5 w-2.5" />
                                <span>Ingreso</span>
                              </div>
                              <div className="text-xs font-medium">
                                {new Date(
                                  sortedRows[0].fechaIngreso,
                                ).toLocaleDateString("es-ES", {
                                  day: "2-digit",
                                  month: "2-digit",
                                  year: "numeric",
                                })}
                              </div>
                            </div>
                            {sortedRows[0].idAnimalWeighing && isToday && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="text-red-600 hover:text-red-700 hover:bg-red-50 h-7 w-7 p-0"
                                      onClick={() =>
                                        handleDeleteClick(
                                          sortedRows[0].idAnimalWeighing!,
                                          animalCode,
                                        )
                                      }
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Eliminar Registro</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Destinatario y Transportista - Compacto o Botón Agregar */}
                      {weighingStageId !== 1 && (
                        <div className="mb-1">
                          {sortedRows[0].addressee || sortedRows[0].carrier ? (
                            <div className="p-1.5 bg-teal-50/30 rounded border border-teal-200/20">
                              <div className="flex items-center justify-between gap-3 text-xs">
                                {sortedRows[0].addressee && (
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1 text-[9px] text-teal-600 mb-0.5">
                                      <User className="h-2 w-2" />
                                      <span className="font-medium">
                                        Destinatario
                                      </span>
                                    </div>
                                    <div className="text-[10px] font-medium truncate">
                                      {sortedRows[0].addressee.fullName}
                                    </div>
                                    <div className="text-[9px] text-muted-foreground truncate">
                                      ID:{" "}
                                      {sortedRows[0].addressee.identification}
                                    </div>
                                  </div>
                                )}
                                {sortedRows[0].carrier && (
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1 text-[9px] text-teal-600 mb-0.5">
                                      <Truck className="h-2 w-2" />
                                      <span className="font-medium">
                                        Transportista
                                      </span>
                                    </div>
                                    <div className="text-[10px] font-medium truncate">
                                      {sortedRows[0].carrier.fullName}
                                    </div>
                                    <div className="text-[9px] text-muted-foreground truncate">
                                      ID: {sortedRows[0].carrier.identification}{" "}
                                      | Placa: {sortedRows[0].carrier.plate}
                                    </div>
                                  </div>
                                )}
                                {isToday && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="text-teal-700 hover:text-teal-800 hover:bg-teal-50 h-6 px-1.5 shrink-0"
                                    onClick={() =>
                                      setAddresseeSelectionRowId(
                                        sortedRows[0].id,
                                      )
                                    }
                                  >
                                    <Edit className="h-2.5 w-2.5 mr-0.5" />
                                    <span className="text-[10px]">Cambiar</span>
                                  </Button>
                                )}
                              </div>
                            </div>
                          ) : (
                            isToday && (
                              <div className="p-2 bg-teal-50/20 rounded border border-teal-200/30 text-center">
                                <Button
                                  size="sm"
                                  className="bg-teal-600 hover:bg-teal-700 h-8 text-sm w-full"
                                  onClick={() =>
                                    setAddresseeSelectionRowId(sortedRows[0].id)
                                  }
                                >
                                  <User className="h-3 w-3 mr-1" />
                                  Agregar Destinatario
                                </Button>
                              </div>
                            )
                          )}
                        </div>
                      )}

                      {/* Secciones - Compactas */}
                      <div className="space-y-1">
                        {sortedRows.map((row) => (
                          <div
                            key={row.id}
                            className="p-1 bg-white/50 rounded border border-teal-200/50"
                          >
                            {weighingStageId !== 1 && row.sectionCode && (
                              <div className="mb-1">
                                <div className="flex items-center gap-1 mb-0.5">
                                  <MapPin className="h-2.5 w-2.5 text-blue-600" />
                                  <span className="font-bold text-blue-600 text-xs">
                                    {row.sectionCode}
                                  </span>
                                  <span className="text-[10px] text-black ml-0.5 truncate">
                                    {row.sectionDescription}
                                  </span>
                                </div>
                                {row.hasPartialConfiscation && (
                                  <div className="flex items-center gap-1 text-yellow-600">
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      className="h-2.5 w-2.5"
                                      viewBox="0 0 20 20"
                                      fill="currentColor"
                                    >
                                      <path
                                        fillRule="evenodd"
                                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                        clipRule="evenodd"
                                      />
                                    </svg>
                                    <span className="text-[10px] font-semibold">
                                      Decomiso parcial
                                    </span>
                                  </div>
                                )}
                              </div>
                            )}

                            <div className="flex items-center justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1 text-[10px] text-muted-foreground/80 mb-0.5">
                                  <Weight className="h-2.5 w-2.5" />
                                  <span>Peso</span>
                                </div>
                                <div
                                  className={`text-xs font-semibold ${row.displayWeight < 0 ? "text-red-600" : "text-green-600"}`}
                                >
                                  {row.displayWeight !== 0
                                    ? `${row.displayWeight.toFixed(2)} ${unitMeasureData?.data?.symbol || "kg"}`
                                    : "-"}
                                </div>
                                {/* Observaciones debajo del peso en móvil - siempre visibles */}
                                <div
                                  className={`mt-1 text-xs italic font-medium ${row.commentary ? "text-amber-600" : "text-muted-foreground/60"}`}
                                >
                                  {row.commentary
                                    ? row.commentary
                                    : "Sin observaciones"}
                                </div>
                              </div>

                              <div className="flex gap-1 items-center shrink-0">
                                <Button
                                  size="sm"
                                  variant={
                                    selectedRowId === row.id
                                      ? "default"
                                      : "outline"
                                  }
                                  className={`text-[10px] whitespace-nowrap h-6 px-1.5 ${
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
                                      resetWeight();
                                    }
                                  }}
                                  disabled={!isConnected || !isToday}
                                >
                                  {selectedRowId === row.id
                                    ? "CAPTURADO"
                                    : "CAPTURAR"}
                                </Button>
                                {selectedRowId === row.id && isToday && (
                                  <Button
                                    size="sm"
                                    className="bg-blue-600 text-[10px] whitespace-nowrap h-6 px-1.5"
                                    onClick={() => handleSaveWeight(row)}
                                    disabled={
                                      saveWeighingMutation.isPending ||
                                      updateWeighingMutation.isPending ||
                                      !capturedWeight
                                    }
                                  >
                                    {saveWeighingMutation.isPending ||
                                    updateWeighingMutation.isPending
                                      ? row.savedWeight > 0
                                        ? "ACTUALIZANDO..."
                                        : "GUARDANDO..."
                                      : row.savedWeight > 0
                                        ? "ACTUALIZAR"
                                        : "GUARDAR"}
                                  </Button>
                                )}
                                {/* Botón de descarga de ticket para esta sección */}
                                {weighingStageId === 2 &&
                                  row.idDetailAnimalWeighing && (
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <Button
                                            size="sm"
                                            className="ml-2 bg-teal-600 hover:bg-teal-700 text-white h-6 w-6 p-0"
                                            onClick={() =>
                                              handleDownloadPdf(
                                                row.idDetailAnimalWeighing!,
                                              )
                                            }
                                            disabled={
                                              downloadingPdfId ===
                                              row.idDetailAnimalWeighing
                                            }
                                          >
                                            {downloadingPdfId ===
                                            row.idDetailAnimalWeighing ? (
                                              <Loader2 className="h-3.5 w-3.5 animate-spin text-white" />
                                            ) : (
                                              <Ticket className="h-3.5 w-3.5 text-white" />
                                            )}
                                          </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p>
                                            Descargar Ticket{" "}
                                            {row.sectionCode || ""}
                                          </p>
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </Card>
                  );
                },
              );
            })()
          )}
        </div>

        {/* Versión desktop - Tabla */}
        <div className="hidden lg:block overflow-x-auto">
          {(() => {
            // Verificar si hay algún animal con idAnimalWeighing
            const hasDeleteButton = paginatedRows.some(
              (row) => row.idAnimalWeighing,
            );

            // Calcular el número total de columnas para el colspan
            const totalColumns =
              weighingStageId !== 1
                ? hasDeleteButton
                  ? 9
                  : 8 // CANAL/DISTRIBUCIÓN: 6 columnas + obs + acción (+ delete si aplica)
                : hasDeleteButton
                  ? 7
                  : 6; // EN PIE: 4 columnas + obs + acción (+ delete si aplica)

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
                    <TableHead className="text-center text-xs whitespace-nowrap py-0.5 px-1">
                      <div className="flex items-center justify-center gap-1">
                        <MessageCircle className="h-3 w-3" />
                        <span>Obs.</span>
                      </div>
                    </TableHead>
                    <TableHead
                      className="text-center text-xs whitespace-nowrap py-0.5 px-1"
                      colSpan={hasDeleteButton ? 2 : 1}
                    >
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
                      <TableCell
                        colSpan={totalColumns}
                        className="text-center py-8 text-muted-foreground"
                      >
                        {isLoadingWeighingData
                          ? "Cargando animales..."
                          : "No hay registros disponibles"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    (() => {
                      const groupedRows: {
                        [key: string]: typeof paginatedRows;
                      } = {};
                      paginatedRows.forEach((row) => {
                        const groupKey = `${row.code}_${row.idDetailsCertificateBrands}`;
                        if (!groupedRows[groupKey]) {
                          groupedRows[groupKey] = [];
                        }
                        groupedRows[groupKey].push(row);
                      });

                      return Object.entries(groupedRows).map(
                        ([groupKey, animalRows]) => {
                          const animalCode = animalRows[0].code;
                          const sortedRows = [...animalRows].sort((a, b) => {
                            // 1. Priorizar filas con destinatario Y sin peso (listas para pesar)
                            const aReadyToWeigh =
                              !!a.addressee && a.savedWeight === 0;
                            const bReadyToWeigh =
                              !!b.addressee && b.savedWeight === 0;
                            if (aReadyToWeigh && !bReadyToWeigh) return -1;
                            if (!aReadyToWeigh && bReadyToWeigh) return 1;

                            // 2. Dentro de las listas para pesar, priorizar la marcada como principal
                            if (aReadyToWeigh && bReadyToWeigh) {
                              if (a.isPrimaryRow && !b.isPrimaryRow) return -1;
                              if (!a.isPrimaryRow && b.isPrimaryRow) return 1;
                            }

                            // 3. Luego filas sin destinatario y sin peso (en espera)
                            const aWaiting =
                              !a.addressee && a.savedWeight === 0;
                            const bWaiting =
                              !b.addressee && b.savedWeight === 0;
                            if (aWaiting && !bWaiting) return -1;
                            if (!aWaiting && bWaiting) return 1;

                            // 4. Al final filas con peso ya guardado (completadas)
                            // Estas se ordenan por idChannelSection
                            const idA = a.idChannelSection || 0;
                            const idB = b.idChannelSection || 0;
                            return idA - idB;
                          });

                          // Log solo cuando hay destinatario asignado
                          if (sortedRows.some((r) => r.addressee)) {
                            console.log(
                              `👑 Animal ${animalCode} (DESKTOP):`,
                              sortedRows.map((r) => ({
                                section: r.sectionCode,
                                prioridad:
                                  r.addressee && r.savedWeight === 0
                                    ? "1-LISTO PARA PESAR ⭐"
                                    : !r.addressee && r.savedWeight === 0
                                      ? "2-ESPERANDO"
                                      : "3-COMPLETADO",
                                isPrimary: r.isPrimaryRow,
                                peso: r.savedWeight,
                              })),
                            );
                          }

                          const rowSpan = sortedRows.length;
                          return sortedRows.map((row, index) => {
                            const isFirstRow = index === 0;
                            const isLastRow = index === sortedRows.length - 1;
                            return (
                              <TableRow
                                key={`${animalRows[0].idDetailsCertificateBrands}_${row.id}`}
                                className={`
                          rounded-none
                          ${row.isComplete ? "[&]:!bg-[#86c6c5] hover:!bg-[#86c6c5]" : "bg-green-50 hover:!bg-green-50"}
                          ${isFirstRow ? "border-t-4 border-t-teal-600 shadow-[0_-2px_4px_rgba(0,0,0,0.1)]" : ""}
                          ${isLastRow ? "border-b-4 border-b-teal-600 shadow-[0_2px_4px_rgba(0,0,0,0.1)]" : ""}
                        `}
                              >
                                {/* Fecha de Ingreso - solo en la primera fila del animal */}
                                {index === 0 && (
                                  <TableCell
                                    className="text-center text-xs py-0.5 px-1"
                                    rowSpan={rowSpan}
                                  >
                                    {new Date(
                                      row.fechaIngreso,
                                    ).toLocaleDateString("es-ES", {
                                      year: "numeric",
                                      month: "2-digit",
                                      day: "2-digit",
                                    })}
                                  </TableCell>
                                )}
                                {/* Código del Animal - solo en la primera fila del animal */}
                                {index === 0 && (
                                  <TableCell
                                    className="text-center font-medium text-xs py-0.5 px-1"
                                    rowSpan={rowSpan}
                                  >
                                    {row.brandName
                                      ? `${row.code} - ${row.brandName}`
                                      : row.code}
                                  </TableCell>
                                )}
                                {/* Producto - solo en la primera fila del animal */}
                                {index === 0 && (
                                  <TableCell
                                    className="text-center text-xs py-0.5 px-1"
                                    rowSpan={rowSpan}
                                  >
                                    {row.producto}
                                  </TableCell>
                                )}
                                {/* Destinatario - solo en la primera fila del animal cuando no es EN PIE */}
                                {weighingStageId !== 1 && index === 0 && (
                                  <TableCell
                                    className="text-center py-0.5 px-1"
                                    rowSpan={rowSpan}
                                  >
                                    {sortedRows[0].addressee ? (
                                      <div className="flex flex-col items-center gap-0.5">
                                        <div className="flex items-center gap-1">
                                          <User className="h-3 w-3 text-teal-600" />
                                          <span className="text-xs font-medium leading-tight">
                                            {toCapitalize(
                                              sortedRows[0].addressee.fullName,
                                              true,
                                            )}
                                          </span>
                                        </div>
                                        <span className="text-[10px] text-black leading-tight">
                                          {
                                            sortedRows[0].addressee
                                              .identification
                                          }
                                        </span>
                                        <div className="w-full border-t border-gray-200 my-0.5"></div>
                                        {sortedRows[0].carrier ? (
                                          <>
                                            <div className="flex items-center gap-1">
                                              <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="h-3 w-3 text-blue-600"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                              >
                                                <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
                                                <path d="M15 18H9" />
                                                <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14" />
                                                <circle cx="17" cy="18" r="2" />
                                                <circle cx="7" cy="18" r="2" />
                                              </svg>
                                              <span className="text-xs font-medium leading-tight text-blue-600">
                                                {toCapitalize(
                                                  sortedRows[0].carrier
                                                    .fullName,
                                                  true,
                                                )}
                                              </span>
                                            </div>
                                            <span className="text-[10px] text-black leading-tight">
                                              {sortedRows[0].carrier.plate}
                                            </span>
                                          </>
                                        ) : (
                                          <div className="flex items-center gap-1">
                                            <svg
                                              xmlns="http://www.w3.org/2000/svg"
                                              className="h-3 w-3 text-gray-400"
                                              viewBox="0 0 24 24"
                                              fill="none"
                                              stroke="currentColor"
                                              strokeWidth="2"
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                            >
                                              <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
                                              <path d="M15 18H9" />
                                              <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14" />
                                              <circle cx="17" cy="18" r="2" />
                                              <circle cx="7" cy="18" r="2" />
                                            </svg>
                                            <span className="text-xs text-gray-400 leading-tight">
                                              Sin transportista
                                            </span>
                                          </div>
                                        )}
                                        {isToday && (
                                          <Button
                                            size="sm"
                                            variant="ghost"
                                            className="text-teal-600 hover:text-teal-700 h-5 px-1.5 text-[10px]"
                                            onClick={() =>
                                              setAddresseeSelectionRowId(
                                                sortedRows[0].id,
                                              )
                                            }
                                          >
                                            <Edit className="h-2.5 w-2.5 mr-0.5" />
                                            Cambiar
                                          </Button>
                                        )}
                                      </div>
                                    ) : (
                                      isToday && (
                                        <div className="flex justify-center">
                                          <Button
                                            size="sm"
                                            className="bg-teal-600 hover:bg-teal-700 h-6 text-xs px-2"
                                            onClick={() =>
                                              setAddresseeSelectionRowId(
                                                sortedRows[0].id,
                                              )
                                            }
                                          >
                                            Agregar
                                          </Button>
                                        </div>
                                      )
                                    )}
                                  </TableCell>
                                )}
                                {/* Sección - siempre visible cuando no es EN PIE */}
                                {weighingStageId !== 1 && (
                                  <TableCell className="text-center py-0.5 px-1">
                                    {row.sectionCode ? (
                                      <div className="flex flex-col items-center gap-0">
                                        <span className="font-bold text-blue-600 text-xs leading-tight">
                                          {row.sectionCode}
                                        </span>
                                        <span className="text-[10px] text-black leading-tight">
                                          {row.sectionDescription}
                                        </span>
                                        {row.hasPartialConfiscation && (
                                          <div className="flex items-center gap-0.5 mt-0.5 text-yellow-600">
                                            <svg
                                              xmlns="http://www.w3.org/2000/svg"
                                              className="h-3 w-3"
                                              viewBox="0 0 20 20"
                                              fill="currentColor"
                                            >
                                              <path
                                                fillRule="evenodd"
                                                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                                clipRule="evenodd"
                                              />
                                            </svg>
                                            <span className="text-[10px] font-semibold leading-tight">
                                              Decomiso
                                            </span>
                                          </div>
                                        )}
                                      </div>
                                    ) : (
                                      "-"
                                    )}
                                  </TableCell>
                                )}
                                <TableCell className="text-center py-0.5 px-1">
                                  <span
                                    className={`font-semibold text-xs ${row.displayWeight < 0 ? "text-red-600" : "text-green-600"}`}
                                  >
                                    {row.displayWeight !== 0
                                      ? `${row.displayWeight.toFixed(2)} ${unitMeasureData?.data?.symbol || "kg"}`
                                      : "-"}
                                  </span>
                                </TableCell>
                                <TableCell className="text-center py-0.5 px-1">
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <div className="flex items-center justify-center cursor-help">
                                          <MessageCircle
                                            className={`h-3.5 w-3.5 ${row.commentary ? "text-blue-600" : "text-gray-300"}`}
                                          />
                                        </div>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p className="max-w-xs">
                                          {row.commentary ||
                                            "Sin observaciones"}
                                        </p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </TableCell>
                                <TableCell className="py-0.5 px-1">
                                  <div className="flex gap-0 justify-start items-center">
                                    <Button
                                      size="sm"
                                      variant={
                                        selectedRowId === row.id
                                          ? "default"
                                          : "outline"
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
                                      disabled={!isConnected || !isToday}
                                    >
                                      {selectedRowId === row.id
                                        ? "CAPTURADO"
                                        : "CAPTURAR"}
                                    </Button>
                                    {selectedRowId === row.id && isToday && (
                                      <Button
                                        size="sm"
                                        className="bg-blue-600 text-[9px] whitespace-nowrap h-6 px-1.5 rounded-l-none border-l-0"
                                        onClick={() => handleSaveWeight(row)}
                                        disabled={
                                          saveWeighingMutation.isPending ||
                                          updateWeighingMutation.isPending ||
                                          !capturedWeight
                                        }
                                      >
                                        {saveWeighingMutation.isPending ||
                                        updateWeighingMutation.isPending
                                          ? row.savedWeight > 0
                                            ? "ACTUALIZANDO..."
                                            : "GUARDANDO..."
                                          : row.savedWeight > 0
                                            ? "ACTUALIZAR"
                                            : "GUARDAR"}
                                      </Button>
                                    )}
                                    {/* Botón de descarga de ticket para esta sección */}
                                    {weighingStageId === 2 &&
                                      row.idDetailAnimalWeighing && (
                                        <TooltipProvider>
                                          <Tooltip>
                                            <TooltipTrigger asChild>
                                              <Button
                                                size="sm"
                                                className="ml-2 bg-teal-600 hover:bg-teal-700 text-white h-6 w-6 p-0"
                                                onClick={() =>
                                                  handleDownloadPdf(
                                                    row.idDetailAnimalWeighing!,
                                                  )
                                                }
                                                disabled={
                                                  downloadingPdfId ===
                                                  row.idDetailAnimalWeighing
                                                }
                                              >
                                                {downloadingPdfId ===
                                                row.idDetailAnimalWeighing ? (
                                                  <Loader2 className="h-3.5 w-3.5 animate-spin text-white" />
                                                ) : (
                                                  <Ticket className="h-3.5 w-3.5 text-white" />
                                                )}
                                              </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                              <p>
                                                Descargar Ticket{" "}
                                                {row.sectionCode || ""}
                                              </p>
                                            </TooltipContent>
                                          </Tooltip>
                                        </TooltipProvider>
                                      )}
                                  </div>
                                </TableCell>
                                {hasDeleteButton && index === 0 && (
                                  <TableCell
                                    className="py-0.5 px-0"
                                    rowSpan={rowSpan}
                                  >
                                    <div className="flex flex-col items-center justify-center gap-1">
                                      {row.idAnimalWeighing && isToday && (
                                        <TooltipProvider>
                                          <Tooltip>
                                            <TooltipTrigger asChild>
                                              <Button
                                                size="sm"
                                                variant="ghost"
                                                className="text-red-600 hover:text-red-700 hover:bg-red-50 h-6 w-6 p-0"
                                                onClick={() =>
                                                  handleDeleteClick(
                                                    row.idAnimalWeighing!,
                                                    row.code,
                                                  )
                                                }
                                              >
                                                <Trash2 className="h-3.5 w-3.5" />
                                              </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                              <p>Eliminar Registro</p>
                                            </TooltipContent>
                                          </Tooltip>
                                        </TooltipProvider>
                                      )}
                                    </div>
                                  </TableCell>
                                )}
                              </TableRow>
                            );
                          });
                        },
                      );
                    })()
                  )}
                </TableBody>
              </Table>
            );
          })()}
        </div>

        {/* Paginación */}
        {totalAnimals > 0 && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-3 px-2 sm:px-4 border-t border-gray-200 mt-3">
            <div className="flex items-center gap-3">
              <div className="text-sm text-muted-foreground">
                Mostrando {startAnimalIndex + 1} a{" "}
                {Math.min(endAnimalIndex, totalAnimals)} de {totalAnimals}{" "}
                animales ({filteredRows.length} registros)
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
              <div className="flex items-center gap-x-1.5 flex-wrap">
                <Button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((prev) => prev - 1)}
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs"
                >
                  Anterior
                </Button>
                {/* Mostrar primera página */}
                {currentPage > 3 && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0 text-xs"
                      onClick={() => setCurrentPage(1)}
                    >
                      1
                    </Button>
                    {currentPage > 4 && (
                      <span className="px-1 text-xs text-muted-foreground">
                        ...
                      </span>
                    )}
                  </>
                )}
                {/* Mostrar páginas alrededor de la actual */}
                {Array.from({ length: totalPages }, (_, i) => {
                  const pageNumber = i + 1;
                  const isCurrentPage = pageNumber === currentPage;

                  // Mostrar página si está cerca de la actual o es primera/última
                  const shouldShow =
                    pageNumber === 1 ||
                    pageNumber === totalPages ||
                    (pageNumber >= currentPage - 1 &&
                      pageNumber <= currentPage + 1);

                  if (!shouldShow) return null;

                  return (
                    <Button
                      key={pageNumber}
                      variant="outline"
                      size="sm"
                      className={`h-8 w-8 p-0 text-xs ${
                        isCurrentPage
                          ? "bg-teal-600 text-white hover:bg-teal-700 hover:text-white border-teal-600"
                          : ""
                      }`}
                      onClick={() => setCurrentPage(pageNumber)}
                    >
                      {pageNumber}
                    </Button>
                  );
                })}
                {/* Mostrar última página */}
                {currentPage < totalPages - 2 && (
                  <>
                    {currentPage < totalPages - 3 && (
                      <span className="px-1 text-xs text-muted-foreground">
                        ...
                      </span>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0 text-xs"
                      onClick={() => setCurrentPage(totalPages)}
                    >
                      {totalPages}
                    </Button>
                  </>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((prev) => prev + 1)}
                  className="h-8 text-xs"
                >
                  Siguiente
                </Button>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Dialog de Selección de Destinatario y Transportista - Optimizado para Tablet */}
      <Dialog
        open={addresseeSelectionRowId !== null}
        onOpenChange={(open) => {
          if (!open) {
            setAddresseeSelectionRowId(null);
            setModalStep(1);
            setTempAddressee(null);
            setTempCarrier(null);
            setSkipAutoSelect(false);
          }
        }}
      >
        <DialogContent className="!w-[95vw] sm:!w-[90vw] md:!w-[85vw] lg:!w-[80vw] !max-w-[1200px] h-[90vh] max-h-[90vh] overflow-y-auto overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] p-4 sm:p-6">
          <DialogHeader className="pb-3">
            <DialogTitle className="text-lg sm:text-xl font-bold truncate">
              Asignar Destinatario y Transportista
            </DialogTitle>
            <p className="text-sm text-muted-foreground">
              Seleccione un destinatario y transportista para el animal
              seleccionado
            </p>
          </DialogHeader>
          <div className="w-full min-w-0 space-y-4">
            {/* Paso 1: Seleccionar Destinatario */}
            {modalStep === 1 && !tempAddressee && (
              <AddresseeSelectionWeighing
                initialBrandId={
                  skipAutoSelect
                    ? undefined
                    : rows.find((r) => r.id === addresseeSelectionRowId)
                        ?.brandId
                }
                initialBrandName={
                  skipAutoSelect
                    ? undefined
                    : rows.find((r) => r.id === addresseeSelectionRowId)
                        ?.brandName
                }
                onSelect={(addressee) => {
                  setTempAddressee(addressee);
                }}
                isDefaultAddressSelected={isDefaultAddressSelected}
                setIsDefaultAddressSelected={setIsDefaultAddressSelected}
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
              <AddresseeSummaryCardWeighing
                addressee={tempAddressee}
                onEdit={() => {
                  setTempAddressee(null);
                  setTempCarrier(null);
                  setModalStep(1);
                  setSkipAutoSelect(true);
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
                filterByStatus={true}
                selectedSpecieId={selectedSpecieId}
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

            {/* Botón Finalizar - Optimizado para Tablet */}
            {tempAddressee && tempCarrier && (
              <div className="flex justify-end pt-6">
                <Button
                  className="bg-teal-600 hover:bg-teal-700 px-8 py-3 text-base font-semibold"
                  onClick={() => {
                    if (addresseeSelectionRowId) {
                      handleAddresseeSelect(
                        addresseeSelectionRowId,
                        tempAddressee,
                        tempCarrier,
                      );
                    }
                    setAddresseeSelectionRowId(null);
                    setModalStep(1);
                    setTempAddressee(null);
                    setTempCarrier(null);
                  }}
                >
                  Asignar al Animal
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
            setDeleteConfirmation({
              isOpen: false,
              idAnimalWeighing: null,
              animalCode: "",
            });
          }
        }}
      >
        <AlertDialogContent className="p-4 sm:p-6">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg sm:text-xl font-bold">
              Confirmar Eliminación
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm sm:text-base text-muted-foreground">
              ¿Estás seguro de que deseas eliminar el registro de pesaje del
              animal{" "}
              <span className="font-semibold">
                {deleteConfirmation.animalCode}
              </span>
              ? Esta acción no se puede deshacer.
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
                {deleteWeighingMutation.isPending
                  ? "Eliminando..."
                  : "Eliminar"}
              </Button>
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
