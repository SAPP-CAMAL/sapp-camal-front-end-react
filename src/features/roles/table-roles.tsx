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
import {
  ChevronLeft,
  ChevronRight,
  Search,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { MetaPagination } from "../people/domain";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

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

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type Payment = {
  id: string;
  amount: number;
  status: "pending" | "processing" | "success" | "failed";
  email: string;
};

export function TableRoles<TData, TValue>({
  columns,
  data,
  meta,
  isLoading,
}: DataTableProps<TData, TValue>) {
  const searchParams = useSearchParams();
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

  return (
    <div className="bg-white border rounded-lg overflow-hidden">
      <div className="py-4 px-4 flex flex-col border-b">
        <Label className="font-semibold text-lg lg:text-base">Lista de Roles</Label>
      </div>

      <div className="hidden lg:block">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
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
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
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
          <div className="grid grid-cols-1 gap-4">
            {table.getRowModel().rows.map((row) => (
              <Card key={row.id} className="overflow-hidden border-gray-200">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    {row.getVisibleCells().map((cell) => {
                      const header = cell.column.columnDef.header as string;
                      const hasLabel = typeof header === "string" && !header.includes("Acciones");

                      return (
                        <div key={cell.id} className="flex flex-col gap-1">
                          {hasLabel && <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{header}</span>}
                          <div className="text-sm">{flexRender(cell.column.columnDef.cell, cell.getContext())}</div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed">
            <Search className="h-8 w-8 mx-auto mb-2 opacity-20" />
            <p>No hay datos disponibles</p>
          </div>
        )}
      </div>

      <div className="p-4 bg-gray-50/50 border-t">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500 order-2 sm:order-1">
            Mostrando <span className="font-medium text-gray-900">{start}</span> a{" "}
            <span className="font-medium text-gray-900">{end}</span> de <span className="font-medium text-gray-900">{meta?.totalItems}</span> registros
          </p>
          <div className="flex items-center gap-2 order-1 sm:order-2">
            <Button
              size="sm"
              variant="outline"
              className="h-8 px-3"
              disabled={meta?.disabledPreviousPage}
              onClick={() => meta?.onPreviousPage?.()}
            >
              <ChevronLeft className="h-4 w-4 sm:mr-1" />
              <span className="hidden sm:inline">Anterior</span>
            </Button>

            <div className="flex items-center gap-1">
              <span className="text-xs font-medium px-2 py-1 bg-white border rounded">
                {meta?.currentPage} / {meta?.totalPages}
              </span>
            </div>

            <Button
              size="sm"
              variant="outline"
              className="h-8 px-3"
              disabled={meta?.disabledNextPage}
              onClick={() => meta?.onNextPage?.()}
            >
              <span className="hidden sm:inline">Siguiente</span>
              <ChevronRight className="h-4 w-4 sm:ml-1" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
