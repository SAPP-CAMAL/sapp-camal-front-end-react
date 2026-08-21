"use client";

import { Activity, PackageSearch, RotateCcw, Settings, Trash2 } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { parseAsInteger, parseAsString, useQueryStates } from "nuqs";
import { toast } from "sonner";
import { useDebouncedCallback } from "use-debounce";
import { SearchIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { ConfirmationDialog } from "@/components/confirmation-dialog";
import { useAllSpecies } from "@/features/specie/hooks";
import { getAllAnimalSex } from "@/features/animal-sex/server/db/animal-sex.service";

import { NewSpeciesProduct } from "./components/new-species-product";
import { UpdateSpeciesProduct } from "./components/update-species-product";
import { TableSpeciesProduct } from "./components/table-species-product";
import { SPECIES_PRODUCT_LIST_TAG } from "./constants";
import {
  deleteSpeciesProductPermanentlyService,
  getSpeciesProductsPaginatedService,
  updateSpeciesProductService,
} from "./server/db/species-product.service";
import { SpeciesProduct } from "./domain";

export function SpeciesProductManagement() {
  const queryClient = useQueryClient();

  const [searchParams, setSearchParams] = useQueryStates(
    {
      page: parseAsInteger.withDefault(1),
      limit: parseAsInteger.withDefault(10),
      productName: parseAsString.withDefault(""),
      status: parseAsString.withDefault("*"),
      idSpecies: parseAsString.withDefault("*"),
    },
    {
      history: "push",
    }
  );

  const query = useQuery({
    queryKey: [SPECIES_PRODUCT_LIST_TAG, searchParams],
    queryFn: () =>
      getSpeciesProductsPaginatedService({
        page: searchParams.page,
        limit: searchParams.limit,
        ...(!!searchParams.productName && { productName: searchParams.productName }),
        ...(searchParams.status !== "*" && {
          status: searchParams.status === "true",
        }),
        ...(searchParams.idSpecies !== "*" && {
          idSpecies: Number(searchParams.idSpecies),
        }),
      }),
  });

  const debounceProductName = useDebouncedCallback(
    (text: string) => setSearchParams({ productName: text, page: 1 }),
    500
  );

  const speciesQuery = useAllSpecies();
  const animalSexQuery = useQuery({
    queryKey: ["animal-sex-list-for-select"],
    queryFn: getAllAnimalSex,
  });

  const speciesById = new Map(
    (speciesQuery.data?.data ?? []).map((s) => [s.id, s.name]),
  );
  const animalSexById = new Map(
    (animalSexQuery.data?.data ?? []).map((a) => [a.id, a.name]),
  );

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: [SPECIES_PRODUCT_LIST_TAG] });

  const handleDelete = async (id: number) => {
    try {
      await deleteSpeciesProductPermanentlyService(id);
      toast.success("Registro eliminado permanentemente");
      invalidate();
    } catch (error: any) {
      const { data } = await error.response.json();
      toast.error(data);
    }
  };

  const handleReactivate = async (id: number) => {
    try {
      await updateSpeciesProductService(id, { status: true });
      toast.success("Registro reactivado exitosamente");
      invalidate();
    } catch (error: any) {
      const { data } = await error.response.json();
      toast.error(data);
    }
  };

  return (
    <div>
      <section className="mb-4 flex flex-col sm:flex-row sm:justify-between gap-2">
        <div>
          <h1 className="flex items-center gap-x-2 font-semibold text-xl">
            <PackageSearch />
            Productos por Especie
          </h1>
          <p className="text-gray-600 text-sm mt-1">
            Define qué productos existen por especie y sexo de animal, con
            orden de visualización.
          </p>
        </div>
        <div className="flex gap-x-2">
          <NewSpeciesProduct />
        </div>
      </section>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="flex gap-2 items-center">
            Filtros de Búsqueda
          </CardTitle>
          <CardDescription>
            Filtre los productos por especie por nombre de producto o estado
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex flex-col w-full">
              <label className="mb-1 text-sm font-medium text-gray-700">
                Buscar por producto
              </label>
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 z-10 h-5 w-5" />
                <Input
                  type="text"
                  placeholder="Buscar por producto..."
                  className="pl-10 pr-3 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2"
                  defaultValue={searchParams.productName}
                  onChange={(e) => debounceProductName(e.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-col w-full">
              <label className="mb-1 text-sm font-medium text-gray-700">
                Especie
              </label>
              <Select
                onValueChange={(value) => setSearchParams({ idSpecies: value, page: 1 })}
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
                onValueChange={(value) => setSearchParams({ status: value, page: 1 })}
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

      <TableSpeciesProduct<SpeciesProduct, unknown>
        columns={[
          {
            accessorKey: "idSpecies",
            header: () => "Especie",
            cell: ({ row }) => speciesById.get(row.original.idSpecies) ?? "-",
          },
          {
            accessorKey: "productType",
            header: () => "Tipo de producto",
            cell: ({ row }) => row.original.productType?.typeName ?? "-",
          },
          {
            accessorKey: "idAnimalSex",
            header: () => "Sexo",
            cell: ({ row }) =>
              row.original.idAnimalSex
                ? animalSexById.get(row.original.idAnimalSex) ?? "-"
                : "Todos",
          },
          {
            accessorKey: "productCode",
            header: () => "Código",
            cell: ({ row }) => row.original.productCode,
          },
          {
            accessorKey: "productName",
            header: () => "Producto",
            cell: ({ row }) => row.original.productName,
          },
          {
            accessorKey: "displayOrder",
            header: () => "Orden",
            cell: ({ row }) => row.original.displayOrder,
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
                <UpdateSpeciesProduct speciesProduct={row.original} />
                {row.original.status ? (
                  <ConfirmationDialog
                    title="¿Eliminar este registro?"
                    description="Esta acción no se puede deshacer. El registro se eliminará permanentemente de la base de datos."
                    onConfirm={() => handleDelete(row.original.id)}
                    triggerBtn={
                      <Button variant="outline" size="icon">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    }
                    cancelBtn={<Button variant="outline">Cancelar</Button>}
                    confirmBtn={<Button variant="destructive">Eliminar</Button>}
                  />
                ) : (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleReactivate(row.original.id)}
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                )}
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
