"use client";

import { Badge } from "@/components/ui/badge";
import { WorkflowIcon } from "lucide-react";
import { TableLines } from "./table-lines";
import { useQuery } from "@tanstack/react-query";
import { getLinesAdminService } from "./server/db/line-admin.service";
import { NewLine } from "./components/new-line";
import { UpdateLine } from "./components/update-line";
import { DeleteLine } from "./components/delete-line";

export function LinesManagement() {
    const query = useQuery({
        queryKey: ["lines-admin"],
        queryFn: getLinesAdminService,
    });

    return (
        <div>
            <section className="mb-4 flex flex-col sm:flex-row sm:justify-between gap-2">
                <div>
                    <h1 className="flex items-center gap-x-2 font-semibold text-xl">
                        <WorkflowIcon />
                        Líneas de Faenamiento
                    </h1>
                    <p className="text-gray-600 text-sm mt-1">
                        Catálogo de líneas de procesamiento por especie.
                    </p>
                </div>
                <div className="flex gap-x-2">
                    <NewLine />
                </div>
            </section>

            <TableLines
                columns={[
                    {
                        accessorKey: "name",
                        header: () => (
                            <div className="flex items-center gap-2">
                                <WorkflowIcon className="h-4 w-4" />
                                Nombre
                            </div>
                        ),
                        cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
                    },
                    {
                        accessorKey: "specie",
                        header: () => <div>Especie</div>,
                        cell: ({ row }) => <span className="text-xs text-gray-500">{row.original.specie?.name ?? "-"}</span>,
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
                                <UpdateLine line={row.original} />
                                <DeleteLine line={row.original} />
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
