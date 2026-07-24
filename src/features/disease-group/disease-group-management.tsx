"use client";

import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { LayersIcon, Hash, Activity, Settings } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { parseAsString, useQueryStates } from "nuqs";
import { getDiseaseGroupsService } from "./server/db/disease-group.service";
import { NewDiseaseGroup } from "./components/new-disease-group";
import { UpdateDiseaseGroup } from "./components/update-disease-group";
import { DeleteDiseaseGroup } from "./components/delete-disease-group";
import { TableDiseaseGroup } from "./components/table-disease-group";
import { toCapitalize } from "@/lib/toCapitalize";
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
import { DISEASE_GROUP_TAG } from "./constants/disease-group.constants";

export function DiseaseGroupManagement() {
  const [searchParams, setSearchParams] = useQueryStates(
    {
      name: parseAsString.withDefault(""),
      status: parseAsString.withDefault("*"),
    },
    {
      history: "push",
    }
  );

  const query = useQuery({
    queryKey: [DISEASE_GROUP_TAG],
    queryFn: getDiseaseGroupsService,
  });

  const debounceName = useDebouncedCallback(
    (text: string) => setSearchParams({ name: text }),
    500
  );

  const filteredData = useMemo(() => {
    const items = query.data?.data ?? [];

    return items.filter((item) => {
      const matchesName = searchParams.name
        ? item.name.toLowerCase().includes(searchParams.name.toLowerCase()) ||
          item.code.toLowerCase().includes(searchParams.name.toLowerCase())
        : true;
      const matchesStatus =
        searchParams.status !== "*"
          ? String(item.status) === searchParams.status
          : true;

      return matchesName && matchesStatus;
    });
  }, [query.data, searchParams.name, searchParams.status]);

  return (
    <div>
      <section className="mb-4 flex flex-col sm:flex-row sm:justify-between gap-2">
        <div>
          <h1 className="flex items-center gap-x-2 font-semibold text-xl">
            <LayersIcon />
            Grupos de Enfermedad
          </h1>
          <p className="text-gray-600 text-sm mt-1">
            Administra las agrupaciones de enfermedades por categoría, usadas
            para clasificar productos afectados.
          </p>
        </div>
        <div className="flex gap-x-2">
          <NewDiseaseGroup />
        </div>
      </section>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="flex gap-2 items-center">
            Filtros de Búsqueda
          </CardTitle>
          <CardDescription>
            Filtre los grupos de enfermedad por nombre, código o estado
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex flex-col w-full">
              <label className="mb-1 text-sm font-medium text-gray-700">
                Buscar por nombre o código
              </label>
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 z-10 h-5 w-5" />
                <Input
                  type="text"
                  placeholder="Buscar por nombre o código..."
                  className="pl-10 pr-3 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2"
                  defaultValue={searchParams.name}
                  onChange={(e) => debounceName(e.target.value)}
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

      <TableDiseaseGroup
        columns={[
          {
            accessorKey: "name",
            header: () => (
              <div className="flex items-center gap-2">
                <LayersIcon className="h-4 w-4" />
                Nombre
              </div>
            ),
            cell: ({ row }) => (
              <div className="flex items-center gap-x-2">
                {toCapitalize(row.original.name, true)}
              </div>
            ),
          },
          {
            accessorKey: "code",
            header: () => (
              <div className="flex items-center gap-2">
                <Hash className="h-4 w-4" />
                Código
              </div>
            ),
            cell: ({ row }) => <span>{row.original.code}</span>,
          },
          {
            accessorKey: "groupNumber",
            header: () => "Número",
            cell: ({ row }) => <span>{row.original.groupNumber}</span>,
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
                <UpdateDiseaseGroup diseaseGroup={row.original} />
                <DeleteDiseaseGroup diseaseGroup={row.original} />
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
