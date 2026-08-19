"use client";

import { Badge } from "@/components/ui/badge";
import { LinkIcon, PackageIcon, BugIcon, Layers, Activity, Settings } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { parseAsInteger, parseAsString, useQueryStates } from "nuqs";
import { getProductDiseasesPaginatedService } from "./server/db/product-disease.service";
import { NewProductDisease } from "./components/new-product-disease";
import { UpdateProductDisease } from "./components/update-product-disease";
import { DeleteProductDisease } from "./components/delete-product-disease";
import { ManageSpeciesDisease } from "./components/manage-species-disease";
import { TableProductDisease } from "./components/table-product-disease";
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
import { PRODUCT_DISEASE_TAG } from "./constants/product-disease.constants";

export function ProductDiseaseManagement() {
  const [searchParams, setSearchParams] = useQueryStates(
    {
      page: parseAsInteger.withDefault(1),
      limit: parseAsInteger.withDefault(10),
      name: parseAsString.withDefault(""),
      status: parseAsString.withDefault("*"),
    },
    {
      history: "push",
    }
  );

  const query = useQuery({
    queryKey: [PRODUCT_DISEASE_TAG, searchParams],
    queryFn: () =>
      getProductDiseasesPaginatedService({
        page: searchParams.page,
        limit: searchParams.limit,
        ...(searchParams.name && { name: searchParams.name }),
        ...(searchParams.status !== "*" && {
          status: searchParams.status === "true",
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
            <LinkIcon />
            Reglas Producto - Enfermedad
          </h1>
          <p className="text-gray-600 text-sm mt-1">
            Administra qué enfermedades pueden afectar a cada producto/órgano,
            su grupo, y en qué especies aplica cada regla.
          </p>
        </div>
        <div className="flex gap-x-2">
          <NewProductDisease />
        </div>
      </section>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="flex gap-2 items-center">
            Filtros de Búsqueda
          </CardTitle>
          <CardDescription>
            Filtre las reglas por producto, enfermedad o estado
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex flex-col w-full">
              <label className="mb-1 text-sm font-medium text-gray-700">
                Buscar por producto o enfermedad
              </label>
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 z-10 h-5 w-5" />
                <Input
                  type="text"
                  placeholder="Buscar por producto o enfermedad..."
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

      <TableProductDisease
        columns={[
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
            id: "disease",
            header: () => (
              <div className="flex items-center gap-2">
                <BugIcon className="h-4 w-4" />
                Enfermedad
              </div>
            ),
            cell: ({ row }) => <span>{row.original.disease?.names}</span>,
          },
          {
            id: "diseaseGroup",
            header: () => (
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4" />
                Grupo
              </div>
            ),
            cell: ({ row }) => <span>{row.original.diseaseGroup?.name ?? "-"}</span>,
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
                <UpdateProductDisease productDisease={row.original} />
                <ManageSpeciesDisease productDisease={row.original} />
                <DeleteProductDisease productDisease={row.original} />
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
