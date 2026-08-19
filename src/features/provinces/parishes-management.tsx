"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { LandPlotIcon, Activity, Settings } from "lucide-react";
import { TableLocation } from "./table-location";
import { useQuery } from "@tanstack/react-query";
import { getParishesAdminService } from "./server/db/locations-admin.service";
import { NewParish } from "./components/new-parish";
import { UpdateParish } from "./components/update-parish";
import { DeleteParish } from "./components/delete-parish";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SearchIcon } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDebouncedCallback } from "use-debounce";

export function ParishesManagement({ fixedCantonId }: { fixedCantonId: number }) {
  const [page, setPage] = useState(1);
  const limit = 10;
  const [name, setName] = useState("");
  const [status, setStatus] = useState<string>("*");

  const query = useQuery({
    queryKey: ["parishes-admin", { page, limit, name, cantonId: fixedCantonId, status }],
    queryFn: () =>
      getParishesAdminService({
        page,
        limit,
        cantonId: fixedCantonId,
        ...(!!name && { name }),
        ...(status !== "*" && { status }),
      }),
  });

  const debounceName = useDebouncedCallback((text: string) => {
    setName(text);
    setPage(1);
  }, 500);

  return (
    <div>
      <div className="flex justify-end mb-4">
        <NewParish fixedCantonId={fixedCantonId} />
      </div>

      <Card className="mb-4 py-3 gap-2">
        <CardHeader className="px-4 gap-0.5">
          <CardTitle className="text-sm">Filtros de Búsqueda</CardTitle>
          <CardDescription className="text-xs">Filtre las parroquias por nombre o estado</CardDescription>
        </CardHeader>
        <CardContent className="px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col w-full">
              <label className="mb-1 text-sm font-medium text-gray-700">Buscar por nombre</label>
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 z-10 h-5 w-5" />
                <Input
                  type="text"
                  placeholder="Buscar por nombre..."
                  className="pl-10 pr-3 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2"
                  defaultValue={name}
                  onChange={(e) => debounceName(e.target.value)}
                />
              </div>
            </div>
            <div className="flex flex-col w-full">
              <label className="mb-1 text-sm font-medium text-gray-700">Estado</label>
              <Select onValueChange={(value) => { setStatus(value); setPage(1); }} defaultValue={status}>
                <SelectTrigger className="h-10 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <SelectValue placeholder="Seleccione un estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="*">Todos</SelectItem>
                  <SelectItem value="true">Activos</SelectItem>
                  <SelectItem value="false">Inactivos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <TableLocation
        title="Parroquias"
        columns={[
          {
            accessorKey: "name",
            header: () => (
              <div className="flex items-center gap-2">
                <LandPlotIcon className="h-4 w-4" />
                Nombre
              </div>
            ),
            cell: ({ row }) => <span>{row.original.name}</span>,
          },
          {
            accessorKey: "code",
            header: () => <div>Código</div>,
            cell: ({ row }) => <span className="text-xs text-gray-500">{row.original.code}</span>,
          },
          {
            accessorKey: "status",
            header: () => (
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Estado
              </div>
            ),
            cell: ({ row }) => <Badge>{row.original.status ? "Activo" : "Inactivo"}</Badge>,
          },
          {
            id: "actions",
            header: () => (
              <div className="flex items-center justify-center gap-2">
                <Settings className="h-4 w-4" />
                Acciones
              </div>
            ),
            cell: ({ row }) => (
              <div className="flex justify-center gap-x-2">
                <UpdateParish parish={row.original} fixedCantonId={fixedCantonId} />
                <DeleteParish parish={row.original} />
              </div>
            ),
          },
        ]}
        data={query.data?.data.items ?? []}
        meta={{
          ...query.data?.data.meta,
          onChangePage: (p) => setPage(p),
          onNextPage: () => setPage((p) => p + 1),
          disabledNextPage: page >= (query.data?.data.meta.totalPages ?? 0),
          onPreviousPage: () => setPage((p) => p - 1),
          disabledPreviousPage: page <= 1,
          setSearchParams: () => {},
        }}
        isLoading={query.isLoading}
      />
    </div>
  );
}
