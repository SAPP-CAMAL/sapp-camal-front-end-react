"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Truck, User, CreditCard, ChevronLeft, CheckSquare } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getCarriersByFilterService } from "@/features/carriers/server/carriers.service";
import { Carrier } from "@/features/carriers/domain";
import { defaultShippingFilter } from "@/features/carriers/constants/default-shipping-filter";

interface Step3CarrierSelectionProps {
  onSelect: (carrier: Carrier) => void;
  onBack: () => void;
  filterByStatus?: boolean; // Opcional: filtrar solo transportistas activos
}

const isNumbers = (str: string) => /^\d+$/.test(str);

export function Step3CarrierSelection({
  onSelect,
  onBack,
  filterByStatus = false, // Por defecto no filtra por status
}: Step3CarrierSelectionProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Resetear página cuando cambia el término de búsqueda
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const { data, isLoading } = useQuery({
    queryKey: ["carriers", searchTerm],
    queryFn: () => {

      const filters = {
        page: currentPage,
        // limit: 100,
        ...defaultShippingFilter
      } as { page: number; limit?: number; identification?: string; fullName?: string};

      if (!searchTerm)
        return getCarriersByFilterService(filters);

      const isNumber = isNumbers(searchTerm);

      if (isNumber) filters.identification = searchTerm;
      else filters.fullName = searchTerm;

      return getCarriersByFilterService(filters);
    },
  });
  // Filtrar transportistas
  const allCarriers = data?.data?.items || [];
  const filteredCarriers = allCarriers.filter((carrier) => {
    // Siempre filtrar por tipo de transporte "PRS" (PRODUCTOS Y SUBPRODUCTOS)
    const isCorrectType = carrier.vehicle?.vehicleDetail?.transportType?.code === "PRS";

    // Si filterByStatus es true, también filtrar por status === true
    if (filterByStatus) {
      return isCorrectType && carrier.status === true;
    }

    return isCorrectType;
  });

  // Paginación en el frontend
  const totalItems = filteredCarriers.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const carriers = filteredCarriers.slice(startIndex, endIndex);

  const handleSelectCarrier = (carrier: Carrier) => {
    onSelect(carrier);
  };

  return (
    <Card>
      <CardContent className="pt-4 sm:pt-6 space-y-3 sm:space-y-4 p-3 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="bg-teal-600 text-white p-2 sm:p-3 rounded">
              <Truck className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-700">
              Seleccionar Transportista
            </h2>
          </div>
          <Button
            variant="outline"
            onClick={onBack}
            className="text-gray-600 hover:text-gray-700 w-full sm:w-auto"
            size="sm"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </div>

        {/* Buscador */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input
              placeholder="Buscar por nombre o identificación..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10 text-sm"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
        </div>

        {/* Versión móvil/tablet - Cards */}
        <div className="block lg:hidden space-y-3">
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">
              Cargando transportistas...
            </div>
          ) : carriers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No se encontraron transportistas
            </div>
          ) : (
            carriers.map((carrier) => (
              <Card key={carrier.id} className="p-4 border-2 border-teal-200 hover:border-teal-400 transition-colors">
                <div className="space-y-3">
                  {/* Transportista */}
                  <div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                      <User className="h-3 w-3" />
                      <span>Transportista</span>
                    </div>
                    <div className="font-semibold text-sm">
                      {carrier.person?.fullName || "Nombre no disponible"}
                    </div>
                  </div>

                  {/* Identificación */}
                  <div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                      <CreditCard className="h-3 w-3" />
                      <span>Identificación</span>
                    </div>
                    <div className="text-sm">
                      {carrier.person.identification}
                    </div>
                  </div>

                  {/* Vehículo */}
                  <div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                      <Truck className="h-3 w-3" />
                      <span>Vehículo</span>
                    </div>
                    <div className="text-sm">
                      <div className="font-medium">{carrier.vehicle?.plate || "N/A"}</div>
                      <div className="text-xs text-muted-foreground">
                        {carrier.vehicle?.vehicleDetail?.vehicleType?.name || "Tipo no especificado"}
                      </div>
                    </div>
                  </div>

                  {/* Botón de acción */}
                  <Button
                    size="sm"
                    onClick={() => handleSelectCarrier(carrier)}
                    className="bg-teal-600 hover:bg-teal-700 w-full"
                  >
                    <CheckSquare className="h-4 w-4 mr-2" />
                    Seleccionar
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Versión desktop - Tabla */}
        <div className="hidden lg:block relative overflow-auto border-2 rounded-lg">
          <Table>
            <TableHeader>
              <TableRow className="bg-teal-600 hover:bg-teal-600">
                <TableHead className="text-center border font-bold text-white py-3">
                  <div className="flex flex-col items-center gap-1">
                    <User className="w-4 h-4" />
                    <span className="text-xs">TRANSPORTISTA</span>
                  </div>
                </TableHead>
                <TableHead className="text-center border font-bold text-white py-3">
                  <div className="flex flex-col items-center gap-1">
                    <CreditCard className="w-4 h-4" />
                    <span className="text-xs">IDENTIFICACIÓN</span>
                  </div>
                </TableHead>
                <TableHead className="text-center border font-bold text-white py-3">
                  <div className="flex flex-col items-center gap-1">
                    <Truck className="w-4 h-4" />
                    <span className="text-xs">VEHÍCULO</span>
                  </div>
                </TableHead>
                <TableHead className="text-center border font-bold text-white py-3">
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-xs">ACCIÓN</span>
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center py-8 text-gray-500"
                  >
                    Cargando transportistas...
                  </TableCell>
                </TableRow>
              ) : carriers.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center py-8 text-gray-500"
                  >
                    No se encontraron transportistas
                  </TableCell>
                </TableRow>
              ) : (
                carriers.map((carrier) => (
                  <TableRow
                    key={carrier.id}
                    className="hover:bg-teal-50/30 transition-colors"
                  >
                    <TableCell className="text-sm border">
                      <span className="font-medium">
                        {carrier.person?.fullName || "N/A"}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-center border">
                      {carrier.person.identification}
                    </TableCell>
                    <TableCell className="text-sm text-center border">
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {carrier.vehicle?.plate}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {carrier.vehicle?.vehicleDetail?.vehicleType?.name || "N/A"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center border">
                      <div className="flex justify-center">
                        <Button
                          size="sm"
                          onClick={() => handleSelectCarrier(carrier)}
                          className="bg-teal-600 hover:bg-teal-700"
                        >
                          <CheckSquare className="h-4 w-4 mr-2" />
                          Seleccionar
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="flex flex-col gap-3 pt-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
                <div className="text-xs sm:text-sm text-muted-foreground">
                  Mostrando {startIndex + 1} a{" "}
                  {Math.min(endIndex, totalItems)} de{" "}
                  {totalItems} transportistas
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs sm:text-sm text-muted-foreground">Mostrar:</span>
                  <Select
                    value={itemsPerPage.toString()}
                    onValueChange={(value) => setItemsPerPage(Number(value))}
                  >
                    <SelectTrigger className="w-16 sm:w-20 h-7 sm:h-8 text-xs sm:text-sm">
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
            </div>

            {/* Botones de paginación */}
            <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-2">
              <Button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => prev - 1)}
                variant="outline"
                size="sm"
                className="text-xs sm:text-sm h-8 px-2 sm:px-3"
              >
                Anterior
              </Button>
              <div className="flex flex-wrap items-center gap-1">
                {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => {
                  const pageNumber = i + 1;
                  const isCurrentPage = pageNumber === currentPage;

                  // Mostrar primera página, última página, página actual y páginas alrededor
                  const showPage =
                    pageNumber === 1 ||
                    pageNumber === totalPages ||
                    Math.abs(pageNumber - currentPage) <= 2;

                  if (!showPage) return null;

                  return (
                    <Button
                      key={pageNumber}
                      variant="outline"
                      size="sm"
                      className={`text-xs sm:text-sm h-8 w-8 sm:w-auto sm:px-3 ${
                        isCurrentPage
                          ? "bg-teal-600 text-white hover:bg-teal-700 hover:text-white"
                          : ""
                      }`}
                      onClick={() => setCurrentPage(pageNumber)}
                    >
                      {pageNumber}
                    </Button>
                  );
                })}
              </div>
              {totalPages > 10 && (
                <span className="px-1 sm:px-2 text-xs sm:text-sm text-muted-foreground">
                  ... {totalPages}
                </span>
              )}
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((prev) => prev + 1)}
                className="text-xs sm:text-sm h-8 px-2 sm:px-3"
              >
                Siguiente
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
