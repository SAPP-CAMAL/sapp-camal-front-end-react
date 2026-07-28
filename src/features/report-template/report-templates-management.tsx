"use client";

import { Badge } from "@/components/ui/badge";
import { FileTextIcon } from "lucide-react";
import { TableReportTemplates } from "./table-report-templates";
import { useQuery } from "@tanstack/react-query";
import { getReportTemplatesAdminService } from "./server/db/report-template-admin.service";
import { NewReportTemplate } from "./components/new-report-template";
import { UpdateReportTemplate } from "./components/update-report-template";
import { ManageReportSections } from "./components/manage-report-sections";
import { DeleteReportTemplate } from "./components/delete-report-template";

export function ReportTemplatesManagement() {
    const query = useQuery({
        queryKey: ["report-templates-admin"],
        queryFn: getReportTemplatesAdminService,
    });

    return (
        <div>
            <section className="mb-4 flex flex-col sm:flex-row sm:justify-between gap-2">
                <div>
                    <h1 className="flex items-center gap-x-2 font-semibold text-xl">
                        <FileTextIcon />
                        Plantillas de Reporte
                    </h1>
                    <p className="text-gray-600 text-sm mt-1">
                        Diseñador de plantillas de reporte exportables (Excel/PDF).
                    </p>
                </div>
                <div className="flex gap-x-2">
                    <NewReportTemplate />
                </div>
            </section>

            <TableReportTemplates
                columns={[
                    {
                        accessorKey: "name",
                        header: () => (
                            <div className="flex items-center gap-2">
                                <FileTextIcon className="h-4 w-4" />
                                Nombre
                            </div>
                        ),
                        cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
                    },
                    {
                        accessorKey: "code",
                        header: () => <div>Código</div>,
                        cell: ({ row }) => <span className="text-xs text-gray-500">{row.original.code?.code ?? "-"}</span>,
                    },
                    {
                        accessorKey: "type",
                        header: () => <div>Tipo</div>,
                        cell: ({ row }) => <span className="text-xs text-gray-500">{row.original.type}</span>,
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
                                <ManageReportSections reportTemplate={row.original} />
                                <UpdateReportTemplate reportTemplate={row.original} />
                                <DeleteReportTemplate reportTemplate={row.original} />
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
