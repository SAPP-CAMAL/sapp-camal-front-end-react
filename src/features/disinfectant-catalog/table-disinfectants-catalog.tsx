"use client";

import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
} from "@tanstack/react-table";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { MetaPagination } from "@/features/people/domain";
import { PaginationFooter } from "@/components/ui/pagination-footer";

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    meta?: MetaPagination & {
        onChangePage?: (page: number) => void;
        onNextPage?: () => void;
        disabledNextPage: boolean;
        onPreviousPage?: () => void;
        disabledPreviousPage: boolean;
        setSearchParams: (params: Record<string, any>) => void;
    };
    isLoading?: boolean;
}

export function TableDisinfectantsCatalog<TData, TValue>({
    columns,
    data,
    meta,
    isLoading,
}: DataTableProps<TData, TValue>) {
    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    return (
        <div className="bg-white border rounded-lg overflow-hidden">
            <div className="py-4 px-4 flex flex-col border-b">
                <Label className="font-semibold text-lg lg:text-base">Desinfectantes</Label>
            </div>

            <div className="hidden lg:block">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id} className="first:pl-4 last:pr-4">
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(header.column.columnDef.header, header.getContext())}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-48 text-center animate-pulse">
                                    Cargando datos...
                                </TableCell>
                            </TableRow>
                        ) : table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow key={row.id} className="hover:bg-gray-50/50 transition-colors">
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id} className="first:pl-4 last:pr-4">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-48 text-center">
                                    <div className="flex flex-col items-center gap-2 text-gray-500">
                                        <Search className="h-8 w-8 opacity-20" />
                                        <p>No se encontraron registros</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="lg:hidden p-4">
                {isLoading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <Card key={i} className="animate-pulse h-32" />
                        ))}
                    </div>
                ) : table.getRowModel().rows?.length ? (
                    <div className="grid grid-cols-1 gap-3">
                        {table.getRowModel().rows.map((row) => {
                            const cellsById = Object.fromEntries(
                                row.getVisibleCells().map((cell) => [cell.column.id, cell])
                            );
                            return (
                                <Card key={row.id} className="overflow-hidden border-gray-200 py-0 gap-0">
                                    <CardContent className="p-4 space-y-2">
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="font-semibold text-sm min-w-0 truncate">
                                                {cellsById.name &&
                                                    flexRender(cellsById.name.column.columnDef.cell, cellsById.name.getContext())}
                                            </div>
                                            {cellsById.status && (
                                                <div className="shrink-0">
                                                    {flexRender(cellsById.status.column.columnDef.cell, cellsById.status.getContext())}
                                                </div>
                                            )}
                                        </div>
                                        {cellsById.description && (
                                            <div className="text-sm text-gray-500">
                                                {flexRender(cellsById.description.column.columnDef.cell, cellsById.description.getContext())}
                                            </div>
                                        )}
                                        {cellsById.actions && (
                                            <div className="flex justify-end gap-2 pt-2 mt-2 border-t">
                                                {flexRender(cellsById.actions.column.columnDef.cell, cellsById.actions.getContext())}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                ) : (
                    <div className="py-12 text-center text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed">
                        <Search className="h-8 w-8 mx-auto mb-2 opacity-20" />
                        <p>No hay datos disponibles</p>
                    </div>
                )}
            </div>

            <PaginationFooter
                meta={meta}
                isLoading={isLoading}
                hasData={!!data?.length}
                onPreviousPage={() => meta?.onPreviousPage?.()}
                onNextPage={() => meta?.onNextPage?.()}
                disabledPreviousPage={!!meta?.disabledPreviousPage}
                disabledNextPage={!!meta?.disabledNextPage}
            />
        </div>
    );
}
