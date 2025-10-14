"use client";

import { useQuery } from "@tanstack/react-query";
import { UsersTable } from "./users-table";
import { NewUser } from "./new-user.form";
import { parseAsInteger, useQueryStates, parseAsString } from "nuqs";
import { getUsersByFilter } from "../server/db/queries.users";
import { toCapitalize } from "../../../lib/toCapitalize";
import { UpdateUserForm } from "./update-user.form";

export function UsersManagement() {
  const [searchParams, setSearchParams] = useQueryStates(
    {
      page: parseAsInteger.withDefault(1),
      limit: parseAsInteger.withDefault(10),
      fullName: parseAsString.withDefault(""),
      email: parseAsString.withDefault(""),
      userName: parseAsString.withDefault(""),
      identification: parseAsString.withDefault(""),
    },
    {
      history: "push",
    }
  );

  const query = useQuery({
    queryKey: ["users", searchParams],
    queryFn: () => getUsersByFilter(searchParams),
  });

  return (
    <div>
      <section className="mb-4 flex justify-between">
        <div>
          <h1 className="font-semibold text-xl">Gestión de Usuarios</h1>
          <p className="text-gray-600 text-sm mt-1">
            Administra la información de todos los usuarios registrados en la
            aplicación.
          </p>
        </div>
        <div>
          <NewUser />
        </div>
      </section>
      <UsersTable
        columns={[
          {
            accessorKey: "userName",
            header: "Nombre de Usuario",
          },
          {
            accessorKey: "email",
            header: "Correo Electrónico",
          },
          {
            accessorKey: "person.code",
            header: "Código",
          },
          {
            accessorKey: "person.identification",
            header: "Identificación",
          },
          {
            accessorKey: "person.fullName",
            header: "Nombre Completo",
            cell: ({ row }) => {
              return (
                <span>
                  {toCapitalize(row.original.person.fullName ?? "", true)}
                </span>
              );
            },
          },
          {
            header: "Acciones",
            cell: ({ row }) => {
              return (
                <div>
                  <UpdateUserForm userId={row.original.id} />
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
