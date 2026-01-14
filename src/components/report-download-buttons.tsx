"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FileSpreadsheet, FileText, Download } from "lucide-react";

interface ReportDownloadButtonsProps {
  onDownloadExcel: () => void;
  onDownloadPdf: () => void;
  isLoadingExcel?: boolean;
  isLoadingPdf?: boolean;
  spinnerIcon?: React.ComponentType<{ className?: string }>;
}

export function ReportDownloadButtons({
  onDownloadExcel,
  onDownloadPdf,
  isLoadingExcel = false,
  isLoadingPdf = false,
  spinnerIcon: SpinnerIcon,
}: ReportDownloadButtonsProps) {
  const isLoading = isLoadingExcel || isLoadingPdf;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm" disabled={isLoading} className="text-white">
          {isLoading && SpinnerIcon ? (
            <SpinnerIcon className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Download className="h-4 w-4 mr-2" />
          )}
          {isLoading ? "Descargando..." : "Descargar Reporte"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={onDownloadExcel}
          disabled={isLoadingExcel}
          className="cursor-pointer"
        >
          {isLoadingExcel && SpinnerIcon ? (
            <SpinnerIcon className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <FileSpreadsheet className="h-4 w-4 mr-2 text-green-600" />
          )}
          {isLoadingExcel ? "Descargando..." : "Descargar Excel"}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={onDownloadPdf}
          disabled={isLoadingPdf}
          className="cursor-pointer"
        >
          {isLoadingPdf && SpinnerIcon ? (
            <SpinnerIcon className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <FileText className="h-4 w-4 mr-2 text-red-600" />
          )}
          {isLoadingPdf ? "Descargando..." : "Descargar PDF"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
