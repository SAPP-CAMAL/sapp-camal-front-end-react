"use client";

import { Badge } from "@/components/ui/badge";
import { RulerIcon } from "lucide-react";
import { TableUnitMeasures } from "./table-unit-measures";
import { useQuery } from "@tanstack/react-query";
import { getUnitMeasuresAdminService } from "./server/db/unit-measure-admin.service";
import { NewUnitMeasure } from "./components/new-unit-measure";
import { UpdateUnitMeasure } from "./components/update-unit-measure";
import { DeleteUnitMeasure } from "./components/delete-unit-measure";

export function UnitMeasuresManagement() {
  const query = useQuery({
    queryKey: ["unit-measures-admin"],
    queryFn: getUnitMeasuresAdminService,
  });

  return (
    <div>
      <section className="mb-4 flex flex-col sm:flex-row sm:justify-between gap-2">
        <div>
          <h1 className="flex items-center gap-x-2 font-semibold text-xl">
            <RulerIcon />
            Unidades de Medida
          </h1>
          <p className="text-gray-600 text-sm mt-1">
            Catálogo de unidades de medida (kg, lb, etc.) usadas en el pesaje de animales.
          </p>
        </div>
        <div className="flex gap-x-2">
          <NewUnitMeasure />
        </div>
      </section>

      <TableUnitMeasures
        columns={[
          {
            accessorKey: "name",
            header: () => (
              <div className="flex items-center gap-2">
                <RulerIcon className="h-4 w-4" />
                Nombre
              </div>
            ),
            cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
          },
          {
            accessorKey: "code",
            header: () => <div>Código</div>,
            cell: ({ row }) => <span className="text-xs text-gray-500">{row.original.code}</span>,
          },
          {
            accessorKey: "symbol",
            header: () => <div>Símbolo</div>,
            cell: ({ row }) => <span>{row.original.symbol}</span>,
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
                <UpdateUnitMeasure unitMeasure={row.original} />
                <DeleteUnitMeasure unitMeasure={row.original} />
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
