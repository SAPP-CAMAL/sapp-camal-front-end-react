"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MetaPagination } from "@/features/people/domain";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export type Payment = {
  id: string;
  amount: number;
  status: "pending" | "processing" | "success" | "failed";
  email: string;
};

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
  children?: React.ReactNode;
}

export function EmployeeTable<TData, TValue>({
  columns,
  data,
  meta,
  isLoading,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  let start = ((meta?.currentPage ?? 0) - 1) * (meta?.itemsPerPage ?? 0) + 1;
  if (isLoading || !data?.length) start = 0;
  const end =
    ((meta?.currentPage ?? 0) - 1) * (meta?.itemsPerPage ?? 0) +
    (meta?.itemCount ?? 0);

  return (
    <div className="w-full p-4 lg:p-6">
      <div className="py-4 px-2 flex flex-col">
        <Label className="font-semibold text-lg lg:text-base">Lista de Empleados</Label>
      </div>

      {/* Vista de Tabla para Pantallas Grandes */}
      <div className="hidden lg:block overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-96 text-center animate-pulse font-semibold"
                >
                  Cargando...
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-96 text-center">
                  <Card className="max-w-full border-0 shadow-none bg-transparent">
                    <CardContent className="py-20">
                      <div className="flex flex-col items-center gap-3">
                        <div className="rounded-full bg-muted p-3">
                          <Search className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <div className="text-center">
                          <h3 className="font-medium text-muted-foreground mb-1">
                            No se encontraron registros
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Intenta ajustar los filtros.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Vista de Tarjetas para Pantallas Pequeñas */}
      <div className="lg:hidden space-y-4">
        {isLoading ? (
          <div className="h-96 flex items-center justify-center animate-pulse font-semibold">
            Cargando...
          </div>
        ) : table.getRowModel().rows?.length ? (
          table.getRowModel().rows.map((row) => (
            <Card key={row.id} className="overflow-hidden">
              <CardContent className="p-4 space-y-3">
                {row.getVisibleCells().map((cell) => {
                  const header = cell.column.columnDef.header?.toString() || "";
                  const content = flexRender(cell.column.columnDef.cell, cell.getContext());
                  
                  return (
                    <div key={cell.id} className="flex flex-col gap-1 border-b last:border-0 pb-2 last:pb-0">
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        {header}
                      </span>
                      <div className="text-sm">
                        {content}
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="py-20 text-center text-muted-foreground">
            No se encontraron registros
          </div>
        )}
      </div>

      {/* Paginación - Responsiva */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mt-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          {meta?.totalItems && meta?.totalItems > 0 && (
            <p className="text-sm text-gray-600">
              Mostrando {start > 0 && `${start} a`} {end} de {meta?.totalItems} registros
            </p>
          )}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Mostrar:</span>
            <Select
              value={(meta?.itemsPerPage ?? 10).toString()}
              onValueChange={(value) => meta?.setSearchParams({ limit: Number(value), page: 1 })}
            >
              <SelectTrigger className="w-20 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center justify-center sm:justify-end gap-x-2">
          <Button
            size="sm"
            disabled={meta?.disabledPreviousPage}
            onClick={() => meta?.onPreviousPage?.()}
            variant={"outline"}
            className="flex items-center gap-1"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Anterior</span>
          </Button>
          
          <div className="flex items-center gap-1">
            {meta && meta.totalPages && meta.totalPages > 1 && (
              <div className="hidden sm:flex items-center gap-1">
                {Array.from({ length: Math.min(meta.totalPages, 5) }, (_, i) => {
                  const pageNumber = i + 1;
                  const isCurrentPage = pageNumber === (meta.currentPage || 1);
                  return (
                    <Button
                      key={i}
                      size="sm"
                      variant={"outline"}
                      className={isCurrentPage ? "bg-primary text-primary-foreground" : "h-8 w-8 p-0"}
                      onClick={() => meta.onChangePage?.(pageNumber)}
                    >
                      {pageNumber}
                    </Button>
                  );
                })}
                {meta.totalPages > 5 && <span className="text-muted-foreground">...</span>}
              </div>
            )}
            <span className="sm:hidden text-sm font-medium">
              Pág. {meta?.currentPage} de {meta?.totalPages}
            </span>
          </div>

          <Button
            size="sm"
            variant={"outline"}
            disabled={meta?.disabledNextPage}
            onClick={() => meta?.onNextPage?.()}
            className="flex items-center gap-1"
          >
            <span className="hidden sm:inline">Siguiente</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

