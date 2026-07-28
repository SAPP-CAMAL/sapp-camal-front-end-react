"use client";

import { Badge } from "@/components/ui/badge";
import { PuzzleIcon } from "lucide-react";
import { TableReportElements } from "./table-report-elements";
import { useQuery } from "@tanstack/react-query";
import { getReportElementsBySectionService } from "./server/db/report-template-admin.service";
import { NewReportElement } from "./components/new-report-element";
import { UpdateReportElement } from "./components/update-report-element";
import { DeleteReportElement } from "./components/delete-report-element";

export function ReportElementsManagement({ fixedSectionId }: { fixedSectionId: number }) {
    const query = useQuery({
        queryKey: ["report-elements-admin", fixedSectionId],
        queryFn: () => getReportElementsBySectionService(fixedSectionId),
    });

    return (
        <div>
            <div className="flex justify-end mb-4">
                <NewReportElement fixedSectionId={fixedSectionId} />
            </div>

            <TableReportElements
                columns={[
                    {
                        accessorKey: "elementType",
                        header: () => (
                            <div className="flex items-center gap-2">
                                <PuzzleIcon className="h-4 w-4" />
                                Tipo
                            </div>
                        ),
                        cell: ({ row }) => <span className="font-medium">{row.original.elementType}</span>,
                    },
                    {
                        accessorKey: "label",
                        header: () => <div>Etiqueta</div>,
                        cell: ({ row }) => <span className="text-xs text-gray-500">{row.original.label ?? "-"}</span>,
                    },
                    {
                        accessorKey: "key",
                        header: () => <div>Clave</div>,
                        cell: ({ row }) => <span className="text-xs text-gray-500">{row.original.key ?? "-"}</span>,
                    },
                    {
                        accessorKey: "orderIndex",
                        header: () => <div>Orden</div>,
                        cell: ({ row }) => <span>{row.original.orderIndex}</span>,
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
                                <UpdateReportElement reportElement={row.original} />
                                <DeleteReportElement reportElement={row.original} />
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
