"use client";

import { Badge } from "@/components/ui/badge";
import { SearchIcon, WorkflowIcon } from "lucide-react";
import { TableLines } from "./table-lines";
import { useQuery } from "@tanstack/react-query";
import { parseAsInteger, parseAsString, useQueryStates } from "nuqs";
import { useDebouncedCallback } from "use-debounce";
import { getLinesAdminService } from "./server/db/line-admin.service";
import { NewLine } from "./components/new-line";
import { UpdateLine } from "./components/update-line";
import { DeleteLine } from "./components/delete-line";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function LinesManagement() {
    const [searchParams, setSearchParams] = useQueryStates(
        {
            page: parseAsInteger.withDefault(1),
            limit: parseAsInteger.withDefault(10),
            name: parseAsString.withDefault(""),
        },
        { history: "push" }
    );

    const query = useQuery({
        queryKey: ["lines-admin", searchParams],
        queryFn: () =>
            getLinesAdminService({
                page: searchParams.page,
                limit: searchParams.limit,
                ...(!!searchParams.name && { name: searchParams.name }),
            }),
    });

    const debounceName = useDebouncedCallback(
        (text: string) => setSearchParams({ name: text, page: 1 }),
        500
    );

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

            <Card className="mb-4 py-3 gap-2">
                <CardHeader className="px-4 gap-0.5">
                    <CardTitle className="flex gap-2 items-center text-sm">
                        Filtros de Búsqueda
                    </CardTitle>
                </CardHeader>
                <CardContent className="px-4">
                    <div className="flex flex-col w-full sm:max-w-sm">
                        <label className="mb-1 text-sm font-medium text-gray-700">
                            Buscar por nombre
                        </label>
                        <div className="relative">
                            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 z-10 h-5 w-5" />
                            <Input
                                type="text"
                                placeholder="Buscar por nombre..."
                                className="pl-10 pr-3 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2"
                                defaultValue={searchParams.name}
                                onChange={(e) => debounceName(e.target.value)}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

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
                data={query.data?.data.items ?? []}
                meta={{
                    ...query.data?.data.meta,
                    onChangePage: (page) => setSearchParams({ page }),
                    onNextPage: () => setSearchParams({ page: searchParams.page + 1 }),
                    disabledNextPage: searchParams.page >= (query.data?.data.meta.totalPages ?? 0),
                    onPreviousPage: () => setSearchParams({ page: searchParams.page - 1 }),
                    disabledPreviousPage: searchParams.page <= 1,
                    setSearchParams,
                }}
                isLoading={query.isLoading}
            />
        </div>
    );
}
