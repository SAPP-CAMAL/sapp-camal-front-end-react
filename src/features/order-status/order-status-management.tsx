"use client";

import { Badge } from "@/components/ui/badge";
import { ListChecksIcon } from "lucide-react";
import { TableOrderStatus } from "./table-order-status";
import { useQuery } from "@tanstack/react-query";
import { getOrderStatusAllService } from "./server/db/order-status.service";
import { NewOrderStatus } from "./components/new-order-status";
import { UpdateOrderStatus } from "./components/update-order-status";

export function OrderStatusManagement() {
    const query = useQuery({
        queryKey: ["order-status-admin"],
        queryFn: getOrderStatusAllService,
    });

    return (
        <div>
            <section className="mb-4 flex flex-col sm:flex-row sm:justify-between gap-2">
                <div>
                    <h1 className="flex items-center gap-x-2 font-semibold text-xl">
                        <ListChecksIcon />
                        Estados de Pedido
                    </h1>
                    <p className="text-gray-600 text-sm mt-1">
                        Catálogo de estados del ciclo de vida de un pedido de distribución.
                    </p>
                </div>
                <div className="flex gap-x-2">
                    <NewOrderStatus />
                </div>
            </section>

            <TableOrderStatus
                columns={[
                    {
                        accessorKey: "name",
                        header: () => (
                            <div className="flex items-center gap-2">
                                <ListChecksIcon className="h-4 w-4" />
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
                                <UpdateOrderStatus orderStatus={row.original} />
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
