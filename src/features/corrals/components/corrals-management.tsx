"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { toast } from "sonner";
import {
  Video,
  ChevronDown,
  ArrowDownUp,
  ChartColumn,
  Lock,
  LockOpen,
  Loader2,
  MousePointerClick
} from "lucide-react";
import {
  LineaType,
  ProcessType,
  Corral,
  CorralStatus,
  getOccupationColor,
  Line,
  CorralGroup,
  ApiCorral,
  type StatusCorralByAdmission,
  type BrandDetail,
} from "../domain";
import {
  getLineByTypeService,
  getAllCorralGroupsService,
  getCorralesByGroupService,
  getStatusCorralsByAdmissionDateService,
  getBrandDetailsByLineService,
  closeCorralByStatusIdService,
} from "../server/db/corrals.service";
import {
  saveCertBrand,
  updateCertBrand,
  getCertBrandById
} from "@/features/setting-certificate-brand/server/db/setting-cert-brand.service";
import type { SaveCertificateBrand } from "@/features/setting-certificate-brand/domain/save-certificate-brand";
import { getProductiveStagesBySpecie } from "@/features/productive-stage/server/db/productive-stage.service";
import type { ProductiveStage } from "@/features/productive-stage/domain";
import { LegendCard } from "./parts/LegendCard";
import { TransferModal } from "./transfer-modal";
import { ConfirmationModal } from "./confirmation-modal";
import { LoadingSpinner, CorralesLoadingGrid } from "./parts/LoadingSpinner";
import { VideoUploadDialog, type VideoItem } from "./parts/VideoUploadDialog";
import { ConfirmToggleDialog } from "./parts/ConfirmToggleDialog";
import { LineTabsDate } from "./parts/LineTabsDate";
import { TitleStats } from "./parts/TitleStats";
import { ProcessFilterTabs } from "./parts/ProcessFilterTabs";
import { removeStatusCorralVideoById, saveStatusCorralVideoById } from "@/features/corral/server/db/status-corral.service";
import { readMultipleVideoFiles, readVideoFileMetadata } from "@/lib/read-video-metadata";


