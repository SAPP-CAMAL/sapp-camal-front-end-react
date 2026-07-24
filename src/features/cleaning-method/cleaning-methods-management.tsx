"use client";

import { Badge } from "@/components/ui/badge";
import { SprayCanIcon } from "lucide-react";
import { TableCleaningMethods } from "./table-cleaning-methods";
import { useQuery } from "@tanstack/react-query";
import { getCleaningMethodsAdminService } from "./server/db/cleaning-method-admin.service";
import { NewCleaningMethod } from "./components/new-cleaning-method";
import { UpdateCleaningMethod } from "./components/update-cleaning-method";

export function CleaningMethodsManagement() {
  const query = useQuery({
    queryKey: ["cleaning-methods-admin"],
    queryFn: getCleaningMethodsAdminService,
  });

  return (
    <div>
      <section className="mb-4 flex flex-col sm:flex-row sm:justify-between gap-2">
        <div>
          <h1 className="flex items-center gap-x-2 font-semibold text-xl">
            <SprayCanIcon />
            Métodos de Limpieza
          </h1>
          <p className="text-gray-600 text-sm mt-1">
            Catálogo de métodos usados en la dosificación de limpieza.
          </p>
        </div>
        <div className="flex gap-x-2">
          <NewCleaningMethod />
        </div>
      </section>

      <TableCleaningMethods
        columns={[
          {
            accessorKey: "name",
            header: () => (
              <div className="flex items-center gap-2">
                <SprayCanIcon className="h-4 w-4" />
                Nombre
              </div>
            ),
            cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
          },
          {
            accessorKey: "description",
            header: () => <div>Descripción</div>,
            cell: ({ row }) => <span className="text-xs text-gray-500">{row.original.description ?? "-"}</span>,
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
              <div className="flex justify-center">
                <UpdateCleaningMethod cleaningMethod={row.original} />
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
