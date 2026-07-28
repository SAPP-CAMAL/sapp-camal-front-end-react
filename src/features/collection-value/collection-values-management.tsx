"use client";

import { Badge } from "@/components/ui/badge";
import { DollarSignIcon } from "lucide-react";
import { TableCollectionValues } from "./table-collection-values";
import { useQuery } from "@tanstack/react-query";
import { getCollectionValuesAdminService } from "./server/db/collection-value-admin.service";
import { NewCollectionValue } from "./components/new-collection-value";
import { UpdateCollectionValue } from "./components/update-collection-value";
import { DeleteCollectionValue } from "./components/delete-collection-value";

export function CollectionValuesManagement() {
  const query = useQuery({
    queryKey: ["collection-values-admin"],
    queryFn: getCollectionValuesAdminService,
  });

  return (
    <div>
      <section className="mb-4 flex flex-col sm:flex-row sm:justify-between gap-2">
        <div>
          <h1 className="flex items-center gap-x-2 font-semibold text-xl">
            <DollarSignIcon />
            Tarifas por Especie
          </h1>
          <p className="text-gray-600 text-sm mt-1">
            Precios de cobranza configurados por especie, usados en la facturación.
          </p>
        </div>
        <div className="flex gap-x-2">
          <NewCollectionValue />
        </div>
      </section>

      <TableCollectionValues
        columns={[
          {
            accessorKey: "name",
            header: () => (
              <div className="flex items-center gap-2">
                <DollarSignIcon className="h-4 w-4" />
                Nombre
              </div>
            ),
            cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
          },
          {
            accessorKey: "specie",
            header: () => <div>Especie</div>,
            cell: ({ row }) => <span>{row.original.specie?.name ?? "-"}</span>,
          },
          {
            accessorKey: "code",
            header: () => <div>Código</div>,
            cell: ({ row }) => <span className="text-xs text-gray-500">{row.original.code}</span>,
          },
          {
            accessorKey: "price",
            header: () => <div>Precio</div>,
            cell: ({ row }) => <span>${Number(row.original.price).toFixed(2)}</span>,
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
                <UpdateCollectionValue collectionValue={row.original} />
                <DeleteCollectionValue collectionValue={row.original} />
              </div>
            ),
          },
        ]}
        data={query.data?.data ?? []}
        isLoading={query.isLoading}
      />
    </div>
  );
}
