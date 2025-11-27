"use client";

import { useState } from "react";
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SearchIcon, MapPin, ChevronLeft, ChevronRight, User, IdCard, Map, MousePointerClick } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getAdresseesByFilterService } from "@/features/addressees/server/addressees.service";
import { Addressees } from "@/features/addressees/domain";
import { toCapitalize } from "@/lib/toCapitalize";
import { useDebouncedCallback } from "use-debounce";

interface Step2AddresseeSelectionProps {
  onSelect: (addressee: Addressees) => void;
  onBack: () => void;
}

export function Step2AddresseeSelection({
  onSelect,
  onBack,
}: Step2AddresseeSelectionProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [itemsPerPage] = useState(5); // Show 5 items per page to fit in the wizard

  // Pedir más datos del backend para compensar el filtrado
  const query = useQuery({
    queryKey: ["addressees", "wizard", searchTerm],
    queryFn: () =>
      getAdresseesByFilterService({
        page: 1,
        limit: 100, // Pedir más datos para tener suficientes después del filtrado
        fullName: searchTerm,
      }),
  });

  const debouncedSearch = useDebouncedCallback((value) => {
    setSearchTerm(value);
    setPage(1);
  }, 500);

  const handleSelect = (addressee: Addressees) => {
    onSelect(addressee);
  };

  // Filtrar solo destinatarios activos (status: true) en el frontend
  const allData = query.data?.data.items ?? [];
  const filteredData = allData.filter((addressee) => addressee.status === true);

  // Paginación en el frontend
  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const data = filteredData.slice(startIndex, endIndex);

  // Meta personalizada para la paginación frontend
  const meta = {
    currentPage: page,
    totalPages: totalPages,
    itemCount: data.length,
    totalItems: totalItems,
    itemsPerPage: itemsPerPage,
  };

  return (
    <div className="space-y-3 sm:space-y-4 w-full">
        {/* Search */}
        <div className="flex items-center gap-2 mb-2">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 z-10 h-4 w-4" />
            <Input
              placeholder="Buscar por nombre, cédula o correo..."
              className="pl-9 h-9 text-sm"
              onChange={(e) => debouncedSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Table */}
        <div className="rounded-lg border w-full shadow-sm">
          <Table className="w-full">
            <TableHeader>
              <TableRow className="bg-teal-600 hover:bg-teal-600">
                <TableHead className="text-white font-bold text-sm py-1.5 px-2"><div className="flex items-center gap-1.5"><User className="h-4 w-4" />DESTINATARIO</div></TableHead>
                <TableHead className="text-white font-bold text-sm py-1.5 px-2"><div className="flex items-center gap-1.5"><MapPin className="h-4 w-4" />DIRECCIÓN</div></TableHead>
                <TableHead className="text-white font-bold text-sm py-1.5 px-2"><div className="flex items-center gap-1.5"><Map className="h-4 w-4" />PROVINCIA</div></TableHead>
                <TableHead className="text-white font-bold text-center text-sm py-1.5 px-2"><div className="flex items-center justify-center gap-1.5"><MousePointerClick className="h-4 w-4" />ACCIÓN</div></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {query.isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-20 text-center text-base">
                    Cargando destinatarios...
                  </TableCell>
                </TableRow>
              ) : data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-20 text-center text-muted-foreground text-base">
                    No se encontraron destinatarios
                  </TableCell>
                </TableRow>
              ) : (
                data.map((addressee) => (
                  <TableRow 
                    key={addressee.id} 
                    className="cursor-pointer hover:bg-teal-50/50 transition-colors border-b"
                    onClick={() => handleSelect(addressee)}
                  >
                    <TableCell className="text-sm py-1.5 px-2">
                      <div className="flex flex-col gap-0">
                        <span className="font-semibold text-sm leading-tight">
                          {toCapitalize(addressee.fullName, true)}
                        </span>
                        <span className="text-xs text-muted-foreground leading-tight">
                          {addressee.email}
                        </span>
                        <span className="text-xs text-muted-foreground font-medium leading-tight">
                          CI: {addressee.identification}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm py-1.5 px-2">
                      {addressee.addresses ? (
                        <div className="flex flex-col gap-0">
                          <span className="font-medium text-sm leading-tight">
                            {toCapitalize(addressee.addresses.canton, true)} -{" "}
                            {toCapitalize(addressee.addresses.province, true)}
                          </span>
                          <span className="text-xs text-muted-foreground leading-tight">
                            {toCapitalize(addressee.addresses.firstStree, true)}
                          </span>
                        </div>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell className="py-1.5 px-2">
                      {addressee.addresses && (
                        <Badge variant="outline" className="text-purple-600 border-purple-200 bg-purple-50 text-xs px-1.5 py-0.5">
                          <MapPin className="w-3 h-3 mr-0.5" />
                          {addressee.addresses.province.toUpperCase()}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-center py-1.5 px-2">
                      <Button
                        size="sm"
                        className="bg-teal-600 hover:bg-teal-700 text-xs px-2.5 h-7"
                        onClick={() => handleSelect(addressee)}
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
        {meta && (meta.totalPages ?? 0) > 1 && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mt-2">
            <div className="text-xs text-muted-foreground">
              Página {meta.currentPage} de {meta.totalPages}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="text-xs"
              >
                <ChevronLeft className="h-3 w-3 mr-1" />
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(meta?.totalPages ?? 0, p + 1))}
                disabled={page === (meta.totalPages ?? 0)}
                className="text-xs"
              >
                Siguiente
                <ChevronRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </div>
        )}

      <div className="flex justify-start pt-2">
        <Button variant="outline" onClick={onBack} className="text-xs h-9 px-4">
          Atrás
        </Button>
      </div>
    </div>
  );
}
