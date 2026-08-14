"use client";

import { Badge } from "@/components/ui/badge";
import { SprayCanIcon, SearchIcon } from "lucide-react";
import { TableDisinfectantsCatalog } from "./table-disinfectants-catalog";
import { useQuery } from "@tanstack/react-query";
import { parseAsInteger, parseAsString, useQueryStates } from "nuqs";
import { getDisinfectantsCatalogPaginatedService } from "./server/db/disinfectant-catalog.service";
import { NewDisinfectantCatalog } from "./components/new-disinfectant-catalog";
import { UpdateDisinfectantCatalog } from "./components/update-disinfectant-catalog";
import { DeleteDisinfectantCatalog } from "./components/delete-disinfectant-catalog";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useDebouncedCallback } from "use-debounce";

export function DisinfectantsCatalogManagement() {
    const [searchParams, setSearchParams] = useQueryStates(
        {
            page: parseAsInteger.withDefault(1),
            limit: parseAsInteger.withDefault(10),
            name: parseAsString.withDefault(""),
            status: parseAsString.withDefault("*"),
        },
        { history: "push" }
    );

    const query = useQuery({
        queryKey: ["disinfectants-catalog", searchParams],
        queryFn: () =>
            getDisinfectantsCatalogPaginatedService({
                page: searchParams.page,
                limit: searchParams.limit,
                ...(!!searchParams.name && { name: searchParams.name }),
                ...(searchParams.status !== "*" && {
                    status: searchParams.status === "true",
                }),
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

            <Card className="mb-4">
                <CardHeader>
                    <CardTitle className="flex gap-2 items-center">
                        Filtros de Búsqueda
                    </CardTitle>
                    <CardDescription>
                        Filtre los desinfectantes por nombre o estado
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="flex flex-col w-full">
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

                        <div className="flex flex-col w-full">
                            <label className="mb-1 text-sm font-medium text-gray-700">
                                Estado
                            </label>
                            <Select
                                onValueChange={(value) => setSearchParams({ status: value, page: 1 })}
                                defaultValue={searchParams.status}
                            >
                                <SelectTrigger className="h-10 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                                    <SelectValue placeholder="Seleccione un estado" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="*">Todos</SelectItem>
                                    <SelectItem value="true">Activos</SelectItem>
                                    <SelectItem value="false">Inactivos</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

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
