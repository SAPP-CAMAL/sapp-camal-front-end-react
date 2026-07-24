"use client";

import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { BoxesIcon, Activity, Settings, Tag } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { parseAsString, useQueryStates } from "nuqs";
import { getCleaningCatalogService } from "./server/db/cleaning-catalog.service";
import { NewCleaningCatalog } from "./components/new-cleaning-catalog";
import { UpdateCleaningCatalog } from "./components/update-cleaning-catalog";
import { DeleteCleaningCatalog } from "./components/delete-cleaning-catalog";
import { TableCleaningCatalog } from "./components/table-cleaning-catalog";
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
import { CLEANING_CATALOG_TAG } from "./constants/cleaning-catalog.constants";
import { CLEANING_CATALOG_TYPES } from "./domain/cleaning-catalog.domain";

export function CleaningCatalogManagement() {
  const [searchParams, setSearchParams] = useQueryStates(
    {
      name: parseAsString.withDefault(""),
      type: parseAsString.withDefault("*"),
      status: parseAsString.withDefault("*"),
    },
    {
      history: "push",
    }
  );

  const query = useQuery({
    queryKey: [CLEANING_CATALOG_TAG],
    queryFn: getCleaningCatalogService,
  });

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
      const matchesType =
        searchParams.type !== "*" ? item.type === searchParams.type : true;
      const matchesStatus =
        searchParams.status !== "*"
          ? String(item.status) === searchParams.status
          : true;

      return matchesName && matchesType && matchesStatus;
    });
  }, [query.data, searchParams.name, searchParams.type, searchParams.status]);

  return (
    <div>
      <section className="mb-4 flex flex-col sm:flex-row sm:justify-between gap-2">
        <div>
          <h1 className="flex items-center gap-x-2 font-semibold text-xl">
            <BoxesIcon />
            Estructuras y Materiales de Limpieza
          </h1>
          <p className="text-gray-600 text-sm mt-1">
            Administra el catálogo de estructuras, equipos, utensilios y
            materiales usados en las actas de limpieza y desinfección.
          </p>
        </div>
        <div className="flex gap-x-2">
          <NewCleaningCatalog />
        </div>
      </section>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="flex gap-2 items-center">
            Filtros de Búsqueda
          </CardTitle>
          <CardDescription>
            Filtre los ítems por nombre, tipo o estado
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
                Tipo
              </label>
              <Select
                onValueChange={(value) => setSearchParams({ type: value })}
                defaultValue={searchParams.type}
              >
                <SelectTrigger className="h-10 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <SelectValue placeholder="Seleccione un tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="*">Todos</SelectItem>
                  {CLEANING_CATALOG_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
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

      <TableCleaningCatalog
        columns={[
          {
            accessorKey: "name",
            header: () => (
              <div className="flex items-center gap-2">
                <BoxesIcon className="h-4 w-4" />
                Nombre
              </div>
            ),
            cell: ({ row }) => (
              <div className="flex items-center gap-x-2">
                {row.original.name}
              </div>
            ),
          },
          {
            accessorKey: "type",
            header: () => (
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Tipo
              </div>
            ),
            cell: ({ row }) =>
              row.original.type ? (
                <Badge variant="secondary">{row.original.type}</Badge>
              ) : (
                "—"
              ),
          },
          {
            accessorKey: "description",
            header: () => "Descripción",
            cell: ({ row }) => row.original.description || "—",
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
                <UpdateCleaningCatalog cleaningCatalog={row.original} />
                <DeleteCleaningCatalog cleaningCatalog={row.original} />
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
