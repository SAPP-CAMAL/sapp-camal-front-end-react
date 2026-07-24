"use client";

import { Badge } from "@/components/ui/badge";
import { UsersIcon, Activity, Settings } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getOrderTypesService } from "./server/db/order-type.service";
import { getAllRolesService } from "@/features/roles/server/db/roles.service";
import { NewOrderType } from "./components/new-order-type";
import { DeleteOrderType } from "./components/delete-order-type";
import { TableOrderTypes } from "./components/table-order-types";
import { ORDER_TYPES_TAG } from "./constants/order-type.constants";

export function OrderTypeManagement() {
  const query = useQuery({
    queryKey: [ORDER_TYPES_TAG],
    queryFn: getOrderTypesService,
  });

  const rolesQuery = useQuery({
    queryKey: ["all-roles"],
    queryFn: getAllRolesService,
  });

  const orderTypes = query.data?.data ?? [];
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
          <NewOrderType existingOrderTypes={orderTypes} />
        </div>
      </section>

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
                <DeleteOrderType orderType={row.original} />
              </div>
            ),
          },
        ]}
        data={orderTypes}
        isLoading={query.isLoading}
      />
    </div>
  );
}
