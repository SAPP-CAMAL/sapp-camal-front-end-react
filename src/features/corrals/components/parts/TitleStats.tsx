"use client";
import { useEffect, useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Hash, QrCode, Loader2 } from "lucide-react";
import { getTotalAnimalsByLineService, generateSpecieCodesService, getBrandDetailsByLineService } from "@/features/corrals/server/db/corrals.service";
import { toast } from "sonner";
import { BrandDetail, CommonHttpResponse } from "@/features/corrals/domain";
// No skeleton: we'll use a custom animated three-dots loader inside the badge

interface Props {
  title: string;
  totals: { corrales: number; disponibles: number; ocupados: number; animales: number };
  admissionDate?: Date;
  idLine?: number;
}

export function TitleStats({ title, totals, admissionDate, idLine }: Props) {
  const [remoteAnimals, setRemoteAnimals] = useState<number | null>(null);
  const [loadingAnimals, setLoadingAnimals] = useState(false);
  const [generatingCodes, setGeneratingCodes] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [brandDetails, setBrandDetails] = useState<BrandDetail[]>([]);

  // Check if the selected date is today
  const isToday = admissionDate ? new Date(admissionDate).toDateString() === new Date().toDateString() : false;

  // Check if any brand has codes already assigned for corralType 1
  const hasExistingCodes = useMemo(() => {
    return brandDetails.some(brand => {
      const isCorralType1 = brand.idCorralType === 1;
      const hasCode = brand.codes !== null && brand.codes !== undefined && brand.codes.trim() !== '';
      return isCorralType1 && hasCode;
    });
  }, [brandDetails]);

  useEffect(() => {
    const loadBrandDetails = async () => {
      if (!idLine || !admissionDate) {
        setBrandDetails([]);
        return;
      }

      try {
        const response = await getBrandDetailsByLineService(admissionDate, idLine) as CommonHttpResponse<BrandDetail[]> | BrandDetail[];
        // Handle both direct array response and CommonHttpResponse format
        const details = Array.isArray(response) ? response : (response?.data || []);
        setBrandDetails(details);
      } catch (error) {
        console.error('Error loading brand details:', error);
        toast.error('Error al cargar los detalles de códigos');
        setBrandDetails([]);
      }
    };

    loadBrandDetails();
  }, [idLine, admissionDate]);

  const handleGenerateCodes = async () => {
    setShowConfirmDialog(true);
  };

  const confirmGenerateCodes = async () => {
    if (!idLine) {
      toast.error('No se pudo determinar la línea actual');
      return;
    }

    setShowConfirmDialog(false);
    setGeneratingCodes(true);

    try {
      const result = await generateSpecieCodesService(idLine);
      if (result.success) {
        toast.success(result.message);
        // Mark that we're about to reload
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('corrals-just-reloaded', 'true');
        }
        // Force a hard reload to clear all caches and show updated codes
        setTimeout(() => {
          window.location.href = window.location.href;
        }, 500);
      } else {
        toast.error(result.message);
        setGeneratingCodes(false);
      }
    } catch (error) {
      console.error('Error generating codes:', error);
      toast.error('Error al generar los códigos. Por favor, intente nuevamente.');
      setGeneratingCodes(false);
    }
  };

  const cancelGenerateCodes = () => {
    setShowConfirmDialog(false);
  };

  useEffect(() => {
    const fetchAnimals = async () => {
      if (!idLine || !admissionDate) {
        setRemoteAnimals(null);
        return;
      }
      try {
        setLoadingAnimals(true);
        const value = await getTotalAnimalsByLineService(idLine, admissionDate);
        setRemoteAnimals(typeof value === "number" ? value : 0);
      } catch (e) {
        setRemoteAnimals(null);
      } finally {
        setLoadingAnimals(false);
      }
    };

    fetchAnimals();
  }, [idLine, admissionDate]);

  const animalsToShow = typeof remoteAnimals === "number" ? remoteAnimals : totals.animales;
  return (
    <>
      {/* Mobile and Tablet layout */}
      <div className="lg:hidden bg-gray-100 px-4 py-4 rounded-lg space-y-4">
        {/* Title and corrales count */}
        <div className="text-center flex justify-center items-center">
          <h1 className="text-lg sm:text-xl font-bold mb-0 pb-0">{title}</h1>
          <span className="text-gray-600 text-sm sm:text-base mt-10">{totals.corrales} corrales</span>
        </div>

        {/* Badges */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          <Badge className="bg-primary text-white px-2 sm:px-4 py-2 rounded-full text-center text-xs sm:text-sm">
            Disponibles: {totals.disponibles}
          </Badge>
          <Badge className="bg-red-500 text-white px-2 sm:px-4 py-2 rounded-full text-center text-xs sm:text-sm">
            Ocupados: {totals.ocupados}
          </Badge>
          <Badge className="bg-blue-500 text-white px-2 sm:px-4 py-2 rounded-full text-center text-xs sm:text-sm">
            Animales:
            {loadingAnimals ? (
              <span className="inline-flex items-center ml-1 align-middle">
                <span className="inline-block h-3 w-3 border-2 border-white/90 border-t-transparent rounded-full animate-spin" />
              </span>
            ) : (
              <span className="ml-1">{animalsToShow}</span>
            )}
          </Badge>
        </div>

        {/* Percentages */}
        <div className="flex justify-between text-sm text-gray-600 pt-2 border-t border-gray-200">
          <span>{Math.round((totals.disponibles / totals.corrales) * 100)}% Disponibles</span>
          <span>{Math.round((totals.ocupados / totals.corrales) * 100)}% Ocupados</span>
        </div>

        {/* Generate codes button */}
        <div className="pt-2">
          <div className="relative group w-full">
            <Button
              variant="outline"
              size="sm"
              className="w-full text-teal-600 border-teal-600 bg-white hover:bg-teal-50 hover:text-teal-600 disabled:opacity-75 disabled:cursor-not-allowed data-[disabled]:text-gray-400 data-[disabled]:border-gray-300 data-[disabled]:hover:bg-white"
              onClick={handleGenerateCodes}
              disabled={generatingCodes || !isToday || hasExistingCodes}
              title={
                !isToday
                  ? 'Solo disponible para la fecha actual'
                  : hasExistingCodes
                    ? 'Ya existen códigos generados para esta fecha'
                    : 'Generar códigos para animales de corral'
              }
            >
              {generatingCodes ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generando...
                </>
              ) : (
                <>
                  <Hash className="h-4 w-4 mr-1" />
                  Generar códigos
                </>
              )}
            </Button>
            <div className={`absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white rounded whitespace-nowrap ${
              isToday && !hasExistingCodes ? 'bg-teal-600' : 'bg-gray-400'
            } opacity-0 group-hover:opacity-100 transition-opacity`}>
              {hasExistingCodes
                ? 'Ya existen códigos generados para esta fecha'
                : isToday
                  ? 'Genera códigos para animales de corral'
                  : 'Solo disponible para la fecha actual'}
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Generar Códigos</DialogTitle>
            <DialogDescription>
              ¿Está seguro de generar los códigos? Esta acción cerrará todos los corrales.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full">
            <div className="grid w-full sm:w-auto grid-cols-2 gap-2 sm:flex sm:flex-1 sm:justify-end">
              <Button
                variant="outline"
                size="sm"
                className="w-full sm:w-auto"
                onClick={cancelGenerateCodes}
                disabled={generatingCodes}
              >
                Cancelar
              </Button>
              <Button
                size="sm"
                onClick={confirmGenerateCodes}
                className="w-full sm:w-auto bg-teal-600 hover:bg-teal-700 text-white"
                disabled={generatingCodes}
              >
                {generatingCodes ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generando...
                  </>
                ) : 'Generar Códigos'}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Desktop layout */}
      <div className="hidden lg:block bg-gray-100 px-6 py-4 rounded-lg">
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
          {/* Top row: Title and corrales count */}
          <div className="flex items-center gap-4 min-w-0 flex-1">
            <h1 className="text-2xl font-bold truncate mb-0 pb-0">{title}</h1>
            <span className="text-gray-600 whitespace-nowrap">{totals.corrales} corrales</span>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-start xl:items-center">
            <div className="relative group">
              <Button
                variant="outline"
                size="sm"
                className="text-teal-600 border-teal-600 bg-white hover:text-teal-50 hover:bg-teal-600 whitespace-nowrap disabled:opacity-75 disabled:cursor-not-allowed data-[disabled]:text-gray-400 data-[disabled]:border-gray-300 data-[disabled]:hover:bg-white"
                onClick={handleGenerateCodes}
                disabled={generatingCodes || !isToday || hasExistingCodes}
                title={
                  !isToday
                    ? 'Solo disponible para la fecha actual'
                    : hasExistingCodes
                      ? 'Ya existen códigos generados para esta fecha'
                      : 'Generar códigos para animales de corral'
                }
              >
                {generatingCodes ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generando...
                  </>
                ) : (
                  <>
                    <Hash className="h-4 w-4 mr-1" />
                    Generar códigos
                  </>
                )}
              </Button>
              <div className={`absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 ${
                isToday && !hasExistingCodes ? 'bg-teal-600 text-white' : 'bg-gray-400 text-white'
              }`}>
                {hasExistingCodes
                  ? 'Ya existen códigos generados para esta fecha'
                  : isToday
                    ? 'Genera códigos para animales de corral'
                    : 'Solo disponible para la fecha actual'}
              </div>
            </div>

            <div className="flex gap-2 flex-wrap">
              <Badge className="bg-primary text-white px-3 py-1 rounded-full whitespace-nowrap">Disponibles: {totals.disponibles}</Badge>
              <Badge className="bg-red-500 text-white px-3 py-1 rounded-full whitespace-nowrap">Ocupados: {totals.ocupados}</Badge>
              <Badge className="bg-blue-500 text-white px-3 py-1 rounded-full whitespace-nowrap">
                Animales:
                {loadingAnimals ? (
                  <span className="inline-flex items-center ml-1 align-middle">
                    <span className="inline-block h-3 w-3 border-2 border-white/90 border-t-transparent rounded-full animate-spin" />
                  </span>
                ) : (
                  <span className="ml-1">{animalsToShow}</span>
                )}
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
