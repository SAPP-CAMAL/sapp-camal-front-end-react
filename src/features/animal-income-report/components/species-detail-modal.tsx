"use client";

import { useState, useEffect } from "react";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
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
import { Card, CardContent } from "@/components/ui/card";
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

  // Componente de tarjeta para móvil
  const MobileCard = ({ item }: { item: ManagerReportItem }) => (
    <Card className="mb-3">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <span className="text-lg font-bold text-slate-900">#{item.code}</span>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-100 text-teal-800">
            {item.detailCertificateBrands.productiveStage.name}
          </span>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-500">Fecha:</span>
            <span className="text-slate-700">
              {formatDate(item.detailCertificateBrands.detailsCertificateBrand.createdAt)}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-slate-500">Introductor:</span>
            <span className="font-medium text-slate-900">
              {item.detailCertificateBrands.detailsCertificateBrand.brand.introducer.user.person.fullName}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Marca:</span>
            <span className="text-slate-700">
              {item.detailCertificateBrands.detailsCertificateBrand.brand.name}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="!max-w-6xl !w-[95vw] sm:!w-[90vw] max-h-[90vh] overflow-hidden flex flex-col p-4 sm:p-6">
        <DialogHeader className="space-y-1">
          <DialogTitle className="text-lg sm:text-xl font-semibold text-slate-900">
            Detalle de {speciesName}
          </DialogTitle>
          <p className="text-xs sm:text-sm text-slate-500">
            <span className="hidden sm:inline">Período: {startDate} - {endDate} | </span>
            <span className="sm:hidden">{startDate} - {endDate}<br /></span>
            Total: {totalItems} registros
          </p>
        </DialogHeader>

        <div className="flex-1 overflow-auto -mx-4 px-4 sm:mx-0 sm:px-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
            </div>
          ) : items.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-slate-500">No hay registros disponibles</p>
            </div>
          ) : (
            <>
              {/* Vista móvil - Tarjetas */}
              <div className="block md:hidden">
                {items.map((item) => (
                  <MobileCard key={item.id} item={item} />
                ))}
              </div>

              {/* Vista desktop/tablet - Tabla */}
              <div className="hidden md:block rounded-lg border border-slate-200 overflow-hidden">
                <Table>
                  <TableHeader className="bg-teal-600">
                    <TableRow className="hover:bg-teal-600">
                      <TableHead className="text-white font-semibold text-xs lg:text-sm">
                        N° de Ingreso
                      </TableHead>
                      <TableHead className="text-white font-semibold text-xs lg:text-sm">
                        Fecha de registro
                      </TableHead>
                      <TableHead className="text-white font-semibold text-xs lg:text-sm">
                        Introductor/Código
                      </TableHead>
                      <TableHead className="text-white font-semibold text-xs lg:text-sm">
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
                        <TableCell className="font-medium text-slate-900 text-xs lg:text-sm">
                          {item.code}
                        </TableCell>
                        <TableCell className="text-slate-600 text-xs lg:text-sm">
                          {formatDate(
                            item.detailCertificateBrands.detailsCertificateBrand.createdAt
                          )}
                        </TableCell>
                        <TableCell className="text-slate-600">
                          <div className="flex flex-col">
                            <span className="font-medium text-slate-900 text-xs lg:text-sm">
                              {item.detailCertificateBrands.detailsCertificateBrand.brand.introducer.user.person.fullName}
                            </span>
                            <span className="text-[10px] lg:text-xs text-slate-500">
                              Marca: {item.detailCertificateBrands.detailsCertificateBrand.brand.name}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] lg:text-xs font-medium bg-teal-100 text-teal-800">
                            {item.detailCertificateBrands.productiveStage.name}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </div>

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-200">
            <p className="text-xs sm:text-sm text-slate-500 order-2 sm:order-1">
              Página {currentPage} de {totalPages}
            </p>
            <div className="flex items-center gap-2 order-1 sm:order-2 w-full sm:w-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1 || isLoading}
                className="flex-1 sm:flex-none text-xs sm:text-sm"
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="hidden sm:inline ml-1">Anterior</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages || isLoading}
                className="flex-1 sm:flex-none text-xs sm:text-sm"
              >
                <span className="hidden sm:inline mr-1">Siguiente</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
