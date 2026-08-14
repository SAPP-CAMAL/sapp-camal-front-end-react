"use client";

import { Badge } from "@/components/ui/badge";
import { HouseIcon, SearchIcon } from "lucide-react";
import { TableCorrals } from "./table-corrals";
import { useQuery } from "@tanstack/react-query";
import { parseAsInteger, parseAsString, useQueryStates } from "nuqs";
import { useDebouncedCallback } from "use-debounce";
import { getCorralsAdminPaginatedService } from "./server/db/corral-admin.service";
import { getCorralTypesAdminService } from "./server/db/corral-type-admin.service";
import { NewCorral } from "./components/new-corral";
import { UpdateCorral } from "./components/update-corral";
import { DeleteCorral } from "./components/delete-corral";
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

export function CorralsManagement() {
  const [searchParams, setSearchParams] = useQueryStates(
    {
      page: parseAsInteger.withDefault(1),
      limit: parseAsInteger.withDefault(10),
      name: parseAsString.withDefault(""),
      idCorralType: parseAsString.withDefault("*"),
    },
    { history: "push" }
  );

  const corralTypesQuery = useQuery({
    queryKey: ["corral-types", "all-for-select"],
    queryFn: getCorralTypesAdminService,
  });
  const activeCorralTypes = (corralTypesQuery.data?.data ?? []).filter((t) => t.status);

  const query = useQuery({
    queryKey: ["corrals-admin", searchParams],
    queryFn: () =>
      getCorralsAdminPaginatedService({
        page: searchParams.page,
        limit: searchParams.limit,
        ...(!!searchParams.name && { name: searchParams.name }),
        ...(searchParams.idCorralType !== "*" && {
          idCorralType: Number(searchParams.idCorralType),
        }),
      }),
  });

  const debounceName = useDebouncedCallback(
    (text: string) => setSearchParams({ name: text, page: 1 }),
    500
  );

  return (
    <div>
      <section className="mb-4 flex flex-col sm:flex-row sm:justify-between gap-2">
        <div>
          <h1 className="flex items-center gap-x-2 font-semibold text-xl">
            <HouseIcon />
            Corrales
          </h1>
          <p className="text-gray-600 text-sm mt-1">
            Registro de corrales físicos del camal, su tipo y capacidad de animales.
          </p>
        </div>
        <div className="flex gap-x-2">
          <NewCorral />
        </div>
      </section>

      <Card className="mb-4 py-3 gap-2">
        <CardHeader className="px-4 gap-0.5">
          <CardTitle className="flex gap-2 items-center text-sm">
            Filtros de Búsqueda
          </CardTitle>
          <CardDescription className="text-xs">
            Filtre los corrales por nombre o tipo
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  defaultValue={searchParams.name}
                  onChange={(e) => debounceName(e.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-col w-full">
              <label className="mb-1 text-sm font-medium text-gray-700">
                Tipo de corral
              </label>
              <Select
                onValueChange={(value) =>
                  setSearchParams({ idCorralType: value, page: 1 })
                }
                defaultValue={searchParams.idCorralType}
              >
                <SelectTrigger className="h-10 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <SelectValue placeholder="Seleccione un tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="*">Todos</SelectItem>
                  {activeCorralTypes.map((type) => (
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

      <TableCorrals
        columns={[
          {
            accessorKey: "name",
            header: () => (
              <div className="flex items-center gap-2">
                <HouseIcon className="h-4 w-4" />
                Nombre
              </div>
            ),
            cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
          },
          {
            accessorKey: "corralType",
            header: () => <div>Tipo de corral</div>,
            cell: ({ row }) => <span>{row.original.corralType?.description ?? "-"}</span>,
          },
          {
            accessorKey: "quantity",
            header: () => <div>Capacidad</div>,
            cell: ({ row }) => (
              <span>
                {row.original.minimumQuantity} - {row.original.maximumQuantity}
              </span>
            ),
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
                <UpdateCorral corral={row.original} />
                <DeleteCorral corral={row.original} />
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
