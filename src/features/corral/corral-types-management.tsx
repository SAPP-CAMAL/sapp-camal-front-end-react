"use client";

import { Badge } from "@/components/ui/badge";
import { HouseIcon, SearchIcon } from "lucide-react";
import { TableCorralTypes } from "./table-corral-types";
import { useQuery } from "@tanstack/react-query";
import { parseAsInteger, parseAsString, useQueryStates } from "nuqs";
import { getCorralTypesPaginatedService } from "./server/db/corral-type-admin.service";
import { NewCorralType } from "./components/new-corral-type";
import { UpdateCorralType } from "./components/update-corral-type";
import { DeleteCorralType } from "./components/delete-corral-type";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDebouncedCallback } from "use-debounce";

export function CorralTypesManagement() {
  const [searchParams, setSearchParams] = useQueryStates(
    {
      page: parseAsInteger.withDefault(1),
      limit: parseAsInteger.withDefault(10),
      description: parseAsString.withDefault(""),
      status: parseAsString.withDefault("*"),
    },
    { history: "push" }
  );

  const query = useQuery({
    queryKey: ["corral-types-admin", searchParams],
    queryFn: () =>
      getCorralTypesPaginatedService({
        page: searchParams.page,
        limit: searchParams.limit,
        ...(!!searchParams.description && { description: searchParams.description }),
        ...(searchParams.status !== "*" && {
          status: searchParams.status === "true",
        }),
      }),
  });

  const debounceDescription = useDebouncedCallback(
    (text: string) => setSearchParams({ description: text, page: 1 }),
    500
  );

  return (
    <div>
      <section className="mb-4 flex flex-col sm:flex-row sm:justify-between gap-2">
        <div>
          <h1 className="flex items-center gap-x-2 font-semibold text-xl">
            <HouseIcon />
            Tipos de Corral
          </h1>
          <p className="text-gray-600 text-sm mt-1">
            Catálogo de tipos de corral (ej. cuarentena, engorde) usado al registrar corrales.
          </p>
        </div>
        <div className="flex gap-x-2">
          <NewCorralType />
        </div>
      </section>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="flex gap-2 items-center">
            Filtros de Búsqueda
          </CardTitle>
          <CardDescription>
            Filtre los tipos de corral por descripción o estado
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex flex-col w-full">
              <label className="mb-1 text-sm font-medium text-gray-700">
                Buscar por descripción
              </label>
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 z-10 h-5 w-5" />
                <Input
                  type="text"
                  placeholder="Buscar por descripción..."
                  className="pl-10 pr-3 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2"
                  defaultValue={searchParams.description}
                  onChange={(e) => debounceDescription(e.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-col w-full">
              <label className="mb-1 text-sm font-medium text-gray-700">
                Estado
              </label>
              <Select
                onValueChange={(value) => setSearchParams({ status: value, page: 1 })}
                defaultValue={searchParams.status}
              >
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

      <TableCorralTypes
        columns={[
          {
            accessorKey: "description",
            header: () => (
              <div className="flex items-center gap-2">
                <HouseIcon className="h-4 w-4" />
                Descripción
              </div>
            ),
            cell: ({ row }) => <span className="font-medium">{row.original.description}</span>,
          },
          {
            accessorKey: "code",
            header: () => <div>Código</div>,
            cell: ({ row }) => <span className="text-xs text-gray-500">{row.original.code}</span>,
          },
          {
            accessorKey: "status",
            header: () => <div>Estado</div>,
            cell: ({ row }) => <Badge>{row.original.status ? "Activo" : "Inactivo"}</Badge>,
          },
          {
            id: "actions",
            header: () => <div className="flex items-center justify-center">Acciones</div>,
            cell: ({ row }) => (
              <div className="flex justify-center gap-x-2">
                <UpdateCorralType corralType={row.original} />
                <DeleteCorralType corralType={row.original} />
              </div>
            ),
          },
        ]}
        data={query.data?.data.items ?? []}
        meta={{
          ...query.data?.data.meta,
          onChangePage: (page) => setSearchParams({ page }),
          onNextPage: () => setSearchParams({ page: searchParams.page + 1 }),
          disabledNextPage: searchParams.page >= (query.data?.data.meta.totalPages ?? 0),
          onPreviousPage: () => setSearchParams({ page: searchParams.page - 1 }),
          disabledPreviousPage: searchParams.page <= 1,
          setSearchParams,
        }}
        isLoading={query.isLoading}
      />
    </div>
  );
}
