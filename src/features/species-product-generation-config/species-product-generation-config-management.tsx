"use client";

import { Activity, Settings, Settings2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { parseAsInteger, parseAsString, useQueryStates } from "nuqs";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAllSpecies } from "@/features/specie/hooks";

import { TableSpeciesProductGenerationConfig } from "./components/table-species-product-generation-config";
import { UpdateSpeciesProductGenerationConfig } from "./components/update-species-product-generation-config";
import { SPECIES_PRODUCT_GENERATION_CONFIG_LIST_TAG } from "./constants";
import { getSpeciesProductGenerationConfigPaginatedService } from "./server/db/species-product-generation-config.service";
import { SpeciesProductGenerationConfig } from "./domain";

export function SpeciesProductGenerationConfigManagement() {
  const [searchParams, setSearchParams] = useQueryStates(
    {
      page: parseAsInteger.withDefault(1),
      limit: parseAsInteger.withDefault(10),
      status: parseAsString.withDefault("*"),
      idSpecies: parseAsString.withDefault("*"),
    },
    {
      history: "push",
    }
  );

  const query = useQuery({
    queryKey: [SPECIES_PRODUCT_GENERATION_CONFIG_LIST_TAG, searchParams],
    queryFn: () =>
      getSpeciesProductGenerationConfigPaginatedService({
        page: searchParams.page,
        limit: searchParams.limit,
        ...(searchParams.status !== "*" && {
          status: searchParams.status === "true",
        }),
        ...(searchParams.idSpecies !== "*" && {
          idSpecies: Number(searchParams.idSpecies),
        }),
      }),
  });

  const speciesQuery = useAllSpecies();

  return (
    <div>
      <section className="mb-4">
        <h1 className="flex items-center gap-x-2 font-semibold text-xl">
          <Settings2 />
          Generación de Productos por Especie
        </h1>
        <p className="text-gray-600 text-sm mt-1">
          Configura si cada especie genera productos (cuartos de canal) y/o
          subproductos (órganos) al momento del pesaje.
        </p>
      </section>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="flex gap-2 items-center">
            Filtros de Búsqueda
          </CardTitle>
          <CardDescription>Filtre por especie o estado</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex flex-col w-full">
              <label className="mb-1 text-sm font-medium text-gray-700">
                Especie
              </label>
              <Select
                onValueChange={(value) =>
                  setSearchParams({ idSpecies: value, page: 1 })
                }
                defaultValue={searchParams.idSpecies}
              >
                <SelectTrigger className="h-10 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <SelectValue placeholder="Seleccione una especie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="*">Todas</SelectItem>
                  {(speciesQuery.data?.data ?? []).map((specie) => (
                    <SelectItem key={specie.id} value={specie.id.toString()}>
                      {specie.name}
                    </SelectItem>
                  ))}
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
                  <SelectItem value="*">Todos</SelectItem>
                  <SelectItem value="true">Activos</SelectItem>
                  <SelectItem value="false">Inactivos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <TableSpeciesProductGenerationConfig<SpeciesProductGenerationConfig, unknown>
        columns={[
          {
            accessorKey: "species",
            header: () => "Especie",
            cell: ({ row }) => row.original.species?.name ?? "-",
          },
          {
            accessorKey: "generateProducts",
            header: () => "Genera Productos",
            cell: ({ row }) => (
              <Badge variant={row.original.generateProducts ? "default" : "secondary"}>
                {row.original.generateProducts ? "Sí" : "No"}
              </Badge>
            ),
          },
          {
            accessorKey: "generateSubproducts",
            header: () => "Genera Subproductos",
            cell: ({ row }) => (
              <Badge variant={row.original.generateSubproducts ? "default" : "secondary"}>
                {row.original.generateSubproducts ? "Sí" : "No"}
              </Badge>
            ),
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
              <Badge variant={row.original.status ? "default" : "secondary"}>
                {row.original.status ? "Activo" : "Inactivo"}
              </Badge>
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
                <UpdateSpeciesProductGenerationConfig config={row.original} />
              </div>
            ),
          },
        ]}
        data={query.data?.data.items ?? []}
        meta={{
          ...query.data?.data.meta,
          onChangePage: (page) => setSearchParams({ page }),
          onNextPage: () => setSearchParams({ page: searchParams.page + 1 }),
          disabledNextPage:
            searchParams.page >= (query.data?.data.meta.totalPages ?? 0),
          onPreviousPage: () => setSearchParams({ page: searchParams.page - 1 }),
          disabledPreviousPage: searchParams.page <= 1,
          setSearchParams,
        }}
        isLoading={query.isLoading}
      />
    </div>
  );
}
