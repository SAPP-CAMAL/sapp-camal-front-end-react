"use client";

import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { BedIcon, Activity, Settings } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { parseAsString, useQueryStates } from "nuqs";
import { getAllBedTypes } from "./server/db/bed-type.service";
import { NewBedType } from "./components/new-bed-type";
import { UpdateBedType } from "./components/update-bed-type";
import { DeleteBedType } from "./components/delete-bed-type";
import { TableBedTypes } from "./components/table-bed-types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SearchIcon } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDebouncedCallback } from "use-debounce";
import { BED_TYPE_LIST_TAG } from "./constants";

export function BedTypeManagement() {
  const [searchParams, setSearchParams] = useQueryStates(
    {
      description: parseAsString.withDefault(""),
      status: parseAsString.withDefault("*"),
    },
    {
      history: "push",
    }
  );

  const query = useQuery({
    queryKey: [BED_TYPE_LIST_TAG],
    queryFn: getAllBedTypes,
  });

  const debounceDescription = useDebouncedCallback(
    (text: string) => setSearchParams({ description: text }),
    500
  );

  const filteredData = useMemo(() => {
    const items = query.data?.data ?? [];

    return items.filter((item) => {
      const matchesDescription = searchParams.description
        ? item.description
            .toLowerCase()
            .includes(searchParams.description.toLowerCase())
        : true;
      const matchesStatus =
        searchParams.status !== "*"
          ? String(item.status) === searchParams.status
          : true;

      return matchesDescription && matchesStatus;
    });
  }, [query.data, searchParams.description, searchParams.status]);

  return (
    <div>
      <section className="mb-4 flex flex-col sm:flex-row sm:justify-between gap-2">
        <div>
          <h1 className="flex items-center gap-x-2 font-semibold text-xl">
            <BedIcon />
            Tipos de Cama
          </h1>
          <p className="text-gray-600 text-sm mt-1">
            Administra el catálogo de tipos de cama usado en las condiciones
            de transporte del certificado.
          </p>
        </div>
        <div className="flex gap-x-2">
          <NewBedType />
        </div>
      </section>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="flex gap-2 items-center">
            Filtros de Búsqueda
          </CardTitle>
          <CardDescription>
            Filtre los tipos de cama por descripción o estado
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex flex-col w-full">
              <label className="mb-1 text-sm font-medium text-gray-700">
                Buscar por descripción
              </label>
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 z-10 h-5 w-5" />
                <Input
                  type="text"
                  placeholder="Buscar..."
                  className="pl-10 pr-3 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2"
                  defaultValue={searchParams.description}
                  onChange={(e) => debounceDescription(e.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-col w-full">
              <label className="mb-1 text-sm font-medium text-gray-700">
                Estado
              </label>
              <Select
                onValueChange={(value) => setSearchParams({ status: value })}
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

      <TableBedTypes
        columns={[
          {
            accessorKey: "description",
            header: () => (
              <div className="flex items-center gap-2">
                <BedIcon className="h-4 w-4" />
                Descripción
              </div>
            ),
            cell: ({ row }) => row.original.description,
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
                <UpdateBedType bedType={row.original} />
                <DeleteBedType bedType={row.original} />
              </div>
            ),
          },
        ]}
        data={filteredData}
        isLoading={query.isLoading}
      />
    </div>
  );
}
