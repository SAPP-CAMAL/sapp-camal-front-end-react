"use client";

import { Badge } from "@/components/ui/badge";
import { HardHatIcon, Activity, Settings, SearchIcon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { parseAsInteger, parseAsString, useQueryStates } from "nuqs";
import { getEquipmentTypesPaginatedService } from "./server/db/equipment.service";
import { NewEquipmentType } from "./components/new-equipment-type";
import { UpdateEquipmentType } from "./components/update-equipment-type";
import { DeleteEquipmentType } from "./components/delete-equipment-type";
import { TableEquipmentTypes } from "./components/table-equipment-types";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useDebouncedCallback } from "use-debounce";
import { EQUIPMENT_TYPES_TAG } from "./constants/equipment.constants";

export function EquipmentTypeManagement() {
  const [searchParams, setSearchParams] = useQueryStates(
    {
      page: parseAsInteger.withDefault(1),
      limit: parseAsInteger.withDefault(10),
      name: parseAsString.withDefault(""),
    },
    {
      history: "push",
    }
  );

  const query = useQuery({
    queryKey: [EQUIPMENT_TYPES_TAG, searchParams],
    queryFn: () =>
      getEquipmentTypesPaginatedService({
        page: searchParams.page,
        limit: searchParams.limit,
        ...(!!searchParams.name && { description: searchParams.name }),
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
            <HardHatIcon />
            Tipos de Equipo de Bioseguridad
          </h1>
          <p className="text-gray-600 text-sm mt-1">
            Administra los tipos de equipo de bioseguridad (lavamanos, arcos
            sanitarios, etc.).
          </p>
        </div>
        <div className="flex gap-x-2">
          <NewEquipmentType />
        </div>
      </section>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Filtros de Búsqueda</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-w-xs">
            <label className="mb-1 text-sm font-medium text-gray-700 block">
              Buscar por descripción
            </label>
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 z-10 h-5 w-5" />
              <Input
                type="text"
                placeholder="Buscar por descripción..."
                className="pl-10 pr-3 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2"
                defaultValue={searchParams.name}
                onChange={(e) => debounceName(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <TableEquipmentTypes
        columns={[
          {
            accessorKey: "description",
            header: () => "Descripción",
            cell: ({ row }) => row.original.description,
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
                <UpdateEquipmentType equipmentType={row.original} />
                <DeleteEquipmentType equipmentType={row.original} />
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
