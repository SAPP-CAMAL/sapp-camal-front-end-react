"use client";

import { Badge } from "@/components/ui/badge";
import { PawPrintIcon } from "lucide-react";
import { TableSpecies } from "./table-species";
import { useQuery } from "@tanstack/react-query";
import { getSpeciesAdminService } from "./server/db/specie-admin.service";
import { NewSpecie } from "./components/new-specie";
import { UpdateSpecie } from "./components/update-specie";

export function SpeciesManagement() {
    const query = useQuery({
        queryKey: ["species-admin"],
        queryFn: getSpeciesAdminService,
    });

    return (
        <div>
            <section className="mb-4 flex flex-col sm:flex-row sm:justify-between gap-2">
                <div>
                    <h1 className="flex items-center gap-x-2 font-semibold text-xl">
                        <PawPrintIcon />
                        Especies
                    </h1>
                    <p className="text-gray-600 text-sm mt-1">
                        Catálogo de especies de animales.
                    </p>
                </div>
                <div className="flex gap-x-2">
                    <NewSpecie />
                </div>
            </section>

            <TableSpecies
                columns={[
                    {
                        accessorKey: "name",
                        header: () => (
                            <div className="flex items-center gap-2">
                                <PawPrintIcon className="h-4 w-4" />
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
                                <UpdateSpecie specie={row.original} />
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
