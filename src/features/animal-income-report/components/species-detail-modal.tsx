"use client";

import { useState, useEffect } from "react";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { X, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  getManagerReport,
  type ManagerReportItem,
} from "../server/db/animal-income-report.service";

interface SpeciesDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  speciesName: string;
  idSpecie: number;
  startDate: string;
  endDate: string;
}

export function SpeciesDetailModal({
  isOpen,
  onClose,
  speciesName,
  idSpecie,
  startDate,
  endDate,
}: SpeciesDetailModalProps) {
  const [items, setItems] = useState<ManagerReportItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const limit = 10;

  const fetchData = async (page: number) => {
    setIsLoading(true);
    try {
      const response = await getManagerReport({
        startDate,
        endDate,
        idSpecie,
        page,
        limit,
      });

      if (response.code === 200 || response.code === 201) {
        setItems(response.data.items);
        setTotalPages(response.data.meta.totalPages);
        setTotalItems(response.data.meta.totalItems);
        setCurrentPage(response.data.meta.currentPage);
      }
    } catch (error) {
      console.error("Error fetching species detail:", error);
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && idSpecie) {
      setCurrentPage(1);
      fetchData(1);
    }
  }, [isOpen, idSpecie, startDate, endDate]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      fetchData(newPage);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), "dd/MM/yyyy", { locale: es });
    } catch {
      return dateString;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-slate-900">
            Detalle de {speciesName}
          </DialogTitle>
          <p className="text-sm text-slate-500">
            Período: {startDate} - {endDate} | Total: {totalItems} registros
          </p>
        </DialogHeader>

        <div className="flex-1 overflow-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
            </div>
          ) : items.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-slate-500">No hay registros disponibles</p>
            </div>
          ) : (
            <div className="rounded-lg border border-slate-200 overflow-hidden">
              <Table>
                <TableHeader className="bg-teal-600">
                  <TableRow className="hover:bg-teal-600">
                    <TableHead className="text-white font-semibold">
                      N° de Ingreso
                    </TableHead>
                    <TableHead className="text-white font-semibold">
                      Fecha de registro
                    </TableHead>
                    <TableHead className="text-white font-semibold">
                      Introductor/Código
                    </TableHead>
                    <TableHead className="text-white font-semibold">
                      Detalles
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                    <TableRow
                      key={item.id}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <TableCell className="font-medium text-slate-900">
                        {item.code}
                      </TableCell>
                      <TableCell className="text-slate-600">
                        {formatDate(
                          item.detailCertificateBrands.detailsCertificateBrand.createdAt
                        )}
                      </TableCell>
                      <TableCell className="text-slate-600">
                        <div className="flex flex-col">
                          <span className="font-medium text-slate-900">
                            {item.detailCertificateBrands.detailsCertificateBrand.brand.introducer.user.person.fullName}
                          </span>
                          <span className="text-xs text-slate-500">
                            Marca: {item.detailCertificateBrands.detailsCertificateBrand.brand.name}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-100 text-teal-800">
                          {item.detailCertificateBrands.productiveStage.name}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            <p className="text-sm text-slate-500">
              Página {currentPage} de {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1 || isLoading}
              >
                <ChevronLeft className="h-4 w-4" />
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages || isLoading}
              >
                Siguiente
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
