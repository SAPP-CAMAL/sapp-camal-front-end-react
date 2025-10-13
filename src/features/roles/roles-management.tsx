"use client";

import { Badge } from "@/components/ui/badge";
import { TableRoles } from "./table-roles";
import { useQuery } from "@tanstack/react-query";
import { parseAsInteger, parseAsString, useQueryStates } from "nuqs";
import { getRolesService } from "./server/db/roles.service";
import { FileTextIcon, ShieldIcon, SquarePenIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NewRol } from "./components/new-role";
import { UpdateRol } from "./components/update-rol";
import { toCapitalize } from "@/lib/toCapitalize";

export function RolesManagement() {
  const [searchParams, setSearchParams] = useQueryStates(
    {
      page: parseAsInteger.withDefault(1),
      limit: parseAsInteger.withDefault(10),
      name: parseAsString.withDefault(""),
      status: parseAsString.withDefault("*"),
    },
    {
      history: "push",
    }
  );

  const query = useQuery({
    queryKey: ["roles", searchParams],
    queryFn: () =>
      getRolesService({
        page: searchParams.page,
        limit: searchParams.limit,
        ...(!!searchParams.name && { name: searchParams.name }),
        ...(searchParams.status !== "*" && {
          status: Boolean(searchParams.status),
        }),
      }),
  });

  return (
    <div>
      <section className="mb-4 flex justify-between">
        <div>
          <div>
            <h1 className="flex items-center gap-x-2 font-semibold text-xl">
              <ShieldIcon />
              Gestión de Roles
            </h1>
            <p className="text-gray-600 text-sm mt-1">
              Administra los roles del sistema con asignación de menús y
              permisos granulares.
            </p>
          </div>
        </div>
        <div className="flex gap-x-2">
          <Button variant={"outline"}>
            <FileTextIcon />
            Exportar
          </Button>
          <Button variant={"outline"}>
            <SquarePenIcon />
            Exportar
          </Button>
          <NewRol />
        </div>
      </section>
      <TableRoles
        columns={[
          {
            accessorKey: "name",
            header: "Nombre",
            cell: ({ row }) => (
              <div className="flex items-center gap-x-2">
                <p className="bg-gray-900 h-2 w-2 rounded-full" />
                {toCapitalize(row.original.name, true)}
              </div>
            ),
          },
          {
            accessorKey: "description",
            header: "Descripción",
            cell: ({ row }) => <span>{toCapitalize(row.original.description ?? '')}</span>,
          },
          {
            accessorKey: "status",
            header: "Estado",
            cell: ({ row }) => (
              <Badge>{row.original.status ? "Activo" : "Inactivo"}</Badge>
            ),
          },
          {
            accessorKey: "id",
            header: "Fecha de Creación",
            cell: ({}) => <span>{new Date().toLocaleDateString()}</span>,
          },
          {
            header: "Acciones",
            cell: ({ row }) => {
              return (
                <div>
                  <UpdateRol role={row.original} />
                </div>
              );
            },
          },
        ]}
        data={query.data?.data.items ?? []}
        meta={{
          ...query.data?.data.meta,
          onChangePage: (page) => {
            setSearchParams({ page });
          },
          onNextPage: () => {
            setSearchParams({ page: searchParams.page + 1 });
          },
          disabledNextPage:
            searchParams.page >= (query.data?.data.meta.totalPages ?? 0),
          onPreviousPage: () => {
            setSearchParams({ page: searchParams.page - 1 });
          },
          disabledPreviousPage: searchParams.page <= 1,
          setSearchParams,
        }}
        isLoading={query.isLoading}
      />
    </div>
  );
}
