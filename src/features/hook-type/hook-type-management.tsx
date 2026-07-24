"use client";

import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { LinkIcon, Weight, PawPrint, FileText, Activity, Settings } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { parseAsString, useQueryStates } from "nuqs";
import { getHookTypesService } from "./server/db/hook-type.service";
import { NewHookType } from "./components/new-hook-type";
import { UpdateHookType } from "./components/update-hook-type";
import { DeleteHookType } from "./components/delete-hook-type";
import { TableHookType } from "./components/table-hook-type";
import { toCapitalize } from "@/lib/toCapitalize";
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
import { useAllSpecies } from "@/features/specie/hooks";
import { HOOK_TYPE_TAG } from "./constants/hook-type.constants";

export function HookTypeManagement() {
  const [searchParams, setSearchParams] = useQueryStates(
    {
      name: parseAsString.withDefault(""),
      status: parseAsString.withDefault("*"),
      idSpecie: parseAsString.withDefault("*"),
    },
    {
      history: "push",
    }
  );

  const query = useQuery({
    queryKey: [HOOK_TYPE_TAG],
    queryFn: getHookTypesService,
  });

  const { data: speciesResponse } = useAllSpecies();
  const species = useMemo(() => speciesResponse?.data ?? [], [speciesResponse]);
  const speciesById = useMemo(
    () => new Map(species.map((specie) => [specie.id, specie.name])),
    [species]
  );

  const debounceName = useDebouncedCallback(
    (text: string) => setSearchParams({ name: text }),
    500
  );

  const filteredData = useMemo(() => {
    const items = query.data?.data ?? [];

    return items.filter((item) => {
      const matchesName = searchParams.name
        ? item.name.toLowerCase().includes(searchParams.name.toLowerCase())
        : true;
      const matchesStatus =
        searchParams.status !== "*"
          ? String(item.status) === searchParams.status
          : true;
      const matchesSpecie =
        searchParams.idSpecie !== "*"
          ? String(item.idSpecie) === searchParams.idSpecie
          : true;

      return matchesName && matchesStatus && matchesSpecie;
    });
  }, [query.data, searchParams.name, searchParams.status, searchParams.idSpecie]);

  return (
    <div>
      <section className="mb-4 flex flex-col sm:flex-row sm:justify-between gap-2">
        <div>
          <h1 className="flex items-center gap-x-2 font-semibold text-xl">
            <LinkIcon />
            Tipos de Gancho
          </h1>
          <p className="text-gray-600 text-sm mt-1">
            Administra los tipos de gancho de faenamiento por especie.
          </p>
        </div>
        <div className="flex gap-x-2">
          <NewHookType />
        </div>
      </section>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="flex gap-2 items-center">
            Filtros de Búsqueda
          </CardTitle>
          <CardDescription>
            Filtre los tipos de gancho por nombre, especie o estado
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
                onValueChange={(value) => setSearchParams({ idSpecie: value })}
                defaultValue={searchParams.idSpecie}
              >
                <SelectTrigger className="h-10 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <SelectValue placeholder="Seleccione una especie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="*">Todas</SelectItem>
                  {species.map((specie) => (
                    <SelectItem key={specie.id} value={String(specie.id)}>
                      {specie.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col w-full">
              <label className="mb-1 text-sm font-medium text-gray-700">
                Estado
              </label>
              <Select
                onValueChange={(value) => setSearchParams({ status: value })}
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

      <TableHookType
        columns={[
          {
            accessorKey: "name",
            header: () => (
              <div className="flex items-center gap-2">
                <LinkIcon className="h-4 w-4" />
                Nombre
              </div>
            ),
            cell: ({ row }) => (
              <div className="flex items-center gap-x-2">
                {toCapitalize(row.original.name, true)}
              </div>
            ),
          },
          {
            accessorKey: "weight",
            header: () => (
              <div className="flex items-center gap-2">
                <Weight className="h-4 w-4" />
                Peso
              </div>
            ),
            cell: ({ row }) => <span>{row.original.weight}</span>,
          },
          {
            accessorKey: "idSpecie",
            header: () => (
              <div className="flex items-center gap-2">
                <PawPrint className="h-4 w-4" />
                Especie
              </div>
            ),
            cell: ({ row }) => (
              <span>{speciesById.get(row.original.idSpecie) ?? "-"}</span>
            ),
          },
          {
            accessorKey: "description",
            header: () => (
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Descripción
              </div>
            ),
            cell: ({ row }) => (
              <span>{toCapitalize(row.original.description ?? "")}</span>
            ),
          },
          {
            accessorKey: "status",
            header: () => (
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Estado
              </div>
            ),
            cell: ({ row }) => (
              <Badge>{row.original.status ? "Activo" : "Inactivo"}</Badge>
            ),
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
                <UpdateHookType hookType={row.original} />
                <DeleteHookType hookType={row.original} />
              </div>
            ),
          },
        ]}
        data={filteredData}
        isLoading={query.isLoading}
      />
    </div>
  );
}
