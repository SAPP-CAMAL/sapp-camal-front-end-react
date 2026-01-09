"use client";

import { Badge } from "@/components/ui/badge";
import { TableStaffList } from "./table-staff-list";
import { parseAsInteger, parseAsString, useQueryStates } from "nuqs";
import { getPeopleByFilterService } from "@/features/people/server/db/people.service";
import { useQuery } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toCapitalize } from "@/lib/toCapitalize";
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
import {
  CreditCardIcon,
  SearchIcon,
  UserIcon,
} from "lucide-react";
import { useDebouncedCallback } from "use-debounce";

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

  const debounceFullName = useDebouncedCallback(
    (text: string) => setSearchParams({ fullName: text, page: 1 }),
    500
  );

  const debounceIdentification = useDebouncedCallback(
    (text: string) => setSearchParams({ identification: text, page: 1 }),
    500
  );

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

      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="flex gap-2 items-center">
            Filtros de Búsqueda
          </CardTitle>
          <CardDescription>
            Filtre el personal por nombre, identificación, tipo de personal o estado
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex flex-col w-full">
              <label className="mb-1 text-sm font-medium text-gray-700">
                Buscar por nombre
              </label>
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 z-10 h-5 w-5" />
                <Input
                  type="text"
                  placeholder="Buscar por nombre..."
                  className="pl-10 pr-3 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2"
                  defaultValue={searchParams.fullName}
                  onChange={(e) => debounceFullName(e.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-col w-full">
              <label className="mb-1 text-sm font-medium text-gray-700">
                Buscar por identificación
              </label>
              <div className="relative">
                <CreditCardIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 z-10 h-5 w-5" />
                <Input
                  type="text"
                  placeholder="Ingrese identificación"
                  className="pl-10 pr-3 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2"
                  defaultValue={searchParams.identification}
                  onChange={(e) => debounceIdentification(e.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-col w-full">
              <label className="mb-1 text-sm font-medium text-gray-700">
                Tipo de Personal
              </label>
              <Select
                onValueChange={(value) =>
                  setSearchParams({ isEmployee: value, page: 1 })
                }
                defaultValue={searchParams.isEmployee}
              >
                <SelectTrigger className="h-10 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <SelectValue placeholder="Seleccione tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="*">Todos</SelectItem>
                  <SelectItem value="true">Personal Camal</SelectItem>
                  <SelectItem value="false">Otros</SelectItem>
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
                defaultValue={searchParams.status}
              >
                <SelectTrigger className="h-10 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <SelectValue placeholder="Seleccione un estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="activos">Activos</SelectItem>
                  <SelectItem value="inactivos">Inactivos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
      <TableStaffList
        columns={[
          {
            accessorKey: "code",
            header: "Usuario",
            cell: ({ row }) => (
              <div className="flex gap-x-2 items-center">
                <Avatar>
                  {/* <AvatarImage src="https://github.com/shadcnxxx.png" /> */}
                  {/* <AvatarFallback>CN</AvatarFallback> */}
                </Avatar>
                <div>
                  <p className="font-semibold">
                    {toCapitalize(row.original.fullName ?? '', true)}
                  </p>
                  {/* <p className="text-gray-500">{row.original?.email}</p> */}
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
                // className={
                //   row.original.status
                //     ? "bg-green-100 text-green-800"
                //     : "bg-red-100 text-red-800"
                // }
                variant={row.original.status ? "default" : "outline"}
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
