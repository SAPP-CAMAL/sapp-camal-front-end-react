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
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { MetaPagination } from "@/features/people/domain";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

interface DataTableProps<TData extends { id: number }, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  meta?: MetaPagination & {
    onChangePage?: (page: number) => void;
    onNextPage?: () => void;
    disabledNextPage: boolean;
    onPreviousPage?: () => void;
    disabledPreviousPage: boolean;
    setSearchParams: (params: Record<string, number | string>) => void;
  };
  isLoading?: boolean;
  title?: string;
}

export function SeizuresTable<TData extends { id: number }, TValue>({
  columns,
  data,
  meta,
  isLoading,
  title = "Lista de Decomisos",
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data: data,
    columns: columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => String(row.id),
  });

  let start = ((meta?.currentPage ?? 0) - 1) * (meta?.itemsPerPage ?? 0) + 1;

  if (isLoading || !data?.length) start = 0;

  const end =
    ((meta?.currentPage ?? 0) - 1) * (meta?.itemsPerPage ?? 0) +
    (meta?.itemCount ?? 0);

  // Calcular páginas visibles para paginación responsiva
  const getVisiblePages = () => {
    const totalPages = meta?.totalPages ?? 1;
    const currentPage = meta?.currentPage ?? 1;
    const maxVisible = 3;

    if (totalPages <= maxVisible) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const half = Math.floor(maxVisible / 2);
    let startPage = Math.max(1, currentPage - half);
    const endPage = Math.min(totalPages, startPage + maxVisible - 1);

    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    return Array.from(
      { length: endPage - startPage + 1 },
      (_, i) => startPage + i
    );
  };

  return (
    <div className="overflow-hidden rounded-lg border p-2 sm:p-4">
      <div className="py-2 sm:py-4 px-2 flex flex-col">
        <Label className="font-semibold text-sm sm:text-base">{title}</Label>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className="whitespace-nowrap text-xs sm:text-sm">
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
                  className="h-48 sm:h-96 text-center animate-pulse font-semibold text-sm"
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
                    <TableCell key={cell.id} className="text-xs sm:text-sm py-2 sm:py-4">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-48 sm:h-96 text-center">
                  <Card className="max-w-full border-0 shadow-none bg-transparent">
                    <CardContent className="py-10 sm:py-20">
                      <div className="flex flex-col items-center gap-3">
                        <div className="rounded-full bg-muted p-3">
                          <Search className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground" />
                        </div>
                        <div className="text-center">
                          <h3 className="font-medium text-muted-foreground mb-1 text-sm sm:text-base">
                            No se encontraron registros
                          </h3>
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            Intenta ajustar los filtros
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
      <div className="flex flex-col sm:flex-row items-center justify-between mt-4 gap-3">
        <p className="text-xs sm:text-sm text-gray-600 order-2 sm:order-1">
          Mostrando {start > 0 && `${start} a`} {end} de {meta?.totalItems}{" "}
          registros
        </p>
        <div className="flex items-center gap-x-1 sm:gap-x-2 order-1 sm:order-2">
          <Button
            disabled={meta?.disabledPreviousPage}
            onClick={() => meta?.onPreviousPage?.()}
            variant={"outline"}
            size="sm"
            className="text-xs sm:text-sm px-2 sm:px-3"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Anterior</span>
          </Button>
          {getVisiblePages().map((pageNum) => (
            <Button
              key={pageNum}
              variant={"outline"}
              size="sm"
              className={`text-xs sm:text-sm px-2 sm:px-3 min-w-[32px] ${
                pageNum === (meta?.currentPage ?? 1)
                  ? "bg-primary text-primary-foreground"
                  : ""
              }`}
              onClick={() => meta?.onChangePage?.(pageNum)}
            >
              {pageNum}
            </Button>
          ))}
          <Button
            variant={"outline"}
            disabled={meta?.disabledNextPage}
            onClick={() => meta?.onNextPage?.()}
            size="sm"
            className="text-xs sm:text-sm px-2 sm:px-3"
          >
            <span className="hidden sm:inline">Siguiente</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
