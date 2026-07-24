"use client";

import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { ScaleIcon, PawPrintIcon, PackageIcon, Activity, Settings } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { parseAsString, useQueryStates } from "nuqs";
import { getAvgOrgansSpeciesService } from "./server/db/avg-organs-species.service";
import { NewAvgOrgansSpecies } from "./components/new-avg-organs-species";
import { UpdateAvgOrgansSpecies } from "./components/update-avg-organs-species";
import { DeleteAvgOrgansSpecies } from "./components/delete-avg-organs-species";
import { TableAvgOrgansSpecies } from "./components/table-avg-organs-species";
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
import { AVG_ORGANS_SPECIES_TAG } from "./constants/avg-organs-species.constants";

export function AvgOrgansSpeciesManagement() {
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
    queryKey: [AVG_ORGANS_SPECIES_TAG],
    queryFn: getAvgOrgansSpeciesService,
  });

  const debounceName = useDebouncedCallback(
    (text: string) => setSearchParams({ name: text }),
    500
  );

  const filteredData = useMemo(() => {
    const items = query.data?.data ?? [];

    return items.filter((item) => {
      const matchesName = searchParams.name
        ? item.specie?.name
            .toLowerCase()
            .includes(searchParams.name.toLowerCase()) ||
          item.product?.description
            .toLowerCase()
            .includes(searchParams.name.toLowerCase())
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
            <ScaleIcon />
            Peso Promedio de Órganos
          </h1>
          <p className="text-gray-600 text-sm mt-1">
            Administra el peso de referencia esperado por órgano y especie,
            usado en control de calidad postmortem.
          </p>
        </div>
        <div className="flex gap-x-2">
          <NewAvgOrgansSpecies />
        </div>
      </section>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="flex gap-2 items-center">
            Filtros de Búsqueda
          </CardTitle>
          <CardDescription>
            Filtre por especie, producto o estado
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex flex-col w-full">
              <label className="mb-1 text-sm font-medium text-gray-700">
                Buscar por especie o producto
              </label>
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 z-10 h-5 w-5" />
                <Input
                  type="text"
                  placeholder="Buscar por especie o producto..."
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

      <TableAvgOrgansSpecies
        columns={[
          {
            id: "specie",
            header: () => (
              <div className="flex items-center gap-2">
                <PawPrintIcon className="h-4 w-4" />
                Especie
              </div>
            ),
            cell: ({ row }) => <span>{row.original.specie?.name}</span>,
          },
          {
            id: "product",
            header: () => (
              <div className="flex items-center gap-2">
                <PackageIcon className="h-4 w-4" />
                Producto
              </div>
            ),
            cell: ({ row }) => <span>{row.original.product?.description}</span>,
          },
          {
            accessorKey: "avgWeight",
            header: () => "Peso Promedio (kg)",
            cell: ({ row }) => <span>{row.original.avgWeight ?? "-"}</span>,
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
                <UpdateAvgOrgansSpecies avgOrgansSpecies={row.original} />
                <DeleteAvgOrgansSpecies avgOrgansSpecies={row.original} />
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
