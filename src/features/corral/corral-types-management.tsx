"use client";

import { Badge } from "@/components/ui/badge";
import { HouseIcon } from "lucide-react";
import { TableCorralTypes } from "./table-corral-types";
import { useQuery } from "@tanstack/react-query";
import { getCorralTypesAdminService } from "./server/db/corral-type-admin.service";
import { NewCorralType } from "./components/new-corral-type";
import { UpdateCorralType } from "./components/update-corral-type";
import { DeleteCorralType } from "./components/delete-corral-type";

export function CorralTypesManagement() {
  const query = useQuery({
    queryKey: ["corral-types-admin"],
    queryFn: getCorralTypesAdminService,
  });

  return (
    <div>
      <section className="mb-4 flex flex-col sm:flex-row sm:justify-between gap-2">
        <div>
          <h1 className="flex items-center gap-x-2 font-semibold text-xl">
            <HouseIcon />
            Tipos de Corral
          </h1>
          <p className="text-gray-600 text-sm mt-1">
            Catálogo de tipos de corral (ej. cuarentena, engorde) usado al registrar corrales.
          </p>
        </div>
        <div className="flex gap-x-2">
          <NewCorralType />
        </div>
      </section>

      <TableCorralTypes
        columns={[
          {
            accessorKey: "description",
            header: () => (
              <div className="flex items-center gap-2">
                <HouseIcon className="h-4 w-4" />
                Descripción
              </div>
            ),
            cell: ({ row }) => <span className="font-medium">{row.original.description}</span>,
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
                <UpdateCorralType corralType={row.original} />
                <DeleteCorralType corralType={row.original} />
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
