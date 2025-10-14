"use client";

import { useQuery } from "@tanstack/react-query";
import { PeopleTable } from "./table-people";
import { getPeopleByFilterService } from "../server/db/people.service";
import { NewPerson } from "./new-person.form";
import { parseAsInteger, useQueryStates, parseAsString } from "nuqs";
import { Badge } from "@/components/ui/badge";
import { UpdatePerson } from "./update-person.form";

export function PeopleManagement({}) {
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
    queryFn: () =>
      getPeopleByFilterService({
        page: searchParams.page,
        limit: searchParams.limit,
        ...(searchParams.status === "activos"
          ? { status: true }
          : searchParams.status === "inactivos"
          ? { status: false }
          : {}),
        identificacion: searchParams.identification,
        ...(searchParams.fullName.length > 2 && {
          fullName: searchParams.fullName,
        }),
        ...(searchParams.isEmployee === "true" && { isEmployee: true }),
      }),
  });

  return (
    <div>
      <section className="mb-4 flex justify-between">
        <div>
          <h1 className="font-semibold text-xl">Gestión de Personas</h1>
          <p className="text-gray-600 text-sm mt-1">
            Administra la información de todas las personas en el sistema
          </p>
        </div>
        <div>
          <NewPerson />
        </div>
      </section>
      <PeopleTable
        columns={[
          {
            accessorKey: "code",
            header: "Código",
          },
          {
            accessorKey: "fullName",
            header: "Nombre Completo",
            cell: ({ row }) => (
              <div className="flex items-center gap-x-2">
                <div>{row.original.firstName}</div>
                <div>{row.original.lastName}</div>
              </div>
            ),
          },
          {
            accessorKey: "identificationType.code",
            header: "Tipo ID",
            cell: ({ row }) => (
              <Badge variant={"outline"}>
                {row.original.identificationType?.description}
              </Badge>
            ),
          },
          {
            accessorKey: "identification",
            header: "Identificación",
          },
          {
            accessorKey: "isEmployee",
            header: "Personal Camal",
            cell: ({ row }) => (
              <Badge variant={"outline"}>
                {row.original.isEmployee ? "Si" : "No"}
              </Badge>
            ),
          },
          {
            accessorKey: "status",
            header: "Estado",
            cell: ({ row }) => (
              <Badge>{row.original.status ? "Activo" : "Inactivo"}</Badge>
            ),
          },
          {
            header: "Acciones",
            cell: ({ row }) => {
              return (
                <div>
                  <UpdatePerson person={row.original} />
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