// Obtener fecha actual en zona horaria local para evitar desfases
const today = new Date();
const currentDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`; // YYYY-MM-DD

export function CorralsManagement() {
  // Initialize with default value to avoid hydration mismatch
  const [selectedTab, setSelectedTab] = useState<LineaType>("bovinos");
  const [isClientMounted, setIsClientMounted] = useState(false);

  // Load from localStorage after component mounts (client-side only)
  useEffect(() => {
    setIsClientMounted(true);
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('corrals-selected-line');
      if (saved && ['bovinos', 'porcinos', 'ovinos-caprinos'].includes(saved)) {
        setSelectedTab(saved as LineaType);
      }
    }
  }, []);

  const [selectedDate, setSelectedDate] = useState<Date>(new Date()); // hoy
  const [processFilter, setProcessFilter] = useState<ProcessType>("todos");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [targetCorralId, setTargetCorralId] = useState<string | null>(null);
  const [dialogAction, setDialogAction] = useState<"abrir" | "cerrar">(
    "cerrar"
  );
  const [targetScope, setTargetScope] = useState<"linea" | "especial">("linea");

  // State for line data from API
  const [currentLineData, setCurrentLineData] = useState<Line | null>(null);
  const [isLoadingLine, setIsLoadingLine] = useState(false);

  // State for all corral groups from API
  const [allCorralGroups, setAllCorralGroups] = useState<CorralGroup[]>([]);
  const [isLoadingGroups, setIsLoadingGroups] = useState(false);

  // State for corrales from API
  const [apiCorrales, setApiCorrales] = useState<ApiCorral[]>([]);
  const [isLoadingCorrales, setIsLoadingCorrales] = useState(false);
  const [hasInitiallyLoaded, setHasInitiallyLoaded] = useState(false);

  // State for dynamic filter counts based on actual corrales
  const [realFilterCounts, setRealFilterCounts] = useState<Record<number, number>>({});
  const [isLoadingCounts, setIsLoadingCounts] = useState(false);

  // Status overlay by admission date mapped by corral ID (string)
  // We now store the status record id from the API and the closeCorral flag
  const [statusByDateMap, setStatusByDateMap] = useState<
    Record<string, { quantity: number; status: boolean; statusRecordId?: number; closeCorral?: boolean; urlVideo: string[] }>
  >({});
  const [isLoadingStatusByDate, setIsLoadingStatusByDate] = useState(false);

  // Brand details mapped by corral ID (string) and status corral ID
  const [brandDetailsMap, setBrandDetailsMap] = useState<Record<string, BrandDetail[]>>({});
  const [isLoadingBrandDetails, setIsLoadingBrandDetails] = useState(false);

  // Save selected line to localStorage whenever it changes (only after client mount)
  useEffect(() => {
    if (isClientMounted) {
      localStorage.setItem('corrals-selected-line', selectedTab);
    }
  }, [selectedTab, isClientMounted]);

  // State for productive stages from API
  const [productiveStages, setProductiveStages] = useState<ProductiveStage[]>([]);
  const [isLoadingProductiveStages, setIsLoadingProductiveStages] = useState(false);

  // Cache for corrales by group to avoid redundant API calls
  const [corralesCache, setCorralesCache] = useState<Record<string, { data: ApiCorral[]; timestamp: number }>>({});
  const CACHE_DURATION = 30000; // 30 seconds cache

  // Local state for corrales to reflect UI changes on toggle (removed mock data)
  const [specialCorralStatus, setSpecialCorralStatus] = useState<
    Record<string, CorralStatus>
  >({
    C11: "disponible",
    C12: "disponible",
    "EMBUDO-BOV": "disponible",
  });
  // Mobile transfer modal state
  const [mobileTransferModal, setMobileTransferModal] = useState<{
    isOpen: boolean;
    brand: BrandDetail | null;
    sourceCorralId: string | null;
    selectedQuantitiesByStage: Record<number, number>; // stageId -> quantity selected for transfer
    initialQuantitiesByStage?: Record<number, number>; // stageId -> initial/max quantity available
    targetCorralId: string | null;
  }>({
    isOpen: false,
    brand: null,
    sourceCorralId: null,
    selectedQuantitiesByStage: {},
    initialQuantitiesByStage: {},
    targetCorralId: null
  });

  // Confirmation modal state
  const [confirmationModal, setConfirmationModal] = useState<{
    isOpen: boolean;
    brand: BrandDetail | null;
    sourceCorralId: string | null;
    targetCorralId: string | null;
    targetCorralName: string | null;
    selectedMales: number;
    selectedFemales: number;
    selectedQuantitiesByStage?: Record<number, number>;
    initialQuantitiesByStage?: Record<number, number>; // Add initial quantities
  }>({
    isOpen: false,
    brand: null,
    sourceCorralId: null,
    targetCorralId: null,
    targetCorralName: null,
    selectedMales: 0,
    selectedFemales: 0,
    selectedQuantitiesByStage: {},
    initialQuantitiesByStage: {} // Initialize
  });

  // Prevent duplicate transfers
  const [isTransferring, setIsTransferring] = useState(false);

  // Client-side mobile detection (after hydration)
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window || navigator.maxTouchPoints > 0);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Helper function to reset mobile transfer modal
  const resetMobileTransferModal = () => {
    setMobileTransferModal({
      isOpen: false,
      brand: null,
      sourceCorralId: null,
      selectedQuantitiesByStage: {},
      initialQuantitiesByStage: {},
      targetCorralId: null
    });
  };

  // Helper function to reset confirmation modal
  const resetConfirmationModal = () => {
    setConfirmationModal({
      isOpen: false,
      brand: null,
      sourceCorralId: null,
      targetCorralId: null,
      targetCorralName: null,
      selectedMales: 0,
      selectedFemales: 0,
      selectedQuantitiesByStage: {},
      initialQuantitiesByStage: {} // Reset initial quantities
    });
  };

  const openCorralDialog = (corralId: string) => {
    setTargetCorralId(corralId);
    setTargetScope("linea");
    // Determine current action based on current status with safety check
    const corral = corralesWithLiveStats.find((c) => c && c.id === corralId);

    if (!corral) {
      setDialogAction("cerrar"); // Default action
    } else {
      const action = corral.dbStatus === true ? "cerrar" : "abrir";
      setDialogAction(action);
    }

    setDialogOpen(true);
  };

  const openSpecialCorralDialog = (corralId: string) => {
    setTargetCorralId(corralId);
    setTargetScope("especial");
    const status = specialCorralStatus[corralId] || "disponible";
    setDialogAction(status === "ocupado" ? "abrir" : "cerrar");
    setDialogOpen(true);
  };

  // Handle mobile brand click (alternative to drag and drop)
  const handleMobileBrandClick = async (brand: BrandDetail, sourceCorralId: string) => {
    // Pre-load certificate data to optimize partial transfers
    try {
      const fullDataResponse = await getCertBrandById(brand.id);
      const fullData = fullDataResponse.data;

      // Store the full certificate data in the brand for later use
      const enhancedBrand = {
        ...brand,
        certificateData: {
          idCertificate: fullData.idCertificate,
          idCorralType: fullData.idCorralType,
          idBrands: fullData.idBrands
        },
        // Add the details for quantity reference
        detailsCertificateBrand: fullData.detailsCertificateBrand || []
      };

      // Initialize selected quantities based on detailsCertificateBrand
      // Match idProductiveStage with stage.id and use the actual quantity
      const initialQuantities: Record<number, number> = {};

      // Create a map of stage ID to quantity from detailsCertificateBrand
      const stageQuantityMap: Record<number, number> = {};
      if (fullData.detailsCertificateBrand && Array.isArray(fullData.detailsCertificateBrand)) {
        fullData.detailsCertificateBrand.forEach(detail => {
          if (detail.status) { // Only active details
            stageQuantityMap[detail.idProductiveStage] = detail.quantity;
          }
        });
      }

      // Set quantities for each productive stage
      productiveStages.forEach(stage => {
        // Use the specific quantity from detailsCertificateBrand if available
        const specificQuantity = stageQuantityMap[stage.id];
        if (specificQuantity !== undefined) {
          initialQuantities[stage.id] = specificQuantity;
        } else {
          // Fallback: use 0 if no specific quantity found
          initialQuantities[stage.id] = 0;
        }
      });

      setMobileTransferModal({
        isOpen: true,
        brand: enhancedBrand,
        sourceCorralId,
        selectedQuantitiesByStage: initialQuantities,
        initialQuantitiesByStage: { ...stageQuantityMap }, // Keep a copy of initial quantities
        targetCorralId: null
      });
    } catch (error: any) {
      console.error('Error pre-loading certificate data:', error);

      // Show detailed error message
      const errorMessage = error?.response?.statusText || error?.message || 'Error desconocido';
      toast.error(`Error al cargar datos del certificado (ID: ${brand.id}): ${errorMessage}`);

      // Fallback: Use brand's existing detailsCertificateBrand if available
      const initialQuantities: Record<number, number> = {};
      const stageQuantityMap: Record<number, number> = {};

      // Try to use existing details from brand if available
      if (brand.detailsCertificateBrand && Array.isArray(brand.detailsCertificateBrand)) {
        brand.detailsCertificateBrand.forEach(detail => {
          if (detail.status) {
            stageQuantityMap[detail.idProductiveStage] = detail.quantity;
          }
        });
      }

      // Set quantities for each productive stage
      productiveStages.forEach(stage => {
        const specificQuantity = stageQuantityMap[stage.id];
        initialQuantities[stage.id] = specificQuantity !== undefined ? specificQuantity : 0;
      });

      setMobileTransferModal({
        isOpen: true,
        brand,
        sourceCorralId,
        selectedQuantitiesByStage: initialQuantities,
        initialQuantitiesByStage: { ...stageQuantityMap },
        targetCorralId: null
      });
    }
  };

  // Handle mobile transfer - now opens confirmation modal
  const handleMobileTransfer = (targetCorralId: string) => {
    if (isTransferring) {
      return;
    }

    const { brand: brandToMove, sourceCorralId, selectedQuantitiesByStage, initialQuantitiesByStage } = mobileTransferModal;

    if (!brandToMove || !sourceCorralId) {
      return;
    }

    const targetCorral = corralesWithLiveStats.find(c => c && c.id === targetCorralId);
    if (!targetCorral) {
      toast.error("Corral de destino no encontrado");
      return;
    }

    // Calculate total animals to move from all stages
    const totalAnimalsToMove = Object.values(selectedQuantitiesByStage).reduce((sum, qty) => sum + qty, 0);
    if (totalAnimalsToMove === 0) {
      toast.error("Debe seleccionar al menos un animal para transferir");
      return;
    }

    if (targetCorral.disponibles < totalAnimalsToMove) {
      toast.error(`No hay suficiente espacio en ${targetCorral.name}. Disponibles: ${targetCorral.disponibles}, Necesarios: ${totalAnimalsToMove}`);
      return;
    }

    // Calculate selected males and females for backward compatibility
    const selectedMales = productiveStages
      .filter(stage => stage.idAnimalSex === 2) // Males
      .reduce((sum, stage) => sum + (selectedQuantitiesByStage[stage.id] || 0), 0);

    const selectedFemales = productiveStages
      .filter(stage => stage.idAnimalSex === 1) // Females
      .reduce((sum, stage) => sum + (selectedQuantitiesByStage[stage.id] || 0), 0);

    // Open confirmation modal with both selected and initial quantities
    setConfirmationModal({
      isOpen: true,
      brand: brandToMove,
      sourceCorralId,
      targetCorralId,
      targetCorralName: targetCorral.name,
      selectedMales,
      selectedFemales,
      selectedQuantitiesByStage: selectedQuantitiesByStage,
      initialQuantitiesByStage: initialQuantitiesByStage // Pass initial quantities
    });

    // Close the transfer modal
    resetMobileTransferModal();
  };

const reloadStatusByDate = async () => {
    try {
      setIsLoadingStatusByDate(true);
      const items = await getStatusCorralsByAdmissionDateService(selectedDate);
      const map: Record<string, { quantity: number; status: boolean; statusRecordId?: number; closeCorral?: boolean; urlVideo:string[] }> = {};
      for (const item of items as StatusCorralByAdmission[]) {
        const key = String(item.idCorrals);
        if (!map[key]) {
          map[key] = { quantity: 0, status: true, statusRecordId: undefined, closeCorral: false, urlVideo: [] };
        }
        map[key].quantity += Number(item.quantity) || 0;
        if (!Boolean(item.status)) map[key].status = false;
        if ((item as any).id) map[key].statusRecordId = (item as any).id;
        if (typeof (item as any).closeCorral === 'boolean') map[key].closeCorral = (item as any).closeCorral;
        if (item.urlVideo) map[key].urlVideo = item.urlVideo;
      }
      setStatusByDateMap(map);
    } catch (error) {
      console.error('Error reloading status by date:', error);
    } finally {
      setIsLoadingStatusByDate(false);
    }
  };


  const canUploadVideoForCorral = (corralId: string) => {
    const status = statusByDateMap[corralId];
    if (!status) return false;
    const hasAnimalsInStatus = (status.quantity || 0) > 0;
    const hasBrands = (brandDetailsMap[corralId]?.length || 0) > 0;
    const hasVideos = (status.urlVideo?.length || 0) > 0;
    return hasAnimalsInStatus || hasBrands || hasVideos;
  }


  // Execute confirmed transfer
  const executeTransfer = async () => {
    if (isTransferring) {
      return;
    }

    const { brand: brandToMove, sourceCorralId, targetCorralId, selectedMales, selectedFemales } = confirmationModal;

    if (!brandToMove || !sourceCorralId || !targetCorralId) {
      return;
    }

    // Immediate lock to prevent race conditions
    setIsTransferring(true);

    try {
      const originalBrand = brandToMove;

      // Calculate remaining males and females based on the productive stages
      // Get original quantities from initialQuantitiesByStage
      const originalMalesByStage = productiveStages
        .filter(stage => stage.idAnimalSex === 2) // Males
        .reduce((sum, stage) => sum + (confirmationModal.initialQuantitiesByStage?.[stage.id] || 0), 0);

      const originalFemalesByStage = productiveStages
        .filter(stage => stage.idAnimalSex === 1) // Females
        .reduce((sum, stage) => sum + (confirmationModal.initialQuantitiesByStage?.[stage.id] || 0), 0);

      const remainingMales = Math.max(0, originalMalesByStage - selectedMales);
      const remainingFemales = Math.max(0, originalFemalesByStage - selectedFemales);

      // SOLUTION: Simple and reliable transfer detection
      // Complete transfer = ALL animals selected, Partial = SOME animals selected
      const totalOriginalAnimals = originalBrand.males + originalBrand.females;
      const totalSelectedAnimals = selectedMales + selectedFemales;
      const isCompleteTransfer = totalSelectedAnimals === totalOriginalAnimals && totalOriginalAnimals > 0;

      // Validate that we don't have negative values
      if (remainingMales < 0 || remainingFemales < 0) {
        throw new Error(`Error en cálculo: Machos restantes: ${remainingMales}, Hembras restantes: ${remainingFemales}`);
      }

      // 1. First, handle the database operations
      await handleDatabaseTransfer({
        originalBrand,
        targetCorralId: parseInt(targetCorralId),
        selectedMales,
        selectedFemales,
        remainingMales,
        remainingFemales,
        isCompleteTransfer,
        selectedDate,
        selectedQuantitiesByStage: confirmationModal.selectedQuantitiesByStage || {},
        initialQuantitiesByStage: confirmationModal.initialQuantitiesByStage || {}
      });

      // 2. Then update the UI state
      setBrandDetailsMap(prev => {
        const newMap = { ...prev };
        const sourceBrands = newMap[sourceCorralId] || [];

        // Find the exact brand instance
        let foundIndex = -1;
        for (let i = 0; i < sourceBrands.length; i++) {
          const brand = sourceBrands[i];
          if (brand.idBrand === brandToMove.idBrand &&
              brand.males === brandToMove.males &&
              brand.females === brandToMove.females &&
              brand.nameBrand === brandToMove.nameBrand) {
            foundIndex = i;
            break;
          }
        }

        if (foundIndex === -1) {
          toast.error('Error: Marca no encontrada en corral origen');
          return prev;
        }

        // Update source corral
        if (isCompleteTransfer) {
          // Remove brand completely if no animals remain
          const sourceBrandsUpdated = [
            ...sourceBrands.slice(0, foundIndex),
            ...sourceBrands.slice(foundIndex + 1)
          ];
          newMap[sourceCorralId] = sourceBrandsUpdated;
        } else {
          // Update brand with remaining animals
          const updatedSourceBrand = {
            ...originalBrand,
            males: remainingMales,
            females: remainingFemales
          };
          const sourceBrandsUpdated = [
            ...sourceBrands.slice(0, foundIndex),
            updatedSourceBrand,
            ...sourceBrands.slice(foundIndex + 1)
          ];
          newMap[sourceCorralId] = sourceBrandsUpdated;
        }

        // Add transferred animals to target corral
        const transferredBrand = {
          ...originalBrand,
          idCorral: parseInt(targetCorralId),
          males: selectedMales,
          females: selectedFemales
        };

        const targetBrands = newMap[targetCorralId] || [];

        // Check if brand already exists in target corral
        const existingBrandIndex = targetBrands.findIndex(b =>
          b.idBrand === transferredBrand.idBrand && b.nameBrand === transferredBrand.nameBrand
        );

        if (existingBrandIndex >= 0) {
          // Merge with existing brand
          const existingBrand = targetBrands[existingBrandIndex];
          const mergedBrand = {
            ...existingBrand,
            males: existingBrand.males + selectedMales,
            females: existingBrand.females + selectedFemales
          };
          const targetBrandsUpdated = [
            ...targetBrands.slice(0, existingBrandIndex),
            mergedBrand,
            ...targetBrands.slice(existingBrandIndex + 1)
          ];
          newMap[targetCorralId] = targetBrandsUpdated;
        } else {
          // Add as new brand
          newMap[targetCorralId] = [...targetBrands, transferredBrand];
        }

        return newMap;
      });

      toast.success(`${selectedMales + selectedFemales} animales de ${brandToMove.nameBrand} movidos exitosamente`);

      // Reload brand details from database to reflect actual state
      await reloadBrandDetails();

      // await to refresh status overlay
      await reloadStatusByDate();

      // Close confirmation modal
      resetConfirmationModal();

    } catch (error) {
      console.error('Error durante la transferencia:', error);
      toast.error('Error durante la transferencia. Verifique la conexión con el servidor.');
    } finally {
      // Always release the lock, even if there's an error
      setTimeout(() => {
        setIsTransferring(false);
      }, 1000);
    }
  };

  // Handle database transfer operations
  const handleDatabaseTransfer = async ({
    originalBrand,
    targetCorralId,
    selectedMales,
    selectedFemales,
    remainingMales,
    remainingFemales,
    isCompleteTransfer,
    selectedDate,
    selectedQuantitiesByStage,
    initialQuantitiesByStage
  }: {
    originalBrand: BrandDetail;
    targetCorralId: number;
    selectedMales: number;
    selectedFemales: number;
    remainingMales: number;
    remainingFemales: number;
    isCompleteTransfer: boolean;
    selectedDate: Date;
    selectedQuantitiesByStage: Record<number, number>;
    initialQuantitiesByStage: Record<number, number>;
  }) => {
    try {
      // For bovinos use species ID 1, for porcinos use 2, for ovinos-caprinos use 3
      const speciesId = currentLineData?.specie?.id || (
        selectedTab === 'bovinos' ? 1 :
        selectedTab === 'porcinos' ? 2 :
        selectedTab === 'ovinos-caprinos' ? 3 : 1
      );
      const slaughterDateObj = new Date();
      const slaughterDate = `${slaughterDateObj.getFullYear()}-${String(slaughterDateObj.getMonth() + 1).padStart(2, '0')}-${String(slaughterDateObj.getDate()).padStart(2, '0')}`;

      // Use the ID directly from BrandDetail (no need to fetch it)
      const settingCertBrandId = originalBrand.id;

      if (isCompleteTransfer) {
        // For complete transfer, UPDATE the existing record to change the corral
        // Include ONLY productive stages with quantity > 0 to avoid creating zero records
        const detailsCertificateBrand = productiveStages
          .map(stage => {
            const quantity = selectedQuantitiesByStage[stage.id] || 0;

            return {
              idSettingCertificateBrands: settingCertBrandId,
              idProductiveStage: stage.id,
              quantity: quantity,
              status: true
            };
          })
          .filter(detail => (detail.quantity || 0) > 0);

        const updateData = {
          idCorral: targetCorralId,
          males: selectedMales,
          females: selectedFemales,
          slaughterDate: slaughterDate,
          commentary: originalBrand.codes || `Transferido completamente al corral ${targetCorralId}`,
          detailsCertificateBrand: detailsCertificateBrand
        };

        await updateCertBrand(settingCertBrandId.toString(), updateData);

      } else {
        let certificateData;

        if (originalBrand.certificateData) {
          certificateData = originalBrand.certificateData;
        } else {
          const fullDataResponse = await getCertBrandById(originalBrand.id);
          const fullData = fullDataResponse.data;
          certificateData = {
            idCertificate: fullData.idCertificate,
            idCorralType: fullData.idCorralType,
            idBrands: fullData.idBrands
          };
        }
        const detailsCertificateBrand = Object.entries(selectedQuantitiesByStage)
          .filter(([stageId, quantity]) => quantity > 0)
          .map(([stageId, quantity]) => {
            return {
              idProductiveStage: parseInt(stageId),
              quantity: quantity,
              status: true
            };
          });


        const currentCorral = apiCorrales.find(c => c.id === targetCorralId)

        const transferData: SaveCertificateBrand = {
          idBrands: certificateData.idBrands,
          idCorralType: certificateData.idCorralType || 1,
          idCertificate: certificateData.idCertificate,
          idSpecies: speciesId,
          idCorral: targetCorralId,
          males: selectedMales,
          females: selectedFemales,
          slaughterDate: slaughterDate,
          commentary: `Transferido desde corral ${originalBrand.idCorral}`,
          status: true,
          idCorralGroup : currentCorral?.idCorralType!,
          detailsCertificateBrand: detailsCertificateBrand
        };

        const createResult = await saveCertBrand(transferData);

        // For partial transfer update: send ALL stages that originally had animals,
        // with their NEW quantities (after subtracting transferred animals)
        // This includes stages that now have 0 (all were transferred)
        const remainingDetailsCertificateBrand = productiveStages
          .filter(stage => {
            // Only include stages that ORIGINALLY had animals
            const originalQuantityForStage = initialQuantitiesByStage[stage.id] || 0;
            return originalQuantityForStage > 0;
          })
          .map(stage => {
            const transferredQuantity = selectedQuantitiesByStage[stage.id] || 0;
            const originalQuantityForStage = initialQuantitiesByStage[stage.id] || 0;

            // Calculate remaining: original - transferred
            const remainingQuantity = Math.max(0, originalQuantityForStage - transferredQuantity);

            return {
              idSettingCertificateBrands: settingCertBrandId,
              idProductiveStage: stage.id,
              quantity: remainingQuantity,
              status: true
            };
          });

        const remainingMalesTotal = Math.max(0, originalBrand.males - selectedMales);
        const remainingFemalesTotal = Math.max(0, originalBrand.females - selectedFemales);

        const updateData = {
          idCorral: originalBrand.idCorral,
          males: remainingMalesTotal,
          females: remainingFemalesTotal,
          slaughterDate: slaughterDate,
          commentary: originalBrand.codes || 'Cantidad actualizada por transferencia parcial',
          detailsCertificateBrand: remainingDetailsCertificateBrand
        };

        await updateCertBrand(settingCertBrandId.toString(), updateData);
      }

    } catch (error) {
      console.error('Error en operaciones de base de datos:', error);
      throw error;
    }
  };

  const reloadBrandDetails = async () => {
    if (!currentLineData) {
      return;
    }

    try {
      setIsLoadingBrandDetails(true);
      const allBrandDetails = await getBrandDetailsByLineService(selectedDate, currentLineData.id);
      const brandMap: Record<string, BrandDetail[]> = {};
      for (const detail of allBrandDetails) {
        const corralId = String(detail.idCorral);
        if (!brandMap[corralId]) {
          brandMap[corralId] = [];
        }
        brandMap[corralId].push(detail);
      }
      setBrandDetailsMap(brandMap);
    } catch (error) {
      console.error('Error reloading brand details:', error);
      setBrandDetailsMap({});
    } finally {
      setIsLoadingBrandDetails(false);
    }
  };
  const handleCorralToggle = (corralId: string) => {
    if (targetScope === "linea") {
      setApiCorrales((prev) =>
        prev.map((corral) => {
          if (!corral || !corral.id) {
            return corral;
          }
          return corral.id.toString() === corralId
            ? { ...corral, status: !corral.status }
            : corral;
        })
      );
    } else {
      setSpecialCorralStatus((prev) => ({
        ...prev,
        [corralId]: prev[corralId] === "disponible" ? "ocupado" : "disponible",
      }));
    }
  };

  const confirmCorralToggle = () => {
    if (!targetCorralId) return;
    let corralName = targetCorralId;
    if (targetScope === "linea") {
      const corral = currentCorrales.find((c) => c && c.id === targetCorralId);
      corralName = corral?.name || targetCorralId;
    }
    const statusEntry = statusByDateMap[targetCorralId];
    const statusRecordId = statusEntry?.statusRecordId;
    const shouldClose = dialogAction === "cerrar";
    (async () => {
      let success = false;
      if (statusRecordId) {
        const res = await closeCorralByStatusIdService(statusRecordId, shouldClose);
        success = !!(res && res.code === 200);
        if (!success) {
          toast.error("No se pudo actualizar el estado del corral en el servidor");
        }
      } else {
        toast("Estado del corral no encontrado en el servidor, aplicando cambio localmente");
        success = true;
      }

      if (success) {
        setStatusByDateMap((prev) => {
          const copy = { ...prev };
          if (!copy[targetCorralId]) {
            copy[targetCorralId] = { quantity: 0, status: true, statusRecordId: statusRecordId, closeCorral: shouldClose, urlVideo: [] };
          } else {
            copy[targetCorralId] = { ...copy[targetCorralId], closeCorral: shouldClose };
          }
          return copy;
        });
        setApiCorrales((prev) => prev.map((corral) => corral && corral.id.toString() === targetCorralId ? { ...corral, status: !shouldClose } : corral));
        if (shouldClose) {
          toast.success(`Corral ${corralName} cerrado exitosamente`, {
            description: "El corral ya no puede recibir más animales",
            duration: 5000,
            position: "bottom-right",
            descriptionClassName: "!text-black",
          });
        } else {
          toast.success(`Corral ${corralName} abierto exitosamente`, {
            description: "El corral puede recibir animales nuevamente",
            duration: 5000,
            position: "bottom-right",
            descriptionClassName: "!text-black",
          });
        }
      }
      setDialogOpen(false);
    })();
  };

  // -----------------------
  // Load line data from API
  // -----------------------

  useEffect(() => {
    const loadLineData = async () => {
      try {
        setIsLoadingLine(true);
        setIsLoadingProductiveStages(true);
        setHasInitiallyLoaded(false); // Reset when changing lines

        // Load line data
        const response = await getLineByTypeService(selectedTab);
        setCurrentLineData(response.data);
        if (response.data?.idSpecie) {
          try {
            const stagesResponse = await getProductiveStagesBySpecie(response.data.idSpecie);
            setProductiveStages(stagesResponse.data || []);
          } catch (stagesError) {
            console.error('Error loading productive stages:', stagesError);
            setProductiveStages([]);
          }
        } else {
          setProductiveStages([]);
        }

      } catch (error) {
        setCurrentLineData(null);
        setProductiveStages([]);
      } finally {
        setIsLoadingLine(false);
        setIsLoadingProductiveStages(false);
      }
    };

    loadLineData();
  }, [selectedTab]);

  // -----------------------
  // Helper function to get corrales with cache
  // -----------------------
  const getCorralesWithCache = async (groupId: number): Promise<ApiCorral[]> => {
    const cacheKey = `group-${groupId}`;
    const now = Date.now();
    const cached = corralesCache[cacheKey];
    if (cached && (now - cached.timestamp) < CACHE_DURATION) {
      return cached.data;
    }
    try {
      const response = await getCorralesByGroupService(groupId);
      const validCorrales = response.data?.filter(corral => corral !== null) || [];

      // Update cache
      setCorralesCache(prev => ({
        ...prev,
        [cacheKey]: { data: validCorrales, timestamp: now }
      }));

      return validCorrales;
    } catch (error) {
      console.error(`Error fetching corrales for group ${groupId}:`, error);
      return [];
    }
  };

  // -----------------------
  // Clear cache when changing lines
  // -----------------------
  useEffect(() => {
    setCorralesCache({});
  }, [selectedTab]);
  useEffect(() => {
    const calculateRealCounts = async () => {
      if (!currentLineData || !currentLineData.id || !allCorralGroups.length) {
        setRealFilterCounts({});
        return;
      }

      try {
        setIsLoadingCounts(true);
        const groupCounts: Record<number, number> = {};

        const currentGroups = getGroupsForCurrentLine();
        const allGroupIds = new Set(currentGroups.map(g => g.id));

        const promises = Array.from(allGroupIds).map(async (groupId) => {
          try {
            const validCorrales = await getCorralesWithCache(groupId);
            return { groupId, count: validCorrales.length };
          } catch (error) {
            return { groupId, count: 0 };
          }
        });

        const results = await Promise.all(promises);
        results.forEach(({ groupId, count }) => {
          groupCounts[groupId] = count;
        });

        setRealFilterCounts(groupCounts);
      } catch (error) {
        setRealFilterCounts({});
      } finally {
        setIsLoadingCounts(false);
      }
    };

    calculateRealCounts();
  }, [currentLineData, allCorralGroups, selectedTab]);

  useEffect(() => {
    const loadStatusByDate = async () => {
      try {
        setIsLoadingStatusByDate(true);
        const items = await getStatusCorralsByAdmissionDateService(selectedDate);
        const map: Record<string, { quantity: number; status: boolean; statusRecordId?: number; closeCorral?: boolean, urlVideo:string[] }> = {};
        for (const item of items as StatusCorralByAdmission[]) {
          const key = String(item.idCorrals);
          if (!map[key]) {
            map[key] = { quantity: 0, status: true, statusRecordId: undefined, closeCorral: false, urlVideo: [] };
          }
          map[key].quantity += Number(item.quantity) || 0;
          if (!Boolean(item.status)) {
            map[key].status = false;
          }
          if ((item as any).id) {
            map[key].statusRecordId = (item as any).id;
          }
          if (typeof (item as any).closeCorral === 'boolean') {
            map[key].closeCorral = (item as any).closeCorral;
          }

          if (item.urlVideo) {
            map[key].urlVideo = item.urlVideo
          }
        }

        setStatusByDateMap(map);
      } catch (error) {
        setStatusByDateMap({});
      } finally {
        setIsLoadingStatusByDate(false);
      }
    };

    loadStatusByDate();
  }, [selectedDate]);

  // -----------------------
  // Load brand details by admission date and group
  // -----------------------
  useEffect(() => {
    // Feature flag - set to false to disable brand details loading
    const ENABLE_BRAND_DETAILS = true;

    if (!ENABLE_BRAND_DETAILS) {
      return;
    }

    const loadBrandDetails = async () => {
      try {
        setIsLoadingBrandDetails(true);
        setBrandDetailsMap({});

        if (!currentLineData) {
          return;
        }

        const allBrandDetails = await getBrandDetailsByLineService(selectedDate, currentLineData.id);

        const brandMap: Record<string, BrandDetail[]> = {};

        for (const detail of allBrandDetails) {
          const corralId = String(detail.idCorral);
          if (!brandMap[corralId]) {
            brandMap[corralId] = [];
          }
          brandMap[corralId].push(detail);
        }

        setBrandDetailsMap(brandMap);

      } catch (error) {
        setBrandDetailsMap({});
      } finally {
        setIsLoadingBrandDetails(false);
      }
    };

    if (currentLineData) {
      loadBrandDetails();
    }
  }, [selectedDate, currentLineData]);


  useEffect(() => {
    const loadAllGroups = async () => {
      try {
        setIsLoadingGroups(true);
        const groups = await getAllCorralGroupsService();
        setAllCorralGroups(groups);
      } catch (error) {
        setAllCorralGroups([]);
      } finally {
        setIsLoadingGroups(false);
      }
    };

    loadAllGroups();
  }, []);


  useEffect(() => {
    const loadCorrales = async () => {
      if (!currentLineData || !currentLineData.id) {
        setApiCorrales([]);
        return;
      }

      try {
        setIsLoadingCorrales(true);
        setHasInitiallyLoaded(false);

        if (processFilter === "todos") {
          const currentGroups = getGroupsForCurrentLine();
          if (currentGroups.length > 0) {
            const allGroupIds = currentGroups.map(g => g.id);
            const allCorralesPromises = allGroupIds.map(groupId => getCorralesWithCache(groupId));
            const allCorralesResults = await Promise.allSettled(allCorralesPromises);
            const allCorrales = allCorralesResults
              .filter((result): result is PromiseFulfilledResult<ApiCorral[]> => result.status === 'fulfilled')
              .flatMap(result => result.value);
            setApiCorrales(allCorrales);
          } else {
            setApiCorrales([]);
          }
        } else {
          const targetGroupId = processFilter as number;
          const corrales = await getCorralesWithCache(targetGroupId);
          setApiCorrales(corrales);
        }
      } catch (error) {
        setApiCorrales([]);
      } finally {
        setIsLoadingCorrales(false);
        if (currentLineData && allCorralGroups.length > 0) {
          setHasInitiallyLoaded(true);
        }
      }
    };

    loadCorrales();
  }, [processFilter, currentLineData, allCorralGroups, selectedTab]);

  const getGroupsForCurrentLine = (): CorralGroup[] => {
    if (!currentLineData || allCorralGroups.length === 0) {
      return [];
    }

    if (!currentLineData.id && currentLineData.id !== 0) {
      return [];
    }

    return allCorralGroups.filter(
      (group) => group && group.idLine === currentLineData.id
    );
  };

  const getDefaultGroupIdForLine = (lineaType: LineaType): number | null => {
    switch (lineaType) {
      case "bovinos":
        return 1;
      case "porcinos":
        return 3;
      case "ovinos-caprinos":
        return 5;
      default:
        return null;
    }
  };

  const convertApiCorralToCorral = (
    apiCorral: ApiCorral | null | undefined
  ): Corral | null => {
    if (apiCorral === null || apiCorral === undefined) {
      return null;
    }

    if (typeof apiCorral !== "object") {
      return null;
    }

    if (!apiCorral.hasOwnProperty("id") && !apiCorral.hasOwnProperty("name")) {
      return null;
    }

    try {
      const safeId =
        apiCorral.id !== null && apiCorral.id !== undefined
          ? String(apiCorral.id)
          : `temp-${Date.now()}-${Math.random()}`;
      const safeName =
        apiCorral.name && typeof apiCorral.name === "string"
          ? apiCorral.name
          : `Corral ${safeId}`;
      const safeLimit =
        typeof apiCorral.maximumQuantity === "number" &&
        !isNaN(apiCorral.maximumQuantity)
          ? apiCorral.maximumQuantity
          : 0;
      const safeStatus =
        apiCorral.status === true ? "disponible" : ("ocupado" as CorralStatus);
      const safeIdCorralType =
        typeof apiCorral.idCorralType === "number" && !isNaN(apiCorral.idCorralType)
          ? apiCorral.idCorralType
          : 1;

      const corral: Corral = {
        id: safeId,
        name: safeName,
        limite: safeLimit,
        total: 0,
        disponibles: safeLimit,
        status: safeStatus,
        ocupacion: 0,
        idCorralType: safeIdCorralType,
        dbStatus: apiCorral.status,
      };

      if (!corral.id || !corral.name) {
        return null;
      }

      return corral;
    } catch (error) {
      console.error("Error in convertApiCorralToCorral:", error, apiCorral);
      return null;
    }
  };

  const currentCorrales = useMemo(() => {
    if (!apiCorrales || !Array.isArray(apiCorrales) || apiCorrales.length === 0) {
      return [];
    }

    try {
      const validCorrales = apiCorrales
        .filter((corral) => {
          return corral !== null &&
                 corral !== undefined &&
                 typeof corral === "object" &&
                 corral.hasOwnProperty("id") &&
                 corral.id !== null &&
                 corral.id !== undefined;
        })
        .map((corral) => {
          try {
            return convertApiCorralToCorral(corral);
          } catch (error) {
            return null;
          }
        })
        .filter((corral): corral is Corral => {
          return corral !== null &&
                 corral !== undefined &&
                 typeof corral === "object" &&
                 Boolean(corral.id) &&
                 Boolean(corral.name);
        });

      const byId = new Map<string, Corral>();
      for (const c of validCorrales) {
        if (!byId.has(c.id)) {
          byId.set(c.id, c);
        }
      }
      const decorated = Array.from(byId.values()).map((c) => {
        const overlay = statusByDateMap[c.id];
        if (!overlay) {
          return { ...c, dbStatus: c.dbStatus }; // Keep original status and dbStatus if no overlay
        }
        const limite = typeof c.limite === "number" ? c.limite : 0;
        const total = overlay.quantity;
        const disponibles = Math.max(limite - total, 0);
        const ocupacion = limite > 0 ? Math.min(100, Math.round((total / limite) * 100)) : 0;

        let updatedStatus: CorralStatus;

        if (!overlay.status) {
          updatedStatus = "ocupado";
        } else if (total > 0) {
          updatedStatus = "animales";
        } else {
          updatedStatus = "disponible";
        }

        return {
          ...c,
          total,
          disponibles,
          ocupacion,
          status: updatedStatus,
          dbStatus: overlay.status, // Keep original DB status for button logic
        } as Corral;
      });
      return decorated;
    } catch (error) {
      return [];
    }
  }, [apiCorrales, processFilter, statusByDateMap]);

  const corralesWithLiveStats = useMemo(() => {
    return currentCorrales.map(corral => {
      const brands = brandDetailsMap[corral.id] || [];

      const liveTotal = brands.reduce((sum, brand) => sum + brand.males + brand.females, 0);
      const liveDisponibles = Math.max(corral.limite - liveTotal, 0);
      const liveOcupacionPorcentaje = corral.limite > 0 ? Math.min(100, Math.round((liveTotal / corral.limite) * 100)) : 0;
      let liveStatus: CorralStatus;

      if (corral.dbStatus === false) {
        liveStatus = "ocupado";
      }
      else if (liveTotal > 0) {
        liveStatus = "animales";
      }
      else {
        liveStatus = "disponible";
      }


      return {
        ...corral,
        total: liveTotal,
        disponibles: liveDisponibles,
        ocupacion: liveTotal,
        ocupacionPorcentaje: liveOcupacionPorcentaje,
        status: liveStatus,
        originalTotal: corral.total,
        originalDisponibles: corral.disponibles,
        originalOcupacion: corral.ocupacion,
      };
    });
  }, [currentCorrales, brandDetailsMap]);

  // -----------------------
  // Video upload dialog state
  // -----------------------

  const [videoDialogOpen, setVideoDialogOpen] = useState(false);
  const [videoTargetCorralId, setVideoTargetCorralId] = useState<string | null>(
    null
  );
  const [videoTargetScope, setVideoTargetScope] = useState<
    "linea" | "especial"
  >("linea");
  const [pendingVideos, setPendingVideos] = useState<(VideoItem & { file?: File })[]>([]);
  const [corralVideos, setCorralVideos] = useState<Record<string, VideoItem[]>>(
    {}
  );

  const resetPendingVideos = () => {
    // Revoke any object URLs to avoid leaks
    pendingVideos.forEach((v) => URL.revokeObjectURL(v.url));
    setPendingVideos([]);
  };

  const openVideoDialogForLinea = (corralId: string) => {
    setVideoDialogOpen(true);
    setVideoTargetCorralId(corralId);
    setVideoTargetScope("linea");
    resetPendingVideos();

    const videoUrls  = statusByDateMap[corralId]?.urlVideo || [];

    Promise.all(videoUrls.map(url => readVideoFileMetadata(url))).then(videos => {
      setPendingVideos(videos)
      setCorralVideos((prev) => ({ ...prev, [corralId]: videos }));
    });
  };

  const handleModalOpenCloseState = (isOpen: boolean)=>{
    setVideoDialogOpen(isOpen);
    if (!isOpen) resetPendingVideos();
  }

  const handleAddFiles = async (files: FileList ) => {
    const readVideos = await readMultipleVideoFiles(files)
    setPendingVideos((prev) => [...prev, ...readVideos]);
  };

  const handleRemoveVideo = async (video: VideoItem) => {

    if (!videoTargetCorralId) return toast.error("Corral no seleccionado");


    const statusCorral = statusByDateMap[videoTargetCorralId]

    try {
      const toastLoading = toast.loading("Eliminando video..." );
      const statusCorralId = statusCorral?.statusRecordId || 0;
      if (video.url.startsWith("http")) await removeStatusCorralVideoById(statusCorralId, video.url);
      const updatedVideos = pendingVideos.filter(v => v.url !== video.url);

      setPendingVideos(updatedVideos);
      setCorralVideos((prev) => ({ ...prev, [videoTargetCorralId]: updatedVideos }));

      statusCorral.urlVideo = updatedVideos.map(v => v.url);
      setStatusByDateMap((prev) =>({ ...prev, [videoTargetCorralId]: statusCorral}));
      toast.dismiss(toastLoading);
      toast.success("Video eliminado exitosamente");
    } catch (error) {
      toast.error("Error al eliminar el video, por favor intente de nuevo");
    }
  };



  const saveVideosForCorral = async () => {
    if (!videoTargetCorralId) return;
    const toSave = pendingVideos.filter((v) => v.valid.isValid).slice(0, 2);

    if (toSave.length === 0) return toast.error("No hay videos válidos para guardar");
    if ((corralVideos[videoTargetCorralId] || []).length >= 2) return toast.error("Ya existen 2 videos guardados para este corral");

    try {
      const toastLoading = toast.loading("Guardando videos..." );

      const specieLine = currentLineData?.name || "";
      const statusCorral = statusByDateMap[videoTargetCorralId];
      const statusCorralId = statusCorral?.statusRecordId || 0;

      const videoToUpload1 = toSave?.at(0);
      const videoToUpload2 = toSave?.at(1);

      let publicVideoUrls: string[] = [];

      if (videoToUpload1?.file && videoToUpload1.url.startsWith("blob:")) {
        publicVideoUrls = (await saveStatusCorralVideoById(statusCorralId, specieLine, videoToUpload1.file)).data.urlVideo!
      }

      if (videoToUpload2?.file && videoToUpload2.url.startsWith("blob:")) {
        publicVideoUrls = (await saveStatusCorralVideoById(statusCorralId, specieLine, videoToUpload2.file)).data.urlVideo!;
      }

      toast.dismiss(toastLoading);


      if (publicVideoUrls.length === 0) return;

      const metadata = await Promise.all(publicVideoUrls.map(url => readVideoFileMetadata(url)));

      toast.success("Videos guardados exitosamente", { duration: 3000 });

      setCorralVideos((prev) => ({ ...prev, [videoTargetCorralId]: metadata }));
      resetPendingVideos();
      setPendingVideos(metadata);
      statusCorral.urlVideo = metadata.map(v => v.url);
      setStatusByDateMap((prev) =>({ ...prev, [videoTargetCorralId]: statusCorral}));
      if(metadata.length >= 2 ) setVideoDialogOpen(false);
    } catch (error) {
      toast.error("Error al guardar los videos, por favor intente de nuevo");
    }
  };

  const totalCorrales = corralesWithLiveStats?.length || 0;

  // Función para manejar el cambio de línea y resetear el filtro
  const handleTabChange = (value: LineaType) => {
    setSelectedTab(value);
    setProcessFilter("todos"); // Reset filter to show all corrals
  };

  // Status counts using live statistics
  const statusCounts = useMemo(() => {
    if (!Array.isArray(corralesWithLiveStats)) {
      return { disponibles: 0, ocupados: 0, animales: 0 };
    }

    // Contar corrales disponibles (sin animales y no ocupados)
    const disponibles = corralesWithLiveStats.filter(c =>
      c?.status === 'disponible' && c?.total === 0
    ).length;

    // Contar corrales con animales
    const animales = corralesWithLiveStats.filter(c =>
      c?.total > 0
    ).length;

    // Contar corrales ocupados (solo si tienen marcas asignadas)
    const ocupados = corralesWithLiveStats.filter(c => {
      const tieneMarcas = c?.total > 0;
      const marcadoComoOcupado = c?.status === 'ocupado';
      return tieneMarcas || marcadoComoOcupado;
    }).length;

    return { disponibles, ocupados, animales };
  }, [corralesWithLiveStats]);

  const { disponibles, ocupados, animales } = statusCounts;

  // Memoized filtered corrales using live statistics
  const filteredCorrales = useMemo(() => {
    if (!Array.isArray(corralesWithLiveStats)) {
      return [];
    }

    // Since the API now loads corrales based on the processFilter (group ID),
    // we don't need additional filtering here - just return all loaded corrales
    const filtered = corralesWithLiveStats;

    // Remove duplicates based on ID
    const uniqueCorrales = filtered.reduce((acc: Corral[], current) => {
      const existingIndex = acc.findIndex((corral) => corral.id === current.id);
      if (existingIndex === -1) {
        acc.push(current);
      }
      return acc;
    }, []);

    return uniqueCorrales;
  }, [corralesWithLiveStats]);

  // -----------------------
  // Sorting controls and sorted list
  // -----------------------
  const [sortBy, setSortBy] = useState<"disponibles" | "ocupacion" | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const toggleSort = (field: "disponibles" | "ocupacion") => {
    setSortBy((prev) => {
      if (prev === field) {
        // toggle direction when clicking same field
        setSortDir((d) => (d === "asc" ? "desc" : "asc"));
        return prev;
      }
      // switch field, reset direction to desc by default
      setSortDir("desc");
      return field;
    });
  };

  const sortedCorrales = useMemo(() => {
    const base = Array.isArray(filteredCorrales) ? [...filteredCorrales] : [];
    if (!sortBy) return base;
    base.sort((a, b) => {
      const va = (a as any)[sortBy] ?? 0;
      const vb = (b as any)[sortBy] ?? 0;
      const cmp = va === vb ? 0 : va < vb ? -1 : 1;
      return sortDir === "asc" ? cmp : -cmp;
    });
    return base;
  }, [filteredCorrales, sortBy, sortDir]);

  function getLineaTitle(linea: LineaType) {
    // Use real data from API if available, otherwise fallback to static titles
    if (currentLineData && !isLoadingLine) {
      return `CORRALES DE LA ${currentLineData.name.toUpperCase()} DE ${
        currentLineData.specie.name
      }`;
    }

    // Fallback to static titles while loading or if API fails
    switch (linea) {
      case "bovinos":
        return "CORRALES DE LA LÍNEA 1 DE BOVINOS";
      case "porcinos":
        return "CORRALES DE LA LÍNEA 2 DE PORCINOS";
      case "ovinos-caprinos":
        return "CORRALES DE LA LÍNEA 3 DE OVINOS-CAPRINOS";
    }
  }

  // Helper function to get brand details for a corral
  function getBrandDetailsForCorral(corralId: string): BrandDetail[] {
    return brandDetailsMap[corralId] || [];
  }

  // Helper function to determine if corral should appear "closed/blocked" in UI
  function isCorralBlocked(corral: Corral): boolean {
    // A corral is visually "blocked" only when the API record indicates closeCorral === true
    const status = statusByDateMap[corral.id];
    return !!(status && status.closeCorral === true);
  }

  // Animated Number Component for smooth transitions
  const AnimatedNumber = ({ value, duration = 300 }: { value: number; duration?: number }) => {
    const [displayValue, setDisplayValue] = useState(value);
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
      if (displayValue !== value) {
        setIsAnimating(true);
        const startValue = displayValue;
        const difference = value - startValue;
        const startTime = Date.now();

        const animate = () => {
          const now = Date.now();
          const progress = Math.min((now - startTime) / duration, 1);

          // Easing function for smooth animation
          const easeInOutCubic = (t: number) => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
          const easedProgress = easeInOutCubic(progress);

          const currentValue = Math.round(startValue + (difference * easedProgress));
          setDisplayValue(currentValue);

          if (progress < 1) {
            requestAnimationFrame(animate);
          } else {
            setIsAnimating(false);
          }
        };

        requestAnimationFrame(animate);
      }
    }, [value, displayValue, duration]);

    return (
      <span className={`inline-block transition-all duration-200 ${isAnimating ? 'scale-110 font-bold text-blue-600' : ''}`}>
        {displayValue}
      </span>
    );
  };

  // Brand Component - Click to Transfer
  const BrandCard = ({ brand, corralId, brandIndex, isBlocked = false }: { brand: BrandDetail; corralId: string; brandIndex: number; isBlocked?: boolean }) => {
    const totalAnimals = brand.males + brand.females;
    const malePercentage = totalAnimals > 0 ? (brand.males / totalAnimals) * 100 : 50;
    const codeText = typeof brand.codes === 'string' && brand.codes.trim().length > 0 ? brand.codes.trim() : null;

    return (
      <div
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (isBlocked) {
            return;
          }
          if (!isTransferring) {
            handleMobileBrandClick(brand, corralId);
          }
        }}
        className={`group relative flex flex-col h-full overflow-hidden rounded-xl border-2 transform transition-all duration-200 shadow-md hover:shadow-lg border-gray-200 bg-white hover:border-blue-200 active:border-blue-400 active:shadow-xl ${isBlocked ? 'cursor-not-allowed' : 'cursor-pointer'}`}
        aria-disabled={isBlocked}
      >
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="h-full w-full bg-gradient-to-br from-blue-400 to-pink-400"></div>
        </div>

        {/* Content */}
        <div className="relative flex-1 p-4 flex flex-col">
          {/* Header with brand name, total count and codes or tap hint inline */}
          <div className="mb-3">
            <h3 className="font-bold text-gray-900 text-sm truncate group-hover:text-blue-900 transition-colors">
              {brand.nameBrand}
            </h3>
            <div className="flex items-center gap-2 mt-1 min-h-[18px]">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="text-xs text-gray-500 font-medium">{totalAnimals} animales</span>
              </div>
              {codeText ? (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="max-w-[160px] truncate inline-flex items-center gap-1 text-[9px] font-medium text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-md px-2 py-0.5 shadow-sm">
                        {/* <Hash className="h-6 w-6" />  */}
                        <span>{codeText}</span>
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <span className="font-medium">{codeText}</span>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-[8px] font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-md px-2 py-0.5 shadow-sm">
                  <MousePointerClick className="h-4 w-4" />
                  <span>{isMobile ? 'Click para mover' : 'Toca para mover'}</span>
                </span>
              )}
            </div>
          </div>

          {/* Gender breakdown with visual bars */}
          <div className="mt-auto pt-2 space-y-2">
            {/* Males */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 shadow-sm"></div>
                <span className="text-xs font-medium text-gray-600">Machos</span>
              </div>
              <span className="text-sm font-bold text-blue-600">{brand.males}</span>
            </div>

            {/* Females */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gradient-to-r from-pink-500 to-pink-600 shadow-sm"></div>
                <span className="text-xs font-medium text-gray-600">Hembras</span>
              </div>
              <span className="text-sm font-bold text-pink-600">{brand.females}</span>
            </div>

            {/* Visual progress bar */}
            <div className="mt-3">
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                <div className="h-full flex">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-blue-400 transition-all duration-300"
                    style={{ width: `${malePercentage}%` }}
                  ></div>
                  <div
                    className="bg-gradient-to-r from-pink-500 to-pink-400 transition-all duration-300"
                    style={{ width: `${100 - malePercentage}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Hover effect overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
      </div>
    );
  };

  return (
    <div
      className="w-full p-3 md:p-6 relative"
    >
      {/* Floating loading indicator when switching line or fetching data */}
      {(isLoadingLine || isLoadingCorrales || isLoadingCounts || isLoadingStatusByDate || isLoadingBrandDetails || isLoadingProductiveStages) && (
        <div className="absolute top-3 right-4 z-50 flex items-center gap-2 bg-white/80 backdrop-blur border border-gray-200 rounded-md px-3 py-1.5 shadow-sm">
          <Loader2 className="h-4 w-4 animate-spin text-teal-600" />
          <span className="text-xs text-gray-700">Cargando datos…</span>
        </div>
      )}

      <div className={`space-y-4 md:space-y-6 transition-opacity duration-300 ${ (isLoadingLine || isLoadingCorrales || isLoadingCounts || isLoadingStatusByDate || isLoadingBrandDetails || isLoadingProductiveStages) ? 'opacity-60' : 'opacity-100' }`}>
        {/* Header (tabs + date) - Responsive */}
        <LineTabsDate
          selectedTab={selectedTab}
          onTabChange={(value) => {
            setSelectedTab(value);
            setProcessFilter("todos");
          }}
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
        />

        {/* Title and Stats - Responsive */}
        <TitleStats
          title={getLineaTitle(selectedTab)}
          totals={{ corrales: totalCorrales, disponibles, ocupados, animales }}
          admissionDate={selectedDate}
          idLine={currentLineData?.id}
        />

        {/* Legend */}
        <LegendCard />

        <Card>
          <CardContent className="p-6 md:p-8">
            <ProcessFilterTabs
              selectedTab={selectedTab}
              processFilter={processFilter}
              onChange={(v) => setProcessFilter(v)}
              counts={realFilterCounts}
              lineGroups={getGroupsForCurrentLine()}
              isLoadingGroups={isLoadingGroups}
            />

            {/* Filter Tabs */}
            <div className="flex justify-between items-center mt-5">
              {/* {selectedTab === "ovinos-caprinos" && processFilter === 5 ? (
                <h2 className="text-xl font-semibold -mt-2 ml-3 mb-3">
                  CORRALES GENERALES
                </h2>
              ) : selectedTab === "ovinos-caprinos" && processFilter === 8 ? (
                <h2 className="text-xl font-semibold -mt-2 ml-3 mb-3">
                  CORRALES ESPECIALES
                </h2>
              ) : selectedTab === "ovinos-caprinos" && processFilter === "todos" ? (
                <h2 className="text-xl font-semibold -mt-2 ml-3 mb-3">
                  TODOS LOS CORRALES
                </h2>
              ) : (
                <div></div>
              )} */}
              <div></div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleSort("disponibles")}
                  className={`h-8 text-xs flex items-center gap-1 transition-all duration-300 shadow-sm hover:shadow-md rounded-lg ${
                    sortBy === "disponibles"
                      ? "text-teal-600 border-teal-300 bg-gradient-to-r from-teal-50 to-teal-100 font-medium"
                      : "text-muted-foreground border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
                  }`}
                  title="Ordenar por disponibles"
                >
                  <ArrowDownUp className="h-3 w-3" />
                  <span>Por disponibles</span>
                  {sortBy === "disponibles" && (
                    <ChevronDown className={`h-3 w-3 transition-transform ${sortDir === "asc" ? "-rotate-180" : ""}`} />
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleSort("ocupacion")}
                  className={`h-8 text-xs flex items-center gap-1 transition-all duration-300 shadow-sm hover:shadow-md rounded-lg ${
                    sortBy === "ocupacion"
                      ? "text-orange-600 border-orange-300 bg-gradient-to-r from-orange-50 to-orange-100 font-medium"
                      : "text-muted-foreground border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
                  }`}
                  title="Ordenar por ocupación"
                >
                  <ChartColumn className="h-3 w-3" />
                  <span>Por ocupación</span>
                  {sortBy === "ocupacion" && (
                    <ChevronDown className={`h-3 w-3 transition-transform ${sortDir === "asc" ? "-rotate-180" : ""}`} />
                  )}
                </Button>
              </div>
            </div>

            {/* Corrales Grid */}
            <div className="mt-5">
              {(isLoadingLine || isLoadingCorrales) ? (
                <CorralesLoadingGrid />
              ) : Array.isArray(filteredCorrales) && filteredCorrales.length > 0 ? (
                <>
                  {/* Mobile/Tablet: Grid */}
                  <div className="lg:hidden">
                    {/* All corrales in a single grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {sortedCorrales.map((corral, index) => {
                        if (!corral || typeof corral !== "object" || !corral.id || !corral.name) {
                          return null;
                        }

                        const isClosed = isCorralBlocked(corral);
                        const uniqueKey = `${corral.id}-${index}-${selectedTab}-${processFilter}`;

                        return (
                          <Card
                            key={uniqueKey}
                            className={`relative border-3 border-gray-800 rounded-lg ${
                              isClosed ? "bg-gray-50 border-gray-800/60" : "bg-white"
                            }`}
                          >
                            <CardHeader className="pb-3 pt-2 px-4">
                              <div className="flex justify-between items-start">
                                <h3 className="font-semibold">{corral.name}</h3>
                                <div className="flex items-center gap-2">
                                  {isClosed ? (
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <span className="text-[11px] uppercase tracking-wide text-gray-500 inline-flex items-center gap-1 cursor-help">
                                            <Lock className="h-3 w-3" /> CERRADO
                                          </span>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <span>Corral cerrado</span>
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  ) : null}
                                  <div
                                    className={`w-2 h-2 rounded-full ${getOccupationColor(
                                      corral.ocupacion
                                    )}`}
                                  />
                                </div>
                              </div>
                              <div className="text-sm text-muted-foreground mt-1">
                                Límite {corral.limite} · Total {corral.total} ·
                                Disponibles {corral.disponibles}
                              </div>
                              <div className="mt-1 h-[2px] bg-gray-200 shadow-[0_1px_0_0_rgba(0,0,0,0.04)]" />
                            </CardHeader>

                            <CardContent className="pt-0 px-4 pb-0">
                              <div className="relative border-2 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 shadow-inner p-5 -mt-6 min-h-[280px] overflow-hidden transition-all duration-300 border-gray-200">
                                <div className="h-[6px] w-full bg-gray-100 border-b border-gray-200 rounded-t-sm mb-2" />
                                {(() => {
                                  const brands = getBrandDetailsForCorral(corral.id);
                                  if (brands.length === 0) {
                                    return (
                                      <div className="flex flex-col items-center justify-center py-4 text-muted-foreground">
                                        <img src="/images/corrals-color.png" alt="Corrales" className="h-50 w-50 mb-1 object-contain -mt-4" />
                                        <span className="text-sm italic text-gray-500">
                                          Sin animales asignados
                                        </span>
                                      </div>
                                    );
                                  }
                                  return (
                                    <div className="h-44 md:h-56 lg:h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400">
                                      <div className="grid gap-3 py-2 pr-1">
                                        {brands.map((brand, brandIndex) => (
                                          <BrandCard
                                            key={`${brand.idBrand}-${brandIndex}`}
                                            brand={brand}
                                            corralId={corral.id}
                                            brandIndex={brandIndex}
                                            isBlocked={isClosed}
                                          />
                                        ))}
                                      </div>
                                    </div>
                                  );
                                })()}
                              </div>

                              <div className="flex gap-3 mt-2 h-12 items-center">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className={`text-teal-600 border-teal-200 bg-gradient-to-r from-white to-teal-50 flex-1 rounded-lg h-10 text-sm min-w-0 transition-all duration-300 flex items-center justify-center ${( !statusByDateMap[corral.id]) ? 'opacity-80 cursor-not-allowed' : 'shadow-sm hover:shadow-md hover:from-teal-50 hover:to-teal-100 hover:border-teal-300'}`}
                                  onClick={() =>  openVideoDialogForLinea(corral.id)}
                                  disabled={ !canUploadVideoForCorral(corral.id)}
                                >
                                  <Video className="h-4 w-4 mr-1 flex-shrink-0" />
                                  <span className="truncate font-medium">Video</span>
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className={`flex-1 rounded-lg h-10 text-sm min-w-0 transition-all duration-300 flex items-center justify-center ${
                                    corral.dbStatus === true
                                      ? "text-red-600 border-red-200 bg-gradient-to-r from-white to-red-50"
                                      : "text-green-600 border-green-200 bg-gradient-to-r from-white to-green-50"
                                  } ${isClosed ? 'opacity-80 cursor-not-allowed' : 'shadow-sm hover:shadow-md hover:from-red-50 hover:to-red-100 hover:border-red-300'}`}
                                  onClick={() => {
                                    if (isClosed) return;
                                    if (corral && corral.id) {
                                      openCorralDialog(corral.id);
                                    }
                                  }}
                                  disabled={isClosed}
                                >
                                  {corral.dbStatus === true ? (
                                    <Lock className="h-4 w-4 mr-1 flex-shrink-0" />
                                  ) : (
                                    <LockOpen className="h-4 w-4 mr-1 flex-shrink-0" />
                                  )}
                                  <span className="truncate font-medium">{isClosed ? 'Cerrado' : (corral.dbStatus === true ? 'Cerrar' : 'Abrir')}</span>
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      }).filter(Boolean)}
                    </div>
                  </div>

                  {/* Desktop: Normal grid */}
                  <div className="hidden lg:grid lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6 w-full max-w-[100%] px-2 mx-auto">
                    {sortedCorrales.map((corral, index) => {
                    // Additional safety check for each corral
                    if (
                      !corral ||
                      typeof corral !== "object" ||
                      !corral.id ||
                      !corral.name
                    ) {
                      return null;
                    }

                    const isClosed = isCorralBlocked(corral);
                    // Create a unique key combining ID with index to ensure uniqueness
                    const uniqueKey = `${corral.id}-${index}-${selectedTab}-${processFilter}`;

                    return (
                      <Card
                        key={uniqueKey}
                        className={`relative border-3 border-gray-800 rounded-lg ${
                          isClosed ? "bg-gray-50 border-gray-800/60" : "bg-white"
                        }`}
                      >
                        <CardHeader className="pb-3 pt-2 px-4">
                          <div className="flex justify-between items-start">
                            <h3 className="font-semibold">{corral.name}</h3>
                            <div className="flex items-center gap-2">
                              {isClosed ? (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <span className="text-[11px] uppercase tracking-wide text-gray-500 inline-flex items-center gap-1 cursor-help">
                                        <Lock className="h-3 w-3" /> CERRADO
                                      </span>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <span>Corral cerrado</span>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              ) : null}
                              <div
                                className={`w-2 h-2 rounded-full ${getOccupationColor(
                                  corral.ocupacion
                                )}`}
                              />
                            </div>
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">
                            Límite {corral.limite} · Total {corral.total} ·
                            Disponibles {corral.disponibles}
                          </div>
                          {/* subtle divider like screenshot */}
                          <div className="mt-1 h-[2px] bg-gray-200 shadow-[0_1px_0_0_rgba(0,0,0,0.04)]" />
                        </CardHeader>

                        <CardContent className="pt-0 px-4 pb-0">
                          <div className="relative border-2 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 shadow-inner p-3 -mt-6 min-h-[280px] overflow-hidden transition-all duration-300 border-gray-200 w-full max-w-full">
                            <div className="h-[6px] w-full bg-gray-100 border-b border-gray-200 rounded-t-sm mb-2" />
                            {(() => {
                              const brands = getBrandDetailsForCorral(corral.id);

                              if (brands.length === 0) {
                                // Show empty state
                                return (
                                  <div className="flex flex-col items-center justify-center py-4 text-muted-foreground">
                                    <img src="/images/corrals-color.png" alt="Corrales" className="h-50 w-50 mb-1 object-contain -mt-4" />
                                    <span className="text-sm italic text-gray-500">
                                      Sin animales asignados
                                    </span>
                                  </div>
                                );
                              }

                                // Show brand information
                                return (
                                  <div className="h-44 md:h-56 lg:h-64 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400 w-full">
                                    <div className="space-y-3 py-2 pr-1">
                                      {brands.map((brand, brandIndex) => (
                                        <BrandCard
                                          key={`${brand.idBrand}-${brandIndex}`}
                                          brand={brand}
                                          corralId={corral.id}
                                          brandIndex={brandIndex}
                                          isBlocked={isClosed}
                                        />
                                      ))}
                                    </div>
                                  </div>
                                );
                              })()}
                            </div>
                            <div className="flex gap-3 mt-2 h-12 items-center">

                              <Button
                                variant="outline"
                                size="sm"
                                className="text-teal-600 border-teal-200 bg-gradient-to-r from-white to-teal-50 hover:from-teal-50 hover:to-teal-100 hover:border-teal-300 flex-1 rounded-lg h-10 text-sm min-w-0 transition-all duration-300 shadow-sm hover:shadow-md"
                                onClick={() => openVideoDialogForLinea(corral.id)}
                                disabled={!canUploadVideoForCorral(corral.id)}
                              >
                                <Video className="h-4 w-4 mr-1 flex-shrink-0" />
                                <span className="truncate font-medium">Video</span>
                              </Button>

                            {isClosed ? (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div className="flex-1">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className={`w-full flex-1 rounded-lg h-10 text-sm min-w-0 transition-all duration-300 opacity-80 cursor-not-allowed ${
                                          corral.dbStatus === true
                                            ? "text-red-600 border-red-200 bg-gradient-to-r from-white to-red-50"
                                            : "text-green-600 border-green-200 bg-gradient-to-r from-white to-green-50"
                                        }`}
                                        disabled
                                      >
                                        {corral.dbStatus === true ? (
                                          <Lock className="h-4 w-4 mr-1 flex-shrink-0" />
                                        ) : (
                                          <LockOpen className="h-4 w-4 mr-1 flex-shrink-0" />
                                        )}
                                        <span className="truncate font-medium">Cerrado</span>
                                      </Button>
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <span>Corral cerrado</span>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                className={`flex-1 rounded-lg h-10 text-sm min-w-0 transition-all duration-300 shadow-sm hover:shadow-md ${
                                  corral.dbStatus === true
                                    ? "text-red-600 border-red-200 bg-gradient-to-r from-white to-red-50 hover:from-red-50 hover:to-red-100 hover:border-red-300"
                                    : "text-green-600 border-green-200 bg-gradient-to-r from-white to-green-50 hover:from-green-50 hover:to-green-100 hover:border-green-300"
                                }`}
                                onClick={() => {
                                  if (corral && corral.id) {
                                    openCorralDialog(corral.id);
                                  }
                                }}
                              >
                                {corral.dbStatus === true ? (
                                  <Lock className="h-4 w-4 mr-1 flex-shrink-0" />
                                ) : (
                                  <LockOpen className="h-4 w-4 mr-1 flex-shrink-0" />
                                )}
                                <span className="truncate font-medium">
                                  {corral.dbStatus === true ? "Cerrar" : "Abrir"}
                                </span>
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  }).filter(Boolean) // Remove any null entries
                  }
                  </div>
                </>
              ) : (
                // Fallback when no corrales or loading
                <div className="col-span-full">
                  {(isLoadingCorrales || isLoadingLine || isLoadingGroups) ? (
                    <CorralesLoadingGrid />
                  ) : hasInitiallyLoaded && currentLineData && allCorralGroups.length > 0 ? (
                    <div className="text-center py-12">
                      <div className="text-gray-500">No hay corrales disponibles</div>
                    </div>
                  ) : (
                    <CorralesLoadingGrid />
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>



        {/* Confirm Dialog for Abrir/Cerrar Corral */}
        <ConfirmToggleDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          action={dialogAction}
          name={(() => {
            if (targetScope === "linea") {
              const corral = currentCorrales.find(
                (c) => c.id === targetCorralId
              );
              return corral?.name || "";
            }
            return targetCorralId || "";
          })()}
          onConfirm={confirmCorralToggle}
        />
        {/* Video Upload Dialog */}
        <VideoUploadDialog
          open={videoDialogOpen}
          onOpenChange={handleModalOpenCloseState}
          title={`Subir Videos - ${videoTargetCorralId ?? ""}`}
          videoList={pendingVideos}
          onAddVideos={handleAddFiles}
          onRemove={handleRemoveVideo}
          onSave={saveVideosForCorral}
          canDeleteItems={statusByDateMap[videoTargetCorralId ?? '']?.closeCorral === false && `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}` === currentDate}
          canSaveItems={(statusByDateMap[videoTargetCorralId ?? '']?.closeCorral === false && !pendingVideos.some((v) => !v.valid.isValid)) && `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}` === currentDate}
        />
      </div>

      {/* Modal Components */}
      <TransferModal
        transferModal={mobileTransferModal}
        setTransferModal={setMobileTransferModal}
        corrales={corralesWithLiveStats}
        productiveStages={productiveStages}
        onTransfer={handleMobileTransfer}
        onReset={resetMobileTransferModal}
        isTransferring={isTransferring}
      />

      <ConfirmationModal
        confirmationModal={confirmationModal}
        onConfirm={executeTransfer}
        onReset={resetConfirmationModal}
        isTransferring={isTransferring}
      />
    </div>
  );
}
