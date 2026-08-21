"use client";

import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Hash, FileText, MapPinIcon, Activity, Settings } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getProductAnatomicalLocationsService } from "./server/db/product-anatomical-location.service";
import { NewProductAnatomicalLocation } from "./components/new-product-anatomical-location";
import { UpdateProductAnatomicalLocation } from "./components/update-product-anatomical-location";
import { DeleteProductAnatomicalLocation } from "./components/delete-product-anatomical-location";
import { TableProductAnatomicalLocation } from "./components/table-product-anatomical-location";
import { PRODUCT_ANATOMICAL_LOCATION_TAG } from "./constants/product-anatomical-location.constants";

export function ProductAnatomicalLocationManagement({
  idProduct,
}: {
  idProduct: number;
}) {
  const query = useQuery({
    queryKey: [PRODUCT_ANATOMICAL_LOCATION_TAG],
    queryFn: getProductAnatomicalLocationsService,
  });

  const filteredData = useMemo(() => {
    const items = query.data?.data ?? [];
    return items.filter((item) => item.idProduct === idProduct);
  }, [query.data, idProduct]);

  return (
    <div>
      <div className="flex justify-end mb-4">
        <NewProductAnatomicalLocation idProduct={idProduct} />
      </div>

      <TableProductAnatomicalLocation
        columns={[
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
            accessorKey: "name",
            header: () => (
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Nombre
              </div>
            ),
            cell: ({ row }) => <span>{row.original.name}</span>,
          },
          {
            accessorKey: "bodyRegion",
            header: () => (
              <div className="flex items-center gap-2">
                <MapPinIcon className="h-4 w-4" />
                Región Corporal
              </div>
            ),
            cell: ({ row }) => <span>{row.original.bodyRegion ?? "-"}</span>,
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
                <UpdateProductAnatomicalLocation
                  productAnatomicalLocation={row.original}
                />
                <DeleteProductAnatomicalLocation
                  productAnatomicalLocation={row.original}
                />
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
