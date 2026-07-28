"use client";

import { Badge } from "@/components/ui/badge";
import { MessageSquareWarningIcon } from "lucide-react";
import { TableObservations } from "./table-observations";
import { useQuery } from "@tanstack/react-query";
import { getObservationsAdminService } from "./server/db/observation-admin.service";
import { NewObservation } from "./components/new-observation";
import { UpdateObservation } from "./components/update-observation";
import { DeleteObservation } from "./components/delete-observation";

export function ObservationsManagement() {
  const query = useQuery({
    queryKey: ["observations-admin"],
    queryFn: getObservationsAdminService,
  });

  return (
    <div>
      <section className="mb-4 flex flex-col sm:flex-row sm:justify-between gap-2">
        <div>
          <h1 className="flex items-center gap-x-2 font-semibold text-xl">
            <MessageSquareWarningIcon />
            Observaciones de Casillero
          </h1>
          <p className="text-gray-600 text-sm mt-1">
            Catálogo de tipos de observación aplicables al control de casilleros/vestidores.
          </p>
        </div>
        <div className="flex gap-x-2">
          <NewObservation />
        </div>
      </section>

      <TableObservations
        columns={[
          {
            accessorKey: "name",
            header: () => (
              <div className="flex items-center gap-2">
                <MessageSquareWarningIcon className="h-4 w-4" />
                Nombre
              </div>
            ),
            cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
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
                <UpdateObservation observation={row.original} />
                <DeleteObservation observation={row.original} />
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
