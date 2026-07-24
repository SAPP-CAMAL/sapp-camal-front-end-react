"use client";

import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { TruckIcon, Activity, Settings, Clock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { parseAsString, useQueryStates } from "nuqs";
import { getDistributionProductsService } from "./server/db/distribution-product.service";
import { NewDistributionProduct } from "./components/new-distribution-product";
import { UpdateDistributionProduct } from "./components/update-distribution-product";
import { DeleteDistributionProduct } from "./components/delete-distribution-product";
import { DistributionProductDetailsDialog } from "./components/distribution-product-details-dialog";
import { TableDistributionProducts } from "./components/table-distribution-products";
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
import { DISTRIBUTION_PRODUCTS_TAG } from "./constants/distribution-product.constants";

export function DistributionProductManagement() {
  const [searchParams, setSearchParams] = useQueryStates(
    {
      status: parseAsString.withDefault("*"),
    },
    {
      history: "push",
    }
  );

  const query = useQuery({
    queryKey: [DISTRIBUTION_PRODUCTS_TAG],
    queryFn: getDistributionProductsService,
  });

  const filteredData = useMemo(() => {
    const items = query.data?.data ?? [];

    return items.filter((item) =>
      searchParams.status !== "*"
        ? String(item.status) === searchParams.status
        : true
    );
  }, [query.data, searchParams.status]);

  return (
    <div>
      <section className="mb-4 flex flex-col sm:flex-row sm:justify-between gap-2">
        <div>
          <h1 className="flex items-center gap-x-2 font-semibold text-xl">
            <TruckIcon />
            Despacho de Productos de Distribución
          </h1>
          <p className="text-gray-600 text-sm mt-1">
            Registra la salida de productos de distribución por envío,
            introductor y origen, con el detalle de productos y cantidades
            por destinatario.
          </p>
        </div>
        <div className="flex gap-x-2">
          <NewDistributionProduct />
        </div>
      </section>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="flex gap-2 items-center">
            Filtros de Búsqueda
          </CardTitle>
          <CardDescription>Filtre los despachos por estado</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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

      <TableDistributionProducts
        columns={[
          {
            accessorKey: "startTime",
            header: () => (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Horario
              </div>
            ),
            cell: ({ row }) => (
              <div>
                {row.original.startTime?.slice(0, 5)}
                {row.original.endTime ? ` - ${row.original.endTime.slice(0, 5)}` : ""}
              </div>
            ),
          },
          {
            accessorKey: "shipping",
            header: () => "Envío",
            cell: ({ row }) => `#${row.original.idShipping}`,
          },
          {
            accessorKey: "introducer",
            header: () => "Introductor",
            cell: ({ row }) => `#${row.original.idIntroducer}`,
          },
          {
            accessorKey: "origin",
            header: () => "Origen",
            cell: ({ row }) =>
              row.original.origin?.name ?? `#${row.original.idOrigin}`,
          },
          {
            accessorKey: "withLoad",
            header: () => "Carga",
            cell: ({ row }) => (
              <Badge variant={row.original.withLoad ? "default" : "secondary"}>
                {row.original.withLoad ? "Sí" : "No"}
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
                <DistributionProductDetailsDialog distributionProduct={row.original} />
                <UpdateDistributionProduct distributionProduct={row.original} />
                <DeleteDistributionProduct distributionProduct={row.original} />
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
