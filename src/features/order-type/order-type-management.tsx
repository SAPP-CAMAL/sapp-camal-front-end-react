"use client";

import { Badge } from "@/components/ui/badge";
import { UsersIcon, Activity, Settings } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { parseAsInteger, parseAsString, useQueryStates } from "nuqs";
import {
  getOrderTypesPaginatedService,
  getOrderTypesService,
} from "./server/db/order-type.service";
import { getAllRolesService } from "@/features/roles/server/db/roles.service";
import { NewOrderType } from "./components/new-order-type";
import { UpdateOrderType } from "./components/update-order-type";
import { DeleteOrderType } from "./components/delete-order-type";
import { TableOrderTypes } from "./components/table-order-types";
import { ORDER_TYPES_TAG } from "./constants/order-type.constants";
import {
  Card,
  CardContent,
  CardDescription,
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

export function OrderTypeManagement() {
  const [searchParams, setSearchParams] = useQueryStates(
    {
      page: parseAsInteger.withDefault(1),
      limit: parseAsInteger.withDefault(10),
      idRol: parseAsString.withDefault("*"),
      status: parseAsString.withDefault("*"),
    },
    {
      history: "push",
    }
  );

  const allQuery = useQuery({
    queryKey: [ORDER_TYPES_TAG, "all"],
    queryFn: getOrderTypesService,
  });

  const query = useQuery({
    queryKey: [ORDER_TYPES_TAG, searchParams],
    queryFn: () =>
      getOrderTypesPaginatedService({
        page: searchParams.page,
        limit: searchParams.limit,
        ...(searchParams.idRol !== "*" && {
          idRol: Number(searchParams.idRol),
        }),
        ...(searchParams.status !== "*" && {
          status: searchParams.status === "true",
        }),
      }),
  });

  const rolesQuery = useQuery({
    queryKey: ["all-roles"],
    queryFn: getAllRolesService,
  });

  const existingOrderTypes = allQuery.data?.data ?? [];
  const roles = rolesQuery.data?.data ?? [];

  return (
    <div>
      <section className="mb-4 flex flex-col sm:flex-row sm:justify-between gap-2">
        <div>
          <h1 className="flex items-center gap-x-2 font-semibold text-xl">
            <UsersIcon />
            Tipos de Pedido por Rol
          </h1>
          <p className="text-gray-600 text-sm mt-1">
            Administra qué roles están habilitados para generar pedidos de
            distribución.
          </p>
        </div>
        <div className="flex gap-x-2">
          <NewOrderType existingOrderTypes={existingOrderTypes} />
        </div>
      </section>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="flex gap-2 items-center">
            Filtros de Búsqueda
          </CardTitle>
          <CardDescription>
            Filtre los roles habilitados por rol o estado
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex flex-col w-full">
              <label className="mb-1 text-sm font-medium text-gray-700">
                Rol
              </label>
              <Select
                value={searchParams.idRol}
                onValueChange={(value) =>
                  setSearchParams({ idRol: value, page: 1 })
                }
              >
                <SelectTrigger className="h-10 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <SelectValue placeholder="Seleccione un rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="*">Todos</SelectItem>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={String(role.id)}>
                      {role.name}
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
                onValueChange={(value) =>
                  setSearchParams({ status: value, page: 1 })
                }
                value={searchParams.status}
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

      <TableOrderTypes
        columns={[
          {
            accessorKey: "idRol",
            header: () => (
              <div className="flex items-center gap-2">
                <UsersIcon className="h-4 w-4" />
                Rol
              </div>
            ),
            cell: ({ row }) =>
              roles.find((r) => r.id === row.original.idRol)?.name ??
              `Rol #${row.original.idRol}`,
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
                <UpdateOrderType
                  orderType={row.original}
                  existingOrderTypes={existingOrderTypes}
                />
                <DeleteOrderType orderType={row.original} />
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
