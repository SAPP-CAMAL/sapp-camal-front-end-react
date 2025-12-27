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
import { MetaPagination } from "../domain";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  Search,
} from "lucide-react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useSearchParams } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";
import { Card, CardContent } from "@/components/ui/card";

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

export type Payment = {
  id: string;
  amount: number;
  status: "pending" | "processing" | "success" | "failed";
  email: string;
};

export function PeopleTable<TData, TValue>({
  columns,
  data,
  meta,
  isLoading,
}: DataTableProps<TData, TValue>) {
  const searhParams = useSearchParams();
  const table = useReactTable({
    data: data,
    columns: columns,
    getCoreRowModel: getCoreRowModel(),
  });

  let start = ((meta?.currentPage ?? 0) - 1) * (meta?.itemsPerPage ?? 0) + 1;

	if (isLoading || !data?.length) start = 0;

  const end =
    ((meta?.currentPage ?? 0) - 1) * (meta?.itemsPerPage ?? 0) +
    (meta?.itemCount ?? 0);

  const debounceFullName = useDebouncedCallback(
    (text: string) =>
      meta?.setSearchParams({
        fullName: text,
        page: 1,
        limit: 10,
      }),
    500
  );

  const debounceIdentification = useDebouncedCallback(
    (text: string) =>
      meta?.setSearchParams({
        identification: text,
        page: 1,
        limit: 10,
      }),
    500
  );

  return (
    <div className="overflow-hidden rounded-lg border p-4">
      {/* <div className="py-4 px-2">
        <h2>Lista de Personas</h2>
      </div> */}
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
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
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
      <div className="h-10 flex items-end justify-between mt-4">
        <div className="flex items-center gap-4">
          <p className="text-sm text-gray-600">
            Mostrando {start > 0 && `${start} a`} {end} de {meta?.totalItems ?? 0} personas
          </p>
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
        <div className="flex items-center gap-x-2">
          <Button
            disabled={meta?.disabledPreviousPage}
            onClick={() => meta?.onPreviousPage?.()}
            variant={"outline"}
          >
            <ChevronLeft />
            Anterior
          </Button>
          {meta && meta.totalPages && meta.totalPages > 1 && (
            <>
              {Array.from({ length: Math.min(meta.totalPages, 10) }, (_, i) => {
                const pageNumber = i + 1;
                const isCurrentPage = pageNumber === (meta.currentPage || 1);

                // Show first page, last page, current page, and pages around current
                const showPage =
                  pageNumber === 1 ||
                  pageNumber === meta.totalPages ||
                  Math.abs(pageNumber - (meta.currentPage || 1)) <= 2;

                if (!showPage) return null;

                return (
                  <Button
                    key={i}
                    variant={"outline"}
                    className={
                      isCurrentPage ? "bg-primary text-primary-foreground" : ""
                    }
                    onClick={() => meta.onChangePage?.(pageNumber)}
                  >
                    {pageNumber}
                  </Button>
                );
              })}
              {meta.totalPages > 10 && (
                <span className="px-2">... {meta.totalPages}</span>
              )}
            </>
          )}
          <Button
            variant={"outline"}
            disabled={meta?.disabledNextPage}
            onClick={() => meta?.onNextPage?.()}
          >
            Siguiente
            <ChevronRight />
          </Button>
        </div>
      </div>
    </div>
  );
}
