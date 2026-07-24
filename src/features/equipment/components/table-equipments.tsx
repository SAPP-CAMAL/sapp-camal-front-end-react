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

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  isLoading?: boolean;
}

export function TableEquipments<TData, TValue>({
  columns,
  data,
  isLoading,
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data: data,
    columns: columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="bg-white border rounded-lg overflow-hidden">
      <div className="py-4 px-4 flex flex-col border-b">
        <Label className="font-semibold text-lg lg:text-base">
          Lista de Equipos
        </Label>
      </div>

      <div className="hidden lg:block overflow-x-auto">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-32 text-center animate-pulse"
                >
                  Cargando datos...
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="hover:bg-gray-50/50 transition-colors"
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
                <TableCell colSpan={columns.length} className="h-32 text-center">
                  <div className="flex flex-col items-center gap-2 text-gray-500">
                    <Search className="h-6 w-6 opacity-20" />
                    <p className="text-sm">No se encontraron registros</p>
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
                      const hasLabel =
                        typeof header === "string" &&
                        !header.includes("Acciones");

                      return (
                        <div key={cell.id} className="flex flex-col gap-1">
                          {hasLabel && (
                            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                              {header}
                            </span>
                          )}
                          <div className="text-sm">
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </div>
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
    </div>
  );
}
