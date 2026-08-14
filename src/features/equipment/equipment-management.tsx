"use client";

import { Badge } from "@/components/ui/badge";
import { ShirtIcon, Activity, Settings, SearchIcon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { parseAsInteger, parseAsString, useQueryStates } from "nuqs";
import {
  getEquipmentTypesService,
  getEquipmentsPaginatedService,
} from "./server/db/equipment.service";
import { NewEquipment } from "./components/new-equipment";
import { UpdateEquipment } from "./components/update-equipment";
import { DeleteEquipment } from "./components/delete-equipment";
import { TableEquipments } from "./components/table-equipments";
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
import {
  EQUIPMENT_TYPES_TAG,
  EQUIPMENTS_TAG,
} from "./constants/equipment.constants";

export function EquipmentManagement() {
  const [searchParams, setSearchParams] = useQueryStates(
    {
      page: parseAsInteger.withDefault(1),
      limit: parseAsInteger.withDefault(10),
      name: parseAsString.withDefault(""),
      typeFilter: parseAsString.withDefault("*"),
    },
    {
      history: "push",
    }
  );

  const allTypesQuery = useQuery({
    queryKey: [EQUIPMENT_TYPES_TAG, "all"],
    queryFn: getEquipmentTypesService,
  });

  const query = useQuery({
    queryKey: [EQUIPMENTS_TAG, searchParams],
    queryFn: () =>
      getEquipmentsPaginatedService({
        page: searchParams.page,
        limit: searchParams.limit,
        ...(!!searchParams.name && { description: searchParams.name }),
        ...(searchParams.typeFilter !== "*" && {
          idEquipmentType: Number(searchParams.typeFilter),
        }),
      }),
  });

  const allTypes = allTypesQuery.data?.data ?? [];

  const debounceName = useDebouncedCallback(
    (text: string) => setSearchParams({ name: text, page: 1 }),
    500
  );

  return (
    <div>
      <section className="mb-4 flex flex-col sm:flex-row sm:justify-between gap-2">
        <div>
          <h1 className="flex items-center gap-x-2 font-semibold text-xl">
            <ShirtIcon />
            Equipos de Bioseguridad
          </h1>
          <p className="text-gray-600 text-sm mt-1">
            Administra los equipos individuales de bioseguridad dentro de
            cada tipo.
          </p>
        </div>
        <div className="flex gap-x-2">
          <NewEquipment />
        </div>
      </section>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Filtros de Búsqueda</CardTitle>
          <CardDescription>
            Filtre los equipos por descripción o tipo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  defaultValue={searchParams.name}
                  onChange={(e) => debounceName(e.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-col w-full">
              <label className="mb-1 text-sm font-medium text-gray-700">
                Filtrar por tipo
              </label>
              <Select
                value={searchParams.typeFilter}
                onValueChange={(value) =>
                  setSearchParams({ typeFilter: value, page: 1 })
                }
              >
                <SelectTrigger className="h-10 w-full border border-gray-300 rounded-md shadow-sm">
                  <SelectValue placeholder="Seleccione un tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="*">Todos</SelectItem>
                  {allTypes.map((type) => (
                    <SelectItem key={type.id} value={String(type.id)}>
                      {type.description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <TableEquipments
        columns={[
          {
            accessorKey: "description",
            header: () => "Descripción",
            cell: ({ row }) => row.original.description,
          },
          {
            accessorKey: "equipmentType",
            header: () => "Tipo",
            cell: ({ row }) =>
              row.original.equipmentType?.description ??
              allTypes.find((t) => t.id === row.original.idEquipmentType)
                ?.description ??
              "—",
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
                <UpdateEquipment equipment={row.original} />
                <DeleteEquipment equipment={row.original} />
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
