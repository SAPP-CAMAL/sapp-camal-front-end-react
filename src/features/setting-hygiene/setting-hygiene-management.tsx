"use client";

import { Badge } from "@/components/ui/badge";
import { ShieldCheckIcon } from "lucide-react";
import { TableSettingHygiene } from "./table-setting-hygiene";
import { useQuery } from "@tanstack/react-query";
import {
  getSettingHygieneAdminPaginatedService,
  getSettingHygieneAdminService,
} from "./server/db/setting-hygiene-admin.service";
import { NewSettingHygiene } from "./components/new-setting-hygiene";
import { UpdateSettingHygiene } from "./components/update-setting-hygiene";
import { DeleteSettingHygiene } from "./components/delete-setting-hygiene";
import { parseAsInteger, parseAsString, useQueryStates } from "nuqs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function SettingHygieneManagement() {
  const [searchParams, setSearchParams] = useQueryStates(
    {
      page: parseAsInteger.withDefault(1),
      limit: parseAsInteger.withDefault(10),
      status: parseAsString.withDefault("*"),
    },
    {
      history: "push",
    }
  );

  const allQuery = useQuery({
    queryKey: ["setting-hygiene-admin", "all"],
    queryFn: getSettingHygieneAdminService,
  });

  const query = useQuery({
    queryKey: ["setting-hygiene-admin", searchParams],
    queryFn: () =>
      getSettingHygieneAdminPaginatedService({
        page: searchParams.page,
        limit: searchParams.limit,
        ...(searchParams.status !== "*" && {
          status: searchParams.status === "true",
        }),
      }),
  });

  const activeEquipmentIds = (allQuery.data?.data ?? [])
    .filter((r) => r.status)
    .map((r) => r.idEquipment);

  return (
    <div>
      <section className="mb-4 flex flex-col sm:flex-row sm:justify-between gap-2">
        <div>
          <h1 className="flex items-center gap-x-2 font-semibold text-xl">
            <ShieldCheckIcon />
            Configuración de Higiene por Equipo
          </h1>
          <p className="text-gray-600 text-sm mt-1">
            Define qué equipos requieren control de higiene, usado en los registros de Control de Higiene.
          </p>
        </div>
        <div className="flex gap-x-2">
          <NewSettingHygiene excludeEquipmentIds={activeEquipmentIds} />
        </div>
      </section>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="flex gap-2 items-center">
            Filtros de Búsqueda
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex flex-col w-full">
              <label className="mb-1 text-sm font-medium text-gray-700">
                Estado
              </label>
              <Select
                onValueChange={(value) =>
                  setSearchParams({ status: value, page: 1 })
                }
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

      <TableSettingHygiene
        columns={[
          {
            accessorKey: "equipment",
            header: () => (
              <div className="flex items-center gap-2">
                <ShieldCheckIcon className="h-4 w-4" />
                Equipo
              </div>
            ),
            cell: ({ row }) => <span className="font-medium">{row.original.equipment?.description ?? "-"}</span>,
          },
          {
            accessorKey: "equipmentType",
            header: () => <div>Tipo de equipo</div>,
            cell: ({ row }) => <span>{row.original.equipment?.equipmentType?.description ?? "-"}</span>,
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
                <UpdateSettingHygiene
                  settingHygiene={row.original}
                  excludeEquipmentIds={activeEquipmentIds.filter((id) => id !== row.original.idEquipment)}
                />
                <DeleteSettingHygiene settingHygiene={row.original} />
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
