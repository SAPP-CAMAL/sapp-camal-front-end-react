"use client";

import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  text?: string;
  size?: "sm" | "md" | "lg";
}

export function LoadingSpinner({ text = "Cargando...", size = "md" }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6", 
    lg: "h-8 w-8"
  };

  const textSizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg"
  };

  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-4">
      {/* Spinner animado */}
      <div className="relative">
        <Loader2 className={`${sizeClasses[size]} animate-spin text-blue-500`} />
        {/* Anillo exterior decorativo */}
        <div className={`absolute inset-0 ${sizeClasses[size]} border-2 border-gray-200 rounded-full animate-pulse`}></div>
      </div>
      
      {/* Texto con animación de puntos */}
      <div className={`text-gray-600 ${textSizeClasses[size]} flex items-center space-x-1`}>
        <span>{text}</span>
        <div className="flex space-x-1">
          <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
      
      {/* Barra de progreso simulada */}
      <div className="w-48 h-1 bg-gray-200 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full animate-pulse"></div>
      </div>
    </div>
  );
}

export function CorralesLoadingGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 animate-pulse">
      {/* Simulamos 8 tarjetas de corrales */}
      {Array.from({ length: 8 }).map((_, index) => (
        <div key={index} className="bg-gray-100 rounded-lg p-4 space-y-3">
          {/* Header del corral */}
          <div className="flex justify-between items-center">
            <div className="h-4 bg-gray-300 rounded w-16"></div>
            <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
          </div>
          
          {/* Contenido */}
          <div className="space-y-2">
            <div className="h-3 bg-gray-300 rounded w-3/4"></div>
            <div className="h-3 bg-gray-300 rounded w-1/2"></div>
          </div>
          
          {/* Footer */}
          <div className="flex justify-between pt-2">
            <div className="h-2 bg-gray-300 rounded w-8"></div>
            <div className="h-2 bg-gray-300 rounded w-8"></div>
          </div>
        </div>
      ))}
    </div>
  );
}