"use client";

import React, { useState } from "react";
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ArrowDownUp,
  Building,
  Target,
  ArrowRight,
  Info,
  CheckCircle,
  AlertTriangle,
  MapPin,
  Loader2,
  X,
  Venus,
  Mars,
} from "lucide-react";
import { type BrandDetail, type Corral } from "../domain";
import { type ProductiveStage } from "@/features/productive-stage/domain";

interface CorralType {
  id: number;
  description: string;
  code: string;
  status: boolean;
}

interface TransferModalState {
  isOpen: boolean;
  brand: BrandDetail | null;
  sourceCorralId: string | null;
  selectedQuantitiesByStage: Record<number, number>;
  initialQuantitiesByStage?: Record<number, number>;
  targetCorralId: string | null;
}
interface TransferModalProps {
  transferModal: TransferModalState;
  setTransferModal: React.Dispatch<React.SetStateAction<TransferModalState>>;
  corrales: Corral[];
  productiveStages: ProductiveStage[];
  onTransfer: (corralId: string) => void;
  onReset: () => void;
  isTransferring: boolean;
}

export function TransferModal({
  transferModal,
  setTransferModal,
  corrales,
  productiveStages,
  onTransfer,
  onReset,
  isTransferring,
}: TransferModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // const [isEmergencyCorral, setIsEmergencyCorral] = useState(false);

  if (!transferModal.brand) return null;

  const brand = transferModal.brand;

  // Check if source corral is emergency type (prevent all transfers)
  const sourceCorral = corrales.find(c => c.id === transferModal.sourceCorralId);
  const isSourceEmergency = sourceCorral?.idCorralType === 2;

  const maleStages = productiveStages.filter(stage => stage.idAnimalSex === 2);
  const femaleStages = productiveStages.filter(stage => stage.idAnimalSex === 1);

  const getTotalSelected = () => {
    return Object.values(transferModal.selectedQuantitiesByStage).reduce((sum, qty) => sum + qty, 0);
  };

  const getMaleTotal = () => {
    return maleStages.reduce((sum, stage) => sum + (transferModal.selectedQuantitiesByStage[stage.id] || 0), 0);
  };

  const getFemaleTotal = () => {
    return femaleStages.reduce((sum, stage) => sum + (transferModal.selectedQuantitiesByStage[stage.id] || 0), 0);
  };

  const getInitialQuantityForStage = (stageId: number) => {
    return transferModal.initialQuantitiesByStage?.[stageId] || 0;
  };

  const handleTransfer = async () => {
    if (!transferModal.targetCorralId || getTotalSelected() <= 0) return;

    // Prevent transfer if source is emergency corral
    if (isSourceEmergency) {
      setError('No se puede transferir desde un corral de emergencia');
      return;
    }

    try {
      setIsLoading(true);
      const targetCorral = corrales.find(c => c.id === transferModal.targetCorralId);
      if (!targetCorral) {
        setError('Corral de destino no encontrado');
        return;
      }

      // Get corral type to determine if target is emergency
      // const corralType = await getCorralTypeById(targetCorral.idCorralType);
      // const isEmergency = corralType.data.code === corralTypesCode.EMERGENCIA;

      // setIsEmergencyCorral(isEmergency);
      onTransfer(transferModal.targetCorralId);
    } catch (error) {
      toast.error('Error al validar el tipo de corral');
    } finally {
      setIsLoading(false);
    }
  };

  const updateStageQuantity = (stageId: number, quantity: number) => {
    setTransferModal(prev => ({
      ...prev,
      selectedQuantitiesByStage: {
        ...prev.selectedQuantitiesByStage,
        [stageId]: quantity
      }
    }));
  };

  return (
    <Dialog open={transferModal.isOpen} onOpenChange={(open) => !open && onReset()}>
      <DialogContent className="max-w-7xl w-[98vw] max-h-[95vh] overflow-hidden flex flex-col">
        <DialogHeader className="pb-4 border-b flex-shrink-0">
          <DialogTitle className="flex items-center gap-3 text-xl md:text-2xl font-bold">
            <ArrowDownUp className="h-6 w-6 md:h-7 md:w-7 text-blue-600" />
            Transferir Animales
          </DialogTitle>
        </DialogHeader>

        {/* Scrollable content area */}
        <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <div className="space-y-6 p-1">{/* Add some padding for better scroll */}

          {/* Emergency corral warning */}
          {isSourceEmergency && (
            <div className="flex items-center gap-3 p-4 bg-red-50 rounded-lg border-2 border-red-200 mb-4">
              <AlertTriangle className="h-6 w-6 text-red-600 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-red-800">Transferencia No Permitida</p>
                <p className="text-xs text-red-700">
                  Los animales en corrales de emergencia no pueden ser transferidos a otros corrales.
                </p>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-xl border">
            <div className="flex items-center gap-3 mb-3 sm:mb-0">
              <div className="p-2 bg-blue-100 rounded-full">
                <Building className="h-4 w-4 text-blue-600" />
              </div>
              <div className="text-center sm:text-left">
                <p className="text-xs font-medium text-gray-600">Desde</p>
                <p className="text-sm md:text-base font-semibold text-gray-900">
                  {(() => {
                    const sourceCorral = corrales.find(c => c?.id === transferModal.sourceCorralId);
                    return sourceCorral?.name || 'Corral origen';
                  })()}
                </p>
              </div>
            </div>

            <ArrowRight className="h-5 w-5 text-gray-400 rotate-90 sm:rotate-0" />

            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-full">
                <Target className="h-4 w-4 text-green-600" />
              </div>
              <div className="text-center sm:text-left">
                <p className="text-xs font-medium text-gray-600">Hacia</p>
                <p className="text-sm md:text-base font-semibold text-green-700">Seleccionar destino</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div className="relative overflow-hidden rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50 via-white to-blue-50">
              <div className="absolute top-3 right-3">
                {/* <div className="p-1.5 bg-blue-100 rounded-full">
                  <Info className="h-4 w-4 text-blue-600" />
                </div> */}
              </div>

              <div className="p-4 md:p-6">
                <h4 className="flex items-center gap-1 font-bold text-lg md:text-xl text-gray-900 mb-4">
                  <span>Marca:</span>
                  {brand.nameBrand}
                </h4>

                <div className="flex justify-center gap-8 mb-4">
                  <div className="flex flex-col items-center text-center p-4 bg-blue-50 rounded-lg border border-blue-200 shadow-sm w-24">
                    <div className="flex items-center justify-center mb-2">
                      <Venus className="h-4 w-4 text-blue-600" />
                    </div>
                    <p className="text-xl md:text-2xl font-bold text-blue-700">
                      {brand.males}
                    </p>
                    <p className="text-xs text-blue-600">Machos</p>
                  </div>

                  <div className="flex flex-col items-center text-center p-4 bg-pink-50 rounded-lg border border-pink-200 shadow-sm w-24">
                    <div className="flex items-center justify-center mb-2">
                      <Mars className="h-4 w-4 text-pink-600" />
                    </div>
                    <p className="text-xl md:text-2xl font-bold text-pink-700">
                      {brand.females}
                    </p>
                    <p className="text-xs text-pink-600">Hembras</p>
                  </div>
                </div>

                {productiveStages.length > 0 && (
                  <div>
                    <h5 className="text-sm font-semibold text-gray-700 mb-3">Etapas Productivas Disponibles:</h5>
                    <div className="space-y-3">
                      {maleStages.length > 0 && (
                        <div>
                          <h6 className="text-xs font-medium text-blue-600 mb-2 flex items-center gap-1">
                            <Venus className="h-3 w-3" />
                            Machos:
                          </h6>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                            {maleStages.map(stage => (
                              <div key={stage.id} className="flex items-center justify-between p-2 bg-blue-50 rounded border border-blue-200">
                                <p className="text-xs text-blue-600 truncate flex-1">{stage.name}</p>
                                <p className="text-sm font-bold text-blue-800 ml-2 min-w-[2rem] text-right">
                                  {getInitialQuantityForStage(stage.id)}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {femaleStages.length > 0 && (
                        <div>
                          <h6 className="text-xs font-medium text-pink-600 mb-2 flex items-center gap-1">
                            <Mars className="h-3 w-3" />
                            Hembras:
                          </h6>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                            {femaleStages.map(stage => (
                              <div key={stage.id} className="flex items-center justify-between p-2 bg-pink-50 rounded border border-pink-200">
                                <p className="text-xs text-pink-600 truncate flex-1">{stage.name}</p>
                                <p className="text-sm font-bold text-pink-800 ml-2 min-w-[2rem] text-right">
                                  {getInitialQuantityForStage(stage.id)}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="relative overflow-hidden rounded-xl border border-dashed border-gray-300 bg-gradient-to-r from-gray-50 to-gray-100 p-4 md:p-6">
                <div className="absolute top-3 right-3">
                  {/* <AlertCircle className="h-4 w-4 text-gray-500" /> */}
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">A transferir:</p>
                    <p className="text-2xl md:text-3xl font-bold text-green-600">
                      {getTotalSelected()} animales
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                      <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="font-semibold text-blue-700 mb-2 text-center">Machos: {getMaleTotal()}</p>
                        <div className="space-y-1">
                          {maleStages.map(stage => {
                            const qty = transferModal.selectedQuantitiesByStage[stage.id] || 0;
                            if (qty === 0) return null;
                            return (
                              <div key={stage.id} className="flex items-center justify-between text-xs">
                                <span className="text-blue-600 truncate flex-1">{stage.name}</span>
                                <span className="font-bold text-blue-800 ml-2">{qty}</span>
                              </div>
                            );
                          })}
                          {getMaleTotal() === 0 && <p className="text-xs text-blue-400 text-center italic">Ninguno</p>}
                        </div>
                      </div>
                      <div className="p-3 bg-pink-50 rounded-lg border border-pink-200">
                        <p className="font-semibold text-pink-700 mb-2 text-center">Hembras: {getFemaleTotal()}</p>
                        <div className="space-y-1">
                          {femaleStages.map(stage => {
                            const qty = transferModal.selectedQuantitiesByStage[stage.id] || 0;
                            if (qty === 0) return null;
                            return (
                              <div key={stage.id} className="flex items-center justify-between text-xs">
                                <span className="text-pink-600 truncate flex-1">{stage.name}</span>
                                <span className="font-bold text-pink-800 ml-2">{qty}</span>
                              </div>
                            );
                          })}
                          {getFemaleTotal() === 0 && <p className="text-xs text-pink-400 text-center italic">Ninguna</p>}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="border-t pt-3">
                    <p className="text-sm font-medium text-gray-700 mb-2">Permanecerán en el corral:</p>
                    <p className="text-2xl md:text-3xl font-bold text-orange-600">
                      {(brand.males + brand.females) - getTotalSelected()} animales
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <p className="font-medium text-blue-700">Machos: {brand.males - getMaleTotal()}</p>
                      </div>
                      <div className="text-center p-3 bg-pink-50 rounded-lg">
                        <p className="font-medium text-pink-700">Hembras: {brand.females - getFemaleTotal()}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <h5 className="font-semibold text-base md:text-lg text-gray-900">Seleccionar cantidades por etapa productiva:</h5>
            </div>

            {productiveStages.length === 0 && (
              <div className="flex items-center gap-3 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <Info className="h-5 w-5 text-yellow-600" />
                <p className="text-sm text-yellow-800">No hay etapas productivas disponibles para esta especie</p>
              </div>
            )}

            {maleStages.length > 0 && (
              <div className="space-y-4">
                <h6 className="text-base font-semibold text-blue-700 flex items-center gap-2">
                  <Venus className="h-5 w-5" />
                  Machos
                </h6>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {maleStages.map(stage => (
                    <div key={stage.id} className="flex flex-col gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <div className="p-1 bg-blue-100 rounded-full flex-shrink-0">
                            <Venus className="h-3 w-3 text-blue-600" />
                          </div>
                          <Label htmlFor={`stage-${stage.id}`} className="text-xs font-medium text-blue-700 truncate">
                            {stage.name}
                          </Label>
                        </div>
                        <div className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full flex-shrink-0 font-semibold">
                          Max: {getInitialQuantityForStage(stage.id)}
                        </div>
                      </div>
                      <Input
                        id={`stage-${stage.id}`}
                        type="number"
                        min={0}
                        max={getInitialQuantityForStage(stage.id)}
                        value={transferModal.selectedQuantitiesByStage[stage.id] || 0}
                        disabled={isSourceEmergency}
                        onChange={(e) => {
                          if (isSourceEmergency) return;
                          const maxQuantity = getInitialQuantityForStage(stage.id);
                          const value = Math.min(
                            Math.max(0, parseInt(e.target.value) || 0),
                            maxQuantity
                          );
                          updateStageQuantity(stage.id, value);
                        }}
                        className={`text-center text-base font-semibold border-blue-300 focus:border-blue-500 focus:ring-blue-500 h-11 ${
                          isSourceEmergency ? 'opacity-50 cursor-not-allowed bg-gray-100' : ''
                        }`}
                        placeholder="0"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {femaleStages.length > 0 && (
              <div className="space-y-4">
                <h6 className="text-base font-semibold text-pink-700 flex items-center gap-2">
                  <Mars className="h-5 w-5" />
                  Hembras
                </h6>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {femaleStages.map(stage => (
                    <div key={stage.id} className="flex flex-col gap-2 p-3 bg-pink-50 rounded-lg border border-pink-200">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <div className="p-1 bg-pink-100 rounded-full flex-shrink-0">
                            <Mars className="h-3 w-3 text-pink-600" />
                          </div>
                          <Label htmlFor={`stage-${stage.id}`} className="text-xs font-medium text-pink-700 truncate">
                            {stage.name}
                          </Label>
                        </div>
                        <div className="bg-pink-600 text-white text-xs px-2 py-0.5 rounded-full flex-shrink-0 font-semibold">
                          Max: {getInitialQuantityForStage(stage.id)}
                        </div>
                      </div>
                      <Input
                        id={`stage-${stage.id}`}
                        type="number"
                        min={0}
                        max={getInitialQuantityForStage(stage.id)}
                        value={transferModal.selectedQuantitiesByStage[stage.id] || 0}
                        disabled={isSourceEmergency}
                        onChange={(e) => {
                          if (isSourceEmergency) return;
                          const maxQuantity = getInitialQuantityForStage(stage.id);
                          const value = Math.min(
                            Math.max(0, parseInt(e.target.value) || 0),
                            maxQuantity
                          );
                          updateStageQuantity(stage.id, value);
                        }}
                        className={`text-center text-base font-semibold border-pink-300 focus:border-pink-500 focus:ring-pink-500 h-11 ${
                          isSourceEmergency ? 'opacity-50 cursor-not-allowed bg-gray-100' : ''
                        }`}
                        placeholder="0"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-green-600" />
              <h5 className="font-semibold text-base md:text-lg text-gray-900">Seleccionar corral de destino:</h5>
            </div>

            <div className="max-h-80 overflow-y-auto space-y-3 pr-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {corrales.filter(c => c && c.id !== transferModal.sourceCorralId).map(corral => {
                const totalToTransfer = getTotalSelected();
                const isSelected = transferModal.targetCorralId === corral.id;
                const utilizationPercent = corral.ocupacionPorcentaje || 0; // Usar el porcentaje ya calculado

                return (
                  <div
                    key={corral.id}
                    onClick={() => {
                      if (isSourceEmergency) return;
                      setTransferModal(prev => ({
                        ...prev,
                        targetCorralId: isSelected ? null : corral.id
                      }));
                    }}
                    className={`w-full p-4 md:p-5 text-left rounded-xl border-2 transition-all duration-200 ${
                      isSourceEmergency
                        ? 'opacity-50 cursor-not-allowed bg-gray-100 border-gray-200'
                        : isLoading
                        ? 'opacity-70 cursor-not-allowed'
                        : 'cursor-pointer hover:scale-[1.02]'
                    } ${
                      isSelected && !isSourceEmergency
                        ? 'border-green-500 bg-gradient-to-br from-green-100 to-green-200 shadow-lg'
                        : !isSourceEmergency
                        ? 'border-gray-200 bg-gradient-to-br from-gray-50 to-white hover:border-green-300 hover:from-green-50 hover:to-green-100'
                        : ''
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3">
                      <h4 className="text-base md:text-lg font-semibold text-gray-900 mb-2 sm:mb-0">{corral.name}</h4>
                      <div className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                        utilizationPercent < 70
                          ? 'bg-green-100 text-green-700'
                          : utilizationPercent < 90
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {utilizationPercent}% ocupado
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-sm text-gray-600 mb-3">
                      <span>Ocupación: {corral.ocupacion}/{corral.limite}</span>
                      <span className="font-medium">Disponibles: {corral.limite - corral.ocupacion}</span>
                    </div>

                    <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
                      <div
                        className={`h-3 rounded-full transition-all duration-300 ${
                          utilizationPercent < 70
                            ? 'bg-green-500'
                            : utilizationPercent < 90
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                        }`}
                        style={{ width: `${utilizationPercent}%` }}
                      ></div>
                    </div>

                    {isSelected && totalToTransfer > 0 && (
                      <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                        <p className="text-sm text-green-700 font-medium text-center">
                          ✓ Transferir {totalToTransfer} animales a este corral
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {getTotalSelected() === 0 && (
              <div className="flex items-center gap-3 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                {/* <AlertCircle className="h-5 w-5 text-yellow-600" /> */}
                <p className="text-sm text-yellow-800">Selecciona al menos un animal para transferir</p>
              </div>
            )}

            {!transferModal.targetCorralId && getTotalSelected() > 0 && (
              <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <Info className="h-5 w-5 text-blue-600" />
                <p className="text-sm text-blue-800">Selecciona un corral de destino</p>
              </div>
            )}
          </div>
          </div>
        </div>

        {/* Fixed bottom buttons with backdrop */}
        <div className="flex-shrink-0 sticky bottom-0 bg-white/95 backdrop-blur-sm border-t">
          <div className="flex flex-col sm:flex-row gap-3 p-6">
            <Button
              variant="outline"
              onClick={onReset}
              className="flex-1 gap-2 text-sm h-12 hover:bg-gray-50"
              disabled={isTransferring}
            >
              <X className="h-4 w-4" />
              Cancelar
            </Button>

            <Button
              variant="default"
              disabled={
                isTransferring ||
                getTotalSelected() === 0 ||
                !transferModal.targetCorralId ||
                isSourceEmergency
              }
              className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 gap-2 text-sm h-12 shadow-lg"
              onClick={handleTransfer}
            >
              {isTransferring ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Transfiriendo...
                </>
              ) : isSourceEmergency ? (
                <>
                  <AlertTriangle className="h-4 w-4" />
                  Transferencia Bloqueada
                </>
              ) : (
                <>
                  <ArrowRight className="h-4 w-4" />
                  Transferir {getTotalSelected() > 0 && `(${getTotalSelected()})`}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
