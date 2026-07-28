"use client";

import { Badge } from "@/components/ui/badge";
import { LayersIcon } from "lucide-react";
import { TableCorralGroups } from "./table-corral-groups";
import { useQuery } from "@tanstack/react-query";
import { getCorralGroupsAdminService } from "./server/db/corral-group-admin.service";
import { NewCorralGroup } from "./components/new-corral-group";
import { UpdateCorralGroup } from "./components/update-corral-group";
import { ManageCorralGroupDetails } from "./components/manage-corral-group-details";
import { DeleteCorralGroup } from "./components/delete-corral-group";

export function CorralGroupsManagement() {
  const query = useQuery({
    queryKey: ["corral-groups-admin"],
    queryFn: getCorralGroupsAdminService,
  });

  return (
    <div>
      <section className="mb-4 flex flex-col sm:flex-row sm:justify-between gap-2">
        <div>
          <h1 className="flex items-center gap-x-2 font-semibold text-xl">
            <LayersIcon />
            Grupos de Corrales
          </h1>
          <p className="text-gray-600 text-sm mt-1">
            Agrupación de corrales en lotes para certificación conjunta. Usa el botón de
            corrales en cada fila para asignar o quitar corrales del grupo.
          </p>
        </div>
        <div className="flex gap-x-2">
          <NewCorralGroup />
        </div>
      </section>

      <TableCorralGroups
        columns={[
          {
            accessorKey: "name",
            header: () => (
              <div className="flex items-center gap-2">
                <LayersIcon className="h-4 w-4" />
                Nombre
              </div>
            ),
            cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
          },
          {
            accessorKey: "line",
            header: () => <div>Línea</div>,
            cell: ({ row }) => (
              <span>
                {row.original.line
                  ? row.original.line.specie
                    ? `${row.original.line.name} (${row.original.line.specie.name})`
                    : row.original.line.name
                  : "-"}
              </span>
            ),
          },
          {
            accessorKey: "finishType",
            header: () => <div>Tipo de acabado</div>,
            cell: ({ row }) => <span>{row.original.finishType?.name ?? "-"}</span>,
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
                <UpdateCorralGroup corralGroup={row.original} />
                <ManageCorralGroupDetails corralGroup={row.original} />
                <DeleteCorralGroup corralGroup={row.original} />
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
