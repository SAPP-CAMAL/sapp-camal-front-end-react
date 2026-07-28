"use client";

import { Badge } from "@/components/ui/badge";
import { SprayCanIcon } from "lucide-react";
import { TableDisinfectantsCatalog } from "./table-disinfectants-catalog";
import { useQuery } from "@tanstack/react-query";
import { getDisinfectantsCatalogService } from "./server/db/disinfectant-catalog.service";
import { NewDisinfectantCatalog } from "./components/new-disinfectant-catalog";
import { UpdateDisinfectantCatalog } from "./components/update-disinfectant-catalog";
import { DeleteDisinfectantCatalog } from "./components/delete-disinfectant-catalog";

export function DisinfectantsCatalogManagement() {
    const query = useQuery({
        queryKey: ["disinfectants-catalog"],
        queryFn: getDisinfectantsCatalogService,
    });

    return (
        <div>
            <section className="mb-4 flex flex-col sm:flex-row sm:justify-between gap-2">
                <div>
                    <h1 className="flex items-center gap-x-2 font-semibold text-xl">
                        <SprayCanIcon />
                        Desinfectantes
                    </h1>
                    <p className="text-gray-600 text-sm mt-1">
                        Catálogo de desinfectantes usados en el registro de vehículos.
                    </p>
                </div>
                <div className="flex gap-x-2">
                    <NewDisinfectantCatalog />
                </div>
            </section>

            <TableDisinfectantsCatalog
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
                            <div className="flex justify-center gap-x-2">
                                <UpdateDisinfectantCatalog disinfectant={row.original} />
                                <DeleteDisinfectantCatalog disinfectant={row.original} />
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
