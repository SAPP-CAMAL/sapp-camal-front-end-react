"use client";

import { Activity, Beef, Hash, RotateCcw, Settings, Trash2 } from "lucide-react";
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

import { NewProductType } from "./components/new-product-type";
import { UpdateProductType } from "./components/update-product-type";
import { TableProductType } from "./components/table-product-type";
import { PRODUCT_TYPE_LIST_TAG } from "./constants";
import {
  deleteProductTypePermanentlyService,
  getProductTypesPaginatedService,
  updateProductTypeService,
} from "./server/db/product-type.service";
import { ProductType } from "./domain";

export function ProductTypeManagement() {
  const queryClient = useQueryClient();

  const [searchParams, setSearchParams] = useQueryStates(
    {
      page: parseAsInteger.withDefault(1),
      limit: parseAsInteger.withDefault(10),
      typeName: parseAsString.withDefault(""),
      status: parseAsString.withDefault("*"),
    },
    {
      history: "push",
    }
  );

  const query = useQuery({
    queryKey: [PRODUCT_TYPE_LIST_TAG, searchParams],
    queryFn: () =>
      getProductTypesPaginatedService({
        page: searchParams.page,
        limit: searchParams.limit,
        ...(!!searchParams.typeName && { typeName: searchParams.typeName }),
        ...(searchParams.status !== "*" && {
          status: searchParams.status === "true",
        }),
      }),
  });

  const debounceTypeName = useDebouncedCallback(
    (text: string) => setSearchParams({ typeName: text, page: 1 }),
    500
  );

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: [PRODUCT_TYPE_LIST_TAG] });

  const handleDelete = async (id: number) => {
    try {
      await deleteProductTypePermanentlyService(id);
      toast.success("Registro eliminado permanentemente");
      invalidate();
    } catch (error: any) {
      const { data } = await error.response.json();
      toast.error(data);
    }
  };

  const handleReactivate = async (id: number) => {
    try {
      await updateProductTypeService(id, { status: true });
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
            <Beef />
            Tipos de Producto
          </h1>
          <p className="text-gray-600 text-sm mt-1">
            Catálogo de tipos de producto/subproducto cárnico, padre de la
            configuración de productos por especie.
          </p>
        </div>
        <div className="flex gap-x-2">
          <NewProductType />
        </div>
      </section>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="flex gap-2 items-center">
            Filtros de Búsqueda
          </CardTitle>
          <CardDescription>
            Filtre los tipos de producto por nombre o estado
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
                  defaultValue={searchParams.typeName}
                  onChange={(e) => debounceTypeName(e.target.value)}
                />
              </div>
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

      <TableProductType<ProductType, unknown>
        columns={[
          {
            accessorKey: "code",
            header: () => (
              <div className="flex items-center gap-2">
                <Hash className="h-4 w-4" />
                Código
              </div>
            ),
            cell: ({ row }) => row.original.code,
          },
          {
            accessorKey: "typeName",
            header: () => (
              <div className="flex items-center gap-2">
                <Beef className="h-4 w-4" />
                Nombre
              </div>
            ),
            cell: ({ row }) => row.original.typeName,
          },
          {
            accessorKey: "description",
            header: () => "Descripción",
            cell: ({ row }) => row.original.description || "-",
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
                <UpdateProductType productType={row.original} />
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
