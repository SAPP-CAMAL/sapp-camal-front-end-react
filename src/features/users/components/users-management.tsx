"use client";

import { useQuery } from "@tanstack/react-query";
import { UsersTable } from "./users-table";
import { NewPerson } from "./new-person.form";
import { parseAsInteger, useQueryStates, parseAsString } from "nuqs";
import { Badge } from "@/components/ui/badge";
import { UpdatePerson } from "./update-person.form";
import { getUserPersonByFilterService } from "@/features/security/server/db/security.queries";

export function UsersManagement() {
  const [searchParams, setSearchParams] = useQueryStates(
    {
      page: parseAsInteger.withDefault(1),
      limit: parseAsInteger.withDefault(10),
      status: parseAsString.withDefault("todos"),
      identification: parseAsString.withDefault(""),
      fullName: parseAsString.withDefault(""),
      isEmployee: parseAsString.withDefault("*"),
    },
    {
      history: "push",
    }
  );

  const query = useQuery({
    queryKey: ["people", searchParams],
    queryFn: () => getUserPersonByFilterService(),
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
          <NewPerson />
        </div>
      </section>
      <UsersTable
        columns={[
          {
            accessorKey: "fullName",
            header: "Nombres",
          },
          // {
          //   accessorKey: "isEmployee",
          //   header: "Personal Camal",
          //   cell: ({ row }) => (
          //     <Badge variant={"outline"}>
          //       {row.original.isEmployee ? "Si" : "No"}
          //     </Badge>
          //   ),
          // },
          // {
          //   accessorKey: "status",
          //   header: "Estado",
          //   cell: ({ row }) => (
          //     <Badge>{row.original.status ? "Activo" : "Inactivo"}</Badge>
          //   ),
          // },
          {
            header: "Acciones",
            cell: ({ row }) => {
              return (
                <div>
                  {/* <UpdatePerson person={row.original} /> */}
                </div>
              );
            },
          },
        ]}
        data={query.data?.data ?? []}
        // meta={{
        //   ...query.data?.data.meta,
        //   onChangePage: (page) => {
        //     setSearchParams({ page });
        //   },
        //   onNextPage: () => {
        //     setSearchParams({ page: searchParams.page + 1 });
        //   },
        //   disabledNextPage:
        //     searchParams.page >= (query.data?.data.meta.totalPages ?? 0),
        //   onPreviousPage: () => {
        //     setSearchParams({ page: searchParams.page - 1 });
        //   },
        //   disabledPreviousPage: searchParams.page <= 1,
        //   setSearchParams,
        // }}
        // isLoading={query.isLoading}
      />
    </div>
  );
}
