"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { SearchIcon, MapPin, ChevronLeft, ChevronRight, User, MousePointerClick, Tag } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getAddresseesByFiltersWeighingService } from "@/features/addressees/server/addressees.service";
import { Addressees } from "@/features/addressees/domain";
import { toCapitalize } from "@/lib/toCapitalize";
import { useDebouncedCallback } from "use-debounce";
import { AddresseeSummaryCardWeighing } from "./addressee-summary-card-weighing";

interface AddresseeSelectionWeighingProps {
  initialBrandId?: number;
  initialBrandName?: string;
  initialBrandIds?: string; // Para order-entry: "4,3,5,67"
  isDefaultAddressSelected: boolean;
  onSelect: (addressee: Addressees) => void;
  setIsDefaultAddressSelected: (isDefault: boolean) => void;
  onBack: () => void;
}

export function AddresseeSelectionWeighing({
  initialBrandId,
  initialBrandName,
  initialBrandIds,
  isDefaultAddressSelected,
  setIsDefaultAddressSelected,
  onSelect,
  onBack,
}: AddresseeSelectionWeighingProps) {
  const [namesSearch, setNamesSearch] = useState("");
  const [brandSearch, setBrandSearch] = useState(initialBrandName); // Empezamos vacío para no disparar búsqueda por nombre inicialmente
  const [effectiveBrandId, setEffectiveBrandId] = useState<number | undefined>(initialBrandId);
  const [effectiveBrandIds, setEffectiveBrandIds] = useState<string | undefined>(initialBrandIds);
  const [page, setPage] = useState(1);
  const itemsPerPage = 5;

  const query = useQuery({
    queryKey: ["addressees", "weighing", namesSearch, brandSearch, effectiveBrandId, effectiveBrandIds],
    queryFn: () => {
      // Si el usuario ya está buscando activamente por nombre o marca, NO enviamos brandId ni brandIds
      const useBrandId = !namesSearch && !brandSearch ? effectiveBrandId : undefined;
      const useBrandIds = !namesSearch && !brandSearch ? effectiveBrandIds : undefined;

      return getAddresseesByFiltersWeighingService({
        names: namesSearch,
        brand: brandSearch,
        brandId: useBrandId,
        brandIds: useBrandIds,
      });
    },
  });

  // Efecto para limpiar el effectiveBrandId/effectiveBrandIds si no se encuentra un resultado único
  useEffect(() => {
    // La nueva API devuelve un array directamente en 'data'
    const items = Array.isArray(query.data?.data) ? query.data.data : [];
    const activeItems = items.filter((i: Addressees) => i.status === true);

    if (!query.isLoading && query.data?.data) {
      // AUTO-SELECCIÓN: Si se encuentra un único destinatario por marca (sin búsqueda manual), seleccionar de una
      if (activeItems.length === 1 && !isDefaultAddressSelected) {
        onSelect(activeItems[0]);
        setIsDefaultAddressSelected(true);
        return;
      }

      // Si ya hay filtros manuales, o si la búsqueda por ID no devolvió exactamente 1,
      // y todavía tenemos un effectiveBrandId/effectiveBrandIds, lo limpiamos para búsquedas futuras
      if ((namesSearch || brandSearch || activeItems.length !== 1) && (effectiveBrandId || effectiveBrandIds)) {
        // Solo limpiamos si no se encontró el resultado único inicial
        if (activeItems.length !== 1 || namesSearch || brandSearch) {
           setEffectiveBrandId(undefined);
           setEffectiveBrandIds(undefined);
        }
      }
    }
  }, [query.isLoading, query.data, namesSearch, brandSearch, effectiveBrandId, effectiveBrandIds, onSelect]);

  const debouncedNamesSearch = useDebouncedCallback((value) => {
    setNamesSearch(value);
    setEffectiveBrandId(undefined);
    setEffectiveBrandIds(undefined);
    setPage(1);
  }, 500);

  const debouncedBrandSearch = useDebouncedCallback((value) => {
    setBrandSearch(value);
    setEffectiveBrandId(undefined);
    setEffectiveBrandIds(undefined);
    setPage(1);
  }, 500);

  const handleSelect = (addressee: Addressees) => {
    onSelect(addressee);
  };

  const allData = Array.isArray(query.data?.data) ? query.data.data : [];
  const filteredData = allData.filter((addressee: Addressees) => addressee.status === true);

  // Ordenamiento inteligente por marca
  const sortedData = [...filteredData].sort((a, b) => {
    const brandA = a.brand || "";
    const brandB = b.brand || "";

    // Si ambas marcas son números, ordenar numéricamente
    const isNumericA = /^\d+$/.test(brandA);
    const isNumericB = /^\d+$/.test(brandB);

    if (isNumericA && isNumericB) {
      return parseInt(brandA) - parseInt(brandB);
    }

    // Si solo una es numérica, la numérica va primero
    if (isNumericA && !isNumericB) return -1;
    if (!isNumericA && isNumericB) return 1;

    // Si ninguna es numérica o ambas son texto, ordenar alfabéticamente
    return brandA.localeCompare(brandB, 'es', { sensitivity: 'base' });
  });

  // Paginación en el frontend
  const totalItems = sortedData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const data = sortedData.slice(startIndex, endIndex);

  return (
    <div className="space-y-4 w-full">
      {/* Search Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-2">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-teal-500 z-10 h-4 w-4" />
          <Input
            placeholder="Buscar por nombre o identificación..."
            className="pl-9 h-10 text-sm border-teal-100 focus-visible:ring-teal-500"
            onChange={(e) => debouncedNamesSearch(e.target.value)}
          />
        </div>
        <div className="relative">
          <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-teal-500 z-10 h-4 w-4" />
          <Input
            placeholder="Buscar por marca..."
            defaultValue={initialBrandName}
            className="pl-9 h-10 text-sm border-teal-100 focus-visible:ring-teal-500"
            onChange={(e) => debouncedBrandSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Table - Desktop */}
      <div className="hidden lg:block rounded-xl border border-teal-100 w-full shadow-sm overflow-hidden bg-white">
        <Table className="w-full">
          <TableHeader>
            <TableRow className="bg-teal-600 hover:bg-teal-600 border-b-0">
              <TableHead className="text-white font-bold text-xs py-3 px-4 uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <User className="h-3.5 w-3.5" />
                  Destinatario
                </div>
              </TableHead>
              <TableHead className="text-white font-bold text-xs py-3 px-4 uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5" />
                  Dirección
                </div>
              </TableHead>
              <TableHead className="text-white font-bold text-xs py-3 px-4 uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <Tag className="h-3.5 w-3.5" />
                  Marca
                </div>
              </TableHead>
              <TableHead className="text-white font-bold text-center text-xs py-3 px-4 uppercase tracking-wider">
                <div className="flex items-center justify-center gap-2">
                  <MousePointerClick className="h-3.5 w-3.5" />
                  Acción
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {query.isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="h-32 text-center text-teal-600 font-medium animate-pulse">
                  Cargando destinatarios...
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-32 text-center text-muted-foreground bg-gray-50/50">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <SearchIcon className="h-8 w-8 text-gray-300" />
                    <span>No se encontraron destinatarios</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              data.map((addressee) => (
                <TableRow
                  key={addressee.id}
                  className="cursor-pointer hover:bg-teal-50/50 transition-colors border-b border-teal-50"
                  onClick={() => handleSelect(addressee)}
                >
                  <TableCell className="py-3 px-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-gray-900 text-sm leading-tight">
                        {toCapitalize(addressee.fullName, true)}
                      </span>
                      <span className="text-[11px] text-teal-600 font-medium mt-0.5 uppercase">
                        CI: {addressee.identification}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-3 px-4">
                    {addressee.addresses ? (
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-700">
                           <span className="truncate max-w-[150px]">
                            {toCapitalize(addressee.addresses.province, true)}
                           </span>
                        </div>
                        <span className="text-[11px] text-muted-foreground leading-tight truncate max-w-[180px]">
                          {toCapitalize(addressee.addresses.canton, true)} - {toCapitalize(addressee.addresses.firstStree, true)}
                        </span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-xs">—</span>
                    )}
                  </TableCell>
                  <TableCell className="py-3 px-4">
                    <Badge variant="outline" className="text-blue-700 border-blue-300 bg-blue-50 text-sm font-bold px-3 py-1">
                      {addressee.brand || "SIN MARCA"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center py-3 px-4">
                    <Button
                      size="sm"
                      className="bg-teal-600 hover:bg-teal-700 text-xs px-4 h-8 rounded-full shadow-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelect(addressee);
                      }}
                    >
                      Seleccionar
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Cards - Mobile/Tablet */}
      <div className="lg:hidden space-y-3">
        {query.isLoading ? (
          <Card className="p-6 text-center text-teal-600 font-medium animate-pulse">
            Cargando destinatarios...
          </Card>
        ) : data.length === 0 ? (
          <Card className="p-8 text-center bg-gray-50/50">
            <div className="flex flex-col items-center justify-center gap-2">
              <SearchIcon className="h-10 w-10 text-gray-300" />
              <span className="text-muted-foreground">No se encontraron destinatarios</span>
            </div>
          </Card>
        ) : (
          data.map((addressee) => (
            <Card
              key={addressee.id}
              className="p-4 cursor-pointer hover:shadow-lg hover:border-teal-300 transition-all border-2 border-teal-100"
              onClick={() => handleSelect(addressee)}
            >
              <div className="space-y-3">
                {/* Destinatario */}
                <div className="flex items-start gap-2">
                  <User className="h-5 w-5 text-teal-600 mt-1 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-gray-500 mb-1 uppercase">Destinatario</div>
                    <div className="font-bold text-gray-900 text-base leading-tight">
                      {toCapitalize(addressee.fullName, true)}
                    </div>
                    <div className="text-sm text-teal-600 font-medium mt-1">
                      CI: {addressee.identification}
                    </div>
                  </div>
                </div>

                {/* Dirección */}
                {addressee.addresses && (
                  <div className="flex items-start gap-2 pt-2 border-t border-gray-100">
                    <MapPin className="h-5 w-5 text-teal-600 mt-1 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-gray-500 mb-1 uppercase">Dirección</div>
                      <div className="text-sm font-semibold text-gray-700">
                        {toCapitalize(addressee.addresses.province, true)}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {toCapitalize(addressee.addresses.canton, true)} - {toCapitalize(addressee.addresses.firstStree, true)}
                      </div>
                    </div>
                  </div>
                )}

                {/* Marca - Más grande y prominente */}
                <div className="flex items-start gap-2 pt-2 border-t border-gray-100">
                  <Tag className="h-5 w-5 text-teal-600 mt-1 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-gray-500 mb-2 uppercase">Marca</div>
                    <Badge
                      variant="outline"
                      className="text-blue-700 border-blue-300 bg-blue-50 text-lg font-bold px-4 py-2 w-full justify-center"
                    >
                      {addressee.brand || "SIN MARCA"}
                    </Badge>
                  </div>
                </div>

                {/* Botón de Acción */}
                <div className="pt-3">
                  <Button
                    size="lg"
                    className="w-full bg-teal-600 hover:bg-teal-700 text-base font-semibold shadow-md"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelect(addressee);
                    }}
                  >
                    <MousePointerClick className="h-5 w-5 mr-2" />
                    Seleccionar Destinatario
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-2 px-2 pb-2">
          <div className="text-xs text-muted-foreground font-medium">
            Página <span className="text-teal-700 font-bold">{page}</span> de <span className="text-teal-700 font-bold">{totalPages}</span>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="h-8 text-xs border-teal-100 hover:bg-teal-50"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="h-8 text-xs border-teal-100 hover:bg-teal-50"
            >
              Siguiente
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      <div className="flex justify-start pt-2">
        <Button variant="outline" onClick={onBack} className="h-10 px-6 border-gray-200 hover:bg-gray-50 flex items-center gap-2">
          <ChevronLeft className="h-4 w-4" />
          Regresar
        </Button>
      </div>
    </div>
  );
}
