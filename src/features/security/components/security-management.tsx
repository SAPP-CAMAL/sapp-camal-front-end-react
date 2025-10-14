"use client";

import { Badge } from "@/components/ui/badge";
import { TableStaffList } from "./table-staff-list";
import { parseAsInteger, parseAsString, useQueryStates } from "nuqs";
import { getPeopleByFilterService } from "@/features/people/server/db/people.service";
import { useQuery } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function SecurityManagement() {
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
          <h1 className="font-semibold text-xl">Personal</h1>
          <p className="text-gray-600 text-sm mt-1">
            Administra el personal del sistema con roles operativos
          </p>
        </div>
        <div>{/* <NewPerson /> */}</div>
      </section>
      <TableStaffList
        columns={[
          {
            accessorKey: "code",
            header: "Usuario",
            cell: ({ row }) => (
              <div className="flex gap-x-2 items-center">
                <Avatar>
                  <AvatarImage src="https://github.com/shadcnxxx.png" />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">María González</p>
                  <p className="text-gray-500">maria.gonzalez@empresa.com</p>
                </div>
              </div>
            ),
          },
          {
            accessorKey: "identification",
            header: "Identificación",
          },
          {
            accessorKey: "identificationType.code",
            header: "Roles",
            cell: ({ row }) => (
              <Badge variant={"outline"}>
                {row.original.identificationType?.description}
              </Badge>
            ),
          },
          {
            accessorKey: "status",
            header: "Estado",
            cell: ({ row }) => (
              <Badge
                className={
                  row.original.status
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }
                variant={"outline"}
              >
                {row.original.status ? "Activo" : "Inactivo"}
              </Badge>
            ),
          },
          {
            header: "Último acceso",
            cell: ({ row }) => new Date().toLocaleDateString(),
          },
          {
            header: "Acciones",
            cell: ({ row }) => {
              return <div>{/* <UpdatePerson person={row.original} /> */}</div>;
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
