"use client";

import { Badge } from "@/components/ui/badge";
import { FolderTreeIcon } from "lucide-react";
import { TableCatalogueTypes } from "./table-catalogue-types";
import { useQuery } from "@tanstack/react-query";
import { getCatalogueTypesService } from "./server/db/catalogue-management.service";
import { NewCatalogueType } from "./components/new-catalogue-type";
import { UpdateCatalogueType } from "./components/update-catalogue-type";
import { ManageCatalogueValues } from "./components/manage-catalogue-values";
import { DeleteCatalogueType } from "./components/delete-catalogue-type";

export function CatalogueTypesManagement() {
  const query = useQuery({
    queryKey: ["catalogue-types"],
    queryFn: getCatalogueTypesService,
  });

  return (
    <div>
      <section className="mb-4 flex flex-col sm:flex-row sm:justify-between gap-2">
        <div>
          <h1 className="flex items-center gap-x-2 font-semibold text-xl">
            <FolderTreeIcon />
            Catálogos
          </h1>
          <p className="text-gray-600 text-sm mt-1">
            Catálogo maestro usado para poblar selects de todo el sistema (géneros,
            tipos de identificación, cargos, tipos de vehículo, etc). Usa el botón
            de gestionar catálogo en cada fila para administrar los valores de ese tipo.
          </p>
        </div>
        <div className="flex gap-x-2">
          <NewCatalogueType />
        </div>
      </section>

      <TableCatalogueTypes
        columns={[
          {
            accessorKey: "description",
            header: () => (
              <div className="flex items-center gap-2">
                <FolderTreeIcon className="h-4 w-4" />
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
                <UpdateCatalogueType catalogueType={row.original} />
                <ManageCatalogueValues catalogueType={row.original} />
                <DeleteCatalogueType catalogueType={row.original} />
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
