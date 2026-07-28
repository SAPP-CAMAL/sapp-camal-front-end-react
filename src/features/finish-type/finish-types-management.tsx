"use client";

import { Badge } from "@/components/ui/badge";
import { SparklesIcon } from "lucide-react";
import { TableFinishTypes } from "./table-finish-types";
import { useQuery } from "@tanstack/react-query";
import { getFinishTypesAdminService } from "./server/db/finish-type-admin.service";
import { NewFinishType } from "./components/new-finish-type";
import { UpdateFinishType } from "./components/update-finish-type";
import { DeleteFinishType } from "./components/delete-finish-type";

export function FinishTypesManagement() {
  const query = useQuery({
    queryKey: ["finish-types-admin"],
    queryFn: getFinishTypesAdminService,
  });

  return (
    <div>
      <section className="mb-4 flex flex-col sm:flex-row sm:justify-between gap-2">
        <div>
          <h1 className="flex items-center gap-x-2 font-semibold text-xl">
            <SparklesIcon />
            Tipos de Acabado
          </h1>
          <p className="text-gray-600 text-sm mt-1">
            Catálogo de tipos de acabado de animal por especie (ej. depilado, chamuscado).
          </p>
        </div>
        <div className="flex gap-x-2">
          <NewFinishType />
        </div>
      </section>

      <TableFinishTypes
        columns={[
          {
            accessorKey: "name",
            header: () => (
              <div className="flex items-center gap-2">
                <SparklesIcon className="h-4 w-4" />
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
            accessorKey: "status",
            header: () => <div>Estado</div>,
            cell: ({ row }) => <Badge>{row.original.status ? "Activo" : "Inactivo"}</Badge>,
          },
          {
            id: "actions",
            header: () => <div className="flex items-center justify-center">Acciones</div>,
            cell: ({ row }) => (
              <div className="flex justify-center gap-x-2">
                <UpdateFinishType finishType={row.original} />
                <DeleteFinishType finishType={row.original} />
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
