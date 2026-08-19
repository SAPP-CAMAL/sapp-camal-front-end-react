"use client";

import { Badge } from "@/components/ui/badge";
import { LayersIcon } from "lucide-react";
import { TableReportSections } from "./table-report-sections";
import { useQuery } from "@tanstack/react-query";
import { getReportSectionsByTemplateService } from "./server/db/report-template-admin.service";
import { NewReportSection } from "./components/new-report-section";
import { UpdateReportSection } from "./components/update-report-section";
import { ManageReportElements } from "./components/manage-report-elements";
import { DeleteReportSection } from "./components/delete-report-section";

export function ReportSectionsManagement({ fixedTemplateId }: { fixedTemplateId: number }) {
    const query = useQuery({
        queryKey: ["report-sections-admin", fixedTemplateId],
        queryFn: () => getReportSectionsByTemplateService(fixedTemplateId),
    });

    return (
        <div>
            <div className="flex justify-end mb-4">
                <NewReportSection fixedTemplateId={fixedTemplateId} />
            </div>

            <TableReportSections
                columns={[
                    {
                        accessorKey: "sectionName",
                        header: () => (
                            <div className="flex items-center gap-2">
                                <LayersIcon className="h-4 w-4" />
                                Nombre
                            </div>
                        ),
                        cell: ({ row }) => <span className="font-medium">{row.original.sectionName}</span>,
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
                            <div className="flex justify-center gap-2">
                                <ManageReportElements reportSection={row.original} />
                                <UpdateReportSection reportSection={row.original} />
                                <DeleteReportSection reportSection={row.original} />
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
