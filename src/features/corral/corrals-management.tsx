"use client";

import { Badge } from "@/components/ui/badge";
import { HouseIcon } from "lucide-react";
import { TableCorrals } from "./table-corrals";
import { useQuery } from "@tanstack/react-query";
import { getCorralsAdminService } from "./server/db/corral-admin.service";
import { NewCorral } from "./components/new-corral";
import { UpdateCorral } from "./components/update-corral";

export function CorralsManagement() {
  const query = useQuery({
    queryKey: ["corrals-admin"],
    queryFn: getCorralsAdminService,
  });

  return (
    <div>
      <section className="mb-4 flex flex-col sm:flex-row sm:justify-between gap-2">
        <div>
          <h1 className="flex items-center gap-x-2 font-semibold text-xl">
            <HouseIcon />
            Corrales
          </h1>
          <p className="text-gray-600 text-sm mt-1">
            Registro de corrales físicos del camal, su tipo y capacidad de animales.
          </p>
        </div>
        <div className="flex gap-x-2">
          <NewCorral />
        </div>
      </section>

      <TableCorrals
        columns={[
          {
            accessorKey: "name",
            header: () => (
              <div className="flex items-center gap-2">
                <HouseIcon className="h-4 w-4" />
                Nombre
              </div>
            ),
            cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
          },
          {
            accessorKey: "corralType",
            header: () => <div>Tipo de corral</div>,
            cell: ({ row }) => <span>{row.original.corralType?.description ?? "-"}</span>,
          },
          {
            accessorKey: "quantity",
            header: () => <div>Capacidad</div>,
            cell: ({ row }) => (
              <span>
                {row.original.minimumQuantity} - {row.original.maximumQuantity}
              </span>
            ),
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
                <UpdateCorral corral={row.original} />
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
