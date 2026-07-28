"use client";

import { Badge } from "@/components/ui/badge";
import { FlaskConicalIcon } from "lucide-react";
import { TableCleaningMaterials } from "./table-cleaning-materials";
import { useQuery } from "@tanstack/react-query";
import { getCleaningMaterialsAdminService } from "./server/db/cleaning-material-admin.service";
import { NewCleaningMaterial } from "./components/new-cleaning-material";
import { UpdateCleaningMaterial } from "./components/update-cleaning-material";
import { DeleteCleaningMaterial } from "./components/delete-cleaning-material";

export function CleaningMaterialsManagement() {
  const query = useQuery({
    queryKey: ["cleaning-materials-admin"],
    queryFn: getCleaningMaterialsAdminService,
  });

  return (
    <div>
      <section className="mb-4 flex flex-col sm:flex-row sm:justify-between gap-2">
        <div>
          <h1 className="flex items-center gap-x-2 font-semibold text-xl">
            <FlaskConicalIcon />
            Materiales de Limpieza
          </h1>
          <p className="text-gray-600 text-sm mt-1">
            Catálogo de materiales usados en la dosificación de limpieza.
          </p>
        </div>
        <div className="flex gap-x-2">
          <NewCleaningMaterial />
        </div>
      </section>

      <TableCleaningMaterials
        columns={[
          {
            accessorKey: "name",
            header: () => (
              <div className="flex items-center gap-2">
                <FlaskConicalIcon className="h-4 w-4" />
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
              <div className="flex justify-center gap-x-2">
                <UpdateCleaningMaterial cleaningMaterial={row.original} />
                <DeleteCleaningMaterial cleaningMaterial={row.original} />
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
