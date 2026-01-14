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
  onSelect: (addressee: Addressees) => void;
  onBack: () => void;
}

export function AddresseeSelectionWeighing({
  initialBrandId,
  initialBrandName,
  onSelect,
  onBack,
}: AddresseeSelectionWeighingProps) {
  const [namesSearch, setNamesSearch] = useState("");
  const [brandSearch, setBrandSearch] = useState(""); // Empezamos vacío para no disparar búsqueda por nombre inicialmente
  const [effectiveBrandId, setEffectiveBrandId] = useState<number | undefined>(initialBrandId);
  const [page, setPage] = useState(1);
  const itemsPerPage = 5;

  const query = useQuery({
    queryKey: ["addressees", "weighing", namesSearch, brandSearch, effectiveBrandId],
    queryFn: () => {
      // Si el usuario ya está buscando activamente por nombre o marca, NO enviamos el brandId
      const useBrandId = !namesSearch && !brandSearch ? effectiveBrandId : undefined;
      
      return getAddresseesByFiltersWeighingService({
        names: namesSearch,
        brand: brandSearch,
        brandId: useBrandId,
      });
    },
  });

  // Efecto para limpiar el effectiveBrandId si no se encuentra un resultado único
  useEffect(() => {
    // La nueva API devuelve un array directamente en 'data'
    const items = Array.isArray(query.data?.data) ? query.data.data : [];
    const activeItems = items.filter((i: Addressees) => i.status === true);
    
    if (!query.isLoading && query.data?.data) {
      // AUTO-SELECCIÓN: Si se encuentra un único destinatario por marca (sin búsqueda manual), seleccionar de una
      if (activeItems.length === 1 && effectiveBrandId && !namesSearch && !brandSearch) {
        onSelect(activeItems[0]);
        return;
      }

      // Si ya hay filtros manuales, o si la búsqueda por ID no devolvió exactamente 1, 
      // y todavía tenemos un effectiveBrandId, lo limpiamos para búsquedas futuras
      if ((namesSearch || brandSearch || activeItems.length !== 1) && effectiveBrandId) {
        // Solo limpiamos si no se encontró el resultado único inicial
        if (activeItems.length !== 1 || namesSearch || brandSearch) {
           setEffectiveBrandId(undefined);
        }
      }
    }
  }, [query.isLoading, query.data, namesSearch, brandSearch, effectiveBrandId, onSelect]);

  const debouncedNamesSearch = useDebouncedCallback((value) => {
    setNamesSearch(value);
    setEffectiveBrandId(undefined);
    setPage(1);
  }, 500);

  const debouncedBrandSearch = useDebouncedCallback((value) => {
    setBrandSearch(value);
    setEffectiveBrandId(undefined);
    setPage(1);
  }, 500);

  const handleSelect = (addressee: Addressees) => {
    onSelect(addressee);
  };

  const allData = Array.isArray(query.data?.data) ? query.data.data : [];
  const filteredData = allData.filter((addressee: Addressees) => addressee.status === true);

  // Paginación en el frontend
  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const data = filteredData.slice(startIndex, endIndex);

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

      {/* Table */}
      <div className="rounded-xl border border-teal-100 w-full shadow-sm overflow-hidden bg-white">
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
                    <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50 text-[10px] uppercase font-bold px-2 py-0">
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
