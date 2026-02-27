"use client";

import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { ImageIcon } from "lucide-react";

interface ObservationImageModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  urlImage: string | null | undefined;
  title: string;
}

export function ObservationImageModal({
  open,
  onOpenChange,
  urlImage,
  title,
}: ObservationImageModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl w-full sm:w-[95vw] max-h-[95vh] sm:max-h-[95vh] flex flex-col p-0 gap-0 overflow-hidden">
        <div className="flex items-center gap-2 px-3 sm:px-6 py-2 sm:py-2.5 border-b bg-white shrink-0">
          <ImageIcon className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
          <DialogTitle className="text-xs sm:text-sm font-semibold m-0 truncate">{title}</DialogTitle>
        </div>

        <div 
          className="flex-1 min-h-0 overflow-auto p-3 sm:p-6 bg-gray-50/50 scrollbar-hide"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          <style jsx>{`
            .scrollbar-hide::-webkit-scrollbar {
              display: none;
            }
          `}</style>
          {urlImage ? (
            <div className="w-full h-full flex items-center justify-center relative">
              <img
                src={urlImage}
                alt={title}
                className="max-w-full h-auto object-contain shadow-lg rounded-lg"
                style={{ maxHeight: 'calc(95vh - 80px)', minHeight: '200px' }}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent) {
                    parent.innerHTML = `
                      <div class="flex flex-col items-center justify-center min-h-[400px] text-gray-500">
                        <svg class="w-16 h-16 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                        </svg>
                        <p class="text-sm font-medium">Error al cargar la imagen</p>
                        <p class="text-xs text-gray-400 mt-1">La imagen no está disponible</p>
                      </div>
                    `;
                  }
                }}
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center min-h-[200px] sm:min-h-[400px] rounded-lg border-2 border-dashed border-gray-300 bg-white text-gray-500 p-4 sm:p-8">
              <ImageIcon className="h-12 w-12 sm:h-16 sm:w-16 mb-3 sm:mb-4 text-gray-300" />
              <p className="text-base sm:text-lg font-medium">Sin imagen</p>
              <p className="text-xs sm:text-sm text-gray-400 mt-1 sm:mt-2 text-center max-w-md">
                Esta observación no tiene una imagen asociada
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
