"use client";

import { Badge } from "@/components/ui/badge";
import { SearchIcon, SparklesIcon } from "lucide-react";
import { TableFinishTypes } from "./table-finish-types";
import { useQuery } from "@tanstack/react-query";
import { parseAsInteger, parseAsString, useQueryStates } from "nuqs";
import { useDebouncedCallback } from "use-debounce";
import {
  getFinishTypesAdminService,
  getSpeciesAllService,
} from "./server/db/finish-type-admin.service";
import { NewFinishType } from "./components/new-finish-type";
import { UpdateFinishType } from "./components/update-finish-type";
import { DeleteFinishType } from "./components/delete-finish-type";
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

export function FinishTypesManagement() {
  const [searchParams, setSearchParams] = useQueryStates(
    {
      page: parseAsInteger.withDefault(1),
      limit: parseAsInteger.withDefault(10),
      name: parseAsString.withDefault(""),
      idSpecie: parseAsString.withDefault("*"),
    },
    { history: "push" }
  );

  const speciesQuery = useQuery({
    queryKey: ["species", "all-for-select"],
    queryFn: getSpeciesAllService,
  });
  const activeSpecies = (speciesQuery.data?.data ?? []).filter((s) => s.status);

  const query = useQuery({
    queryKey: ["finish-types-admin", searchParams],
    queryFn: () =>
      getFinishTypesAdminService({
        page: searchParams.page,
        limit: searchParams.limit,
        ...(!!searchParams.name && { name: searchParams.name }),
        ...(searchParams.idSpecie !== "*" && { idSpecie: Number(searchParams.idSpecie) }),
      }),
  });

  const debounceName = useDebouncedCallback(
    (text: string) => setSearchParams({ name: text, page: 1 }),
    500
  );

  return (
    <div>
      <section className="mb-4 flex flex-col sm:flex-row sm:justify-between gap-2">
        <div>
          <h1 className="flex items-center gap-x-2 font-semibold text-xl">
            <SparklesIcon />
            Tipos de Acabado
          </h1>
          <p className="text-gray-600 text-sm mt-1">
            Catálogo de tipos de acabado de animal por especie (ej. depilado, chamuscado).
          </p>
        </div>
        <div className="flex gap-x-2">
          <NewFinishType />
        </div>
      </section>

      <Card className="mb-4 py-3 gap-2">
        <CardHeader className="px-4 gap-0.5">
          <CardTitle className="flex gap-2 items-center text-sm">
            Filtros de Búsqueda
          </CardTitle>
          <CardDescription className="text-xs">
            Filtre los tipos de acabado por nombre o especie
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col w-full">
              <label className="mb-1 text-sm font-medium text-gray-700">
                Buscar por nombre
              </label>
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 z-10 h-5 w-5" />
                <Input
                  type="text"
                  placeholder="Buscar por nombre..."
                  className="pl-10 pr-3 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2"
                  defaultValue={searchParams.name}
                  onChange={(e) => debounceName(e.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-col w-full">
              <label className="mb-1 text-sm font-medium text-gray-700">
                Especie
              </label>
              <Select
                onValueChange={(value) => setSearchParams({ idSpecie: value, page: 1 })}
                defaultValue={searchParams.idSpecie}
              >
                <SelectTrigger className="h-10 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <SelectValue placeholder="Seleccione una especie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="*">Todas</SelectItem>
                  {activeSpecies.map((specie) => (
                    <SelectItem key={specie.id} value={String(specie.id)}>
                      {specie.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <TableFinishTypes
        columns={[
          {
            accessorKey: "name",
            header: () => (
              <div className="flex items-center gap-2">
                <SparklesIcon className="h-4 w-4" />
                Nombre
              </div>
            ),
            cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
          },
          {
            accessorKey: "specie",
            header: () => <div>Especie</div>,
            cell: ({ row }) => <span>{row.original.specie?.name ?? "-"}</span>,
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
                <UpdateFinishType finishType={row.original} />
                <DeleteFinishType finishType={row.original} />
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
