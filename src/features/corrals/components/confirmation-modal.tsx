"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  Building,
  Target,
  ArrowRight,
  Users,
  User,
  UserCheck,
  Info,
  AlertCircle,
  MapPin,
  Loader2,
  X,
  Venus,
  Mars,
  Check,
  CheckCheckIcon,
  CheckCircle2Icon,
} from "lucide-react";
import { type BrandDetail } from "../domain";

interface ConfirmationModalState {
  isOpen: boolean;
  brand: BrandDetail | null;
  sourceCorralId: string | null;
  targetCorralId: string | null;
  targetCorralName: string | null;
  selectedMales: number;
  selectedFemales: number;
}

interface ConfirmationModalProps {
  confirmationModal: ConfirmationModalState;
  onConfirm: () => void;
  onReset: () => void;
  isTransferring: boolean;
}

export function ConfirmationModal({
  confirmationModal,
  onConfirm,
  onReset,
  isTransferring,
}: ConfirmationModalProps) {
  if (!confirmationModal.brand) return null;

  return (
    <Dialog open={confirmationModal.isOpen} onOpenChange={(open) => !open && onReset()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <CheckCircle className="h-5 w-5 text-blue-600" />
            Confirmar Transferencia
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Transfer flow visualization */}
          <div className="flex items-center justify-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border">
            <div className="text-center">
              <div className="p-2 bg-blue-100 rounded-full mb-1">
                <Building className="h-4 w-4 text-blue-600" />
              </div>
              <p className="text-xs font-medium text-gray-600">Origen</p>
            </div>
            
            <div className="flex flex-col items-center gap-1">
              <ArrowRight className="h-5 w-5 text-gray-400" />
              <div className="flex items-center gap-1 bg-primary-100 px-2 py-1 rounded-full">
                <Check className="h-3 w-3 text-purple-700" />
                <span className="text-xs font-bold text-purple-700">
                  {(confirmationModal.selectedMales ?? 0) + (confirmationModal.selectedFemales ?? 0)}
                </span>
              </div>
            </div>
            
            <div className="text-center">
              <div className="p-2 bg-green-100 rounded-full mb-1">
                <Target className="h-4 w-4 text-green-600" />
              </div>
              <p className="text-xs font-medium text-gray-600">Destino</p>
            </div>
          </div>

          {/* Transfer summary - Enhanced */}
          <div className="relative overflow-hidden rounded-xl border-2 border-sidebar-primary-200 bg-purple-50/60">
            <div className="absolute top-2 right-2">
              <div className="p-1 bg-purple-200 rounded-full">
                <Info className="h-3 w-3 text-purple-700" />
              </div>
            </div>
            
            <div className="p-4">
              <h4 className="flex items-center gap-2 font-bold text-purple-800 mb-3">
                <AlertCircle className="h-4 w-4" />
                Resumen de transferencia
              </h4>
              
              <div className="space-y-3">
                {/* Brand info */}
                <div className="flex items-center gap-2 p-2 bg-white/60 rounded-lg border border-purple-200">
                  <CheckCheckIcon className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{confirmationModal.brand.nameBrand}</p>
                    <p className="text-xs text-gray-600">Marca a transferir</p>
                  </div>
                </div>
                
                {/* Animals breakdown */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 bg-blue-50 rounded-lg border border-blue-200 text-center">
                    <div className="flex items-center justify-center mb-1">
                      <Venus className="h-3 w-3 text-blue-600" />
                    </div>
                    <p className="text-lg font-bold text-blue-700">{confirmationModal.selectedMales ?? 0}</p>
                    <p className="text-xs text-blue-600">Machos</p>
                  </div>
                  
                  <div className="p-2 bg-pink-50 rounded-lg border border-pink-200 text-center">
                    <div className="flex items-center justify-center mb-1">
                      <Mars className="h-3 w-3 text-pink-600" />
                    </div>
                    <p className="text-lg font-bold text-pink-700">{confirmationModal.selectedFemales ?? 0}</p>
                    <p className="text-xs text-pink-600">Hembras</p>
                  </div>
                </div>
                
                {/* Total and destination */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="flex items-center gap-2">
                      <CheckCircle2Icon className="h-4 w-4 text-purple-600" />
                      <span className="text-sm font-medium text-purple-700">Total animales:</span>
                    </div>
                    <span className="text-lg font-bold text-purple-600">
                      {(confirmationModal.selectedMales ?? 0) + (confirmationModal.selectedFemales ?? 0)}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between p-2 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4  text-green-600" />
                      <span className="text-sm font-medium text-green-700">Destino:</span>
                    </div>
                    <span className="text-sm font-bold text-green-700">{confirmationModal.targetCorralName}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Confirmation question - Enhanced */}
          <div className="text-center py-3 px-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200">
            <div className="flex items-center justify-center gap-2 mb-2">
              <AlertCircle className="h-5 w-5 text-amber-600" />
              <p className="font-semibold text-gray-800">¿Está seguro que desea continuar?</p>
            </div>
            <p className="text-sm text-gray-600">Esta acción transferirá los animales y no se puede deshacer.</p>
          </div>

          {/* Action buttons - Enhanced */}
          <div className="flex gap-3 pt-2">
            <Button 
              variant="outline" 
              onClick={onReset}
              className="flex-1 gap-2 border-gray-300 hover:bg-gray-50"
              disabled={isTransferring}
            >
              <X className="h-4 w-4" />
              Cancelar
            </Button>
            <Button 
              onClick={onConfirm}
              className="flex-1 gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
              disabled={isTransferring}
            >
              {isTransferring ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Transfiriendo...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4" />
                  Confirmar Transferencia
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}