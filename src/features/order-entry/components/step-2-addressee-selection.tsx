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
  const [limit] = useState(5); // Show 5 items per page to fit in the wizard

  const query = useQuery({
    queryKey: ["addressees", "wizard", searchTerm, page, limit],
    queryFn: () =>
      getAdresseesByFilterService({
        page,
        limit,
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

  const data = query.data?.data.items ?? [];
  const meta = query.data?.data.meta;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-700">
          2.- Seleccionar Destinatario
        </CardTitle>
        <CardDescription>
          Seleccione el destinatario para este ingreso
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 z-10 h-4 w-4" />
            <Input
              placeholder="Buscar por nombre..."
              className="pl-9"
              onChange={(e) => debouncedSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow className="bg-teal-600 hover:bg-teal-600">
                <TableHead className="text-white font-bold"><div className="flex items-center gap-2"><User className="h-4 w-4" />DESTINATARIO</div></TableHead>
                <TableHead className="text-white font-bold"><div className="flex items-center gap-2"><IdCard className="h-4 w-4" />IDENTIFICACIÓN</div></TableHead>
                <TableHead className="text-white font-bold"><div className="flex items-center gap-2"><MapPin className="h-4 w-4" />DIRECCIÓN</div></TableHead>
                <TableHead className="text-white font-bold"><div className="flex items-center gap-2"><Map className="h-4 w-4" />PROVINCIA</div></TableHead>
                <TableHead className="text-white font-bold text-center"><div className="flex items-center justify-center gap-2"><MousePointerClick className="h-4 w-4" />ACCIÓN</div></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {query.isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    Cargando destinatarios...
                  </TableCell>
                </TableRow>
              ) : data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                    No se encontraron destinatarios
                  </TableCell>
                </TableRow>
              ) : (
                data.map((addressee) => (
                  <TableRow 
                    key={addressee.id} 
                    className="cursor-pointer hover:bg-teal-50/50 transition-colors"
                    onClick={() => handleSelect(addressee)}
                  >
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {toCapitalize(addressee.fullName, true)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {addressee.email}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{addressee.identification}</TableCell>
                    <TableCell>
                      {addressee.addresses?.[0] ? (
                        <div className="flex flex-col text-sm">
                          <span className="font-medium">
                            {toCapitalize(addressee.addresses[0].canton, true)} -{" "}
                            {toCapitalize(addressee.addresses[0].province, true)}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {toCapitalize(addressee.addresses[0].firstStree, true)}
                          </span>
                        </div>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell>
                      {addressee.addresses?.[0] && (
                        <Badge variant="outline" className="text-purple-600 border-purple-200 bg-purple-50">
                          <MapPin className="w-3 h-3 mr-1" />
                          {addressee.addresses[0].province.toUpperCase()}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        size="sm"
                        className="bg-teal-600 hover:bg-teal-700"
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
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Página {meta.currentPage} de {meta.totalPages}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(meta?.totalPages ?? 0, p + 1))}
                disabled={page === (meta.totalPages ?? 0)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        <div className="flex justify-start pt-2">
          <Button variant="outline" onClick={onBack}>
            Atrás
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
