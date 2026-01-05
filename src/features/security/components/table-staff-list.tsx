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
  CreditCardIcon,
  FilterIcon,
  UserIcon,
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
import { MetaPagination } from "@/features/people/domain";

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

export function TableStaffList<TData, TValue>({
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

  const start = ((meta?.currentPage ?? 0) - 1) * (meta?.itemsPerPage ?? 0) + 1;
  const end =
    ((meta?.currentPage ?? 0) - 1) * (meta?.itemsPerPage ?? 0) +
    (meta?.itemCount ?? 0);

  const debounceFullName = useDebouncedCallback(
    (text: string) => meta?.setSearchParams({ fullName: text }),
    500
  );

  const debounceIdentification = useDebouncedCallback(
    (text: string) => meta?.setSearchParams({ identification: text }),
    500
  );

  return (
    <div className="overflow-hidden rounded-lg border p-4">
      <div className="py-4 px-2 flex justify-between">
        <h2>Lista de Personas</h2>
        <div className="flex items-center gap-x-2">
          <FilterIcon size={56} />
          <Select
            onValueChange={(value) => {
              meta?.setSearchParams({
                isEmployee: value === "true" ? "true" : "false",
              });
            }}
            defaultValue={"*"}
          >
            <SelectTrigger className="w-64">
              <SelectValue placeholder="" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={"*"}>Todos</SelectItem>
              <SelectItem value={"true"}>Personal Camal</SelectItem>
              <SelectItem value={"false"}>Otros</SelectItem>
            </SelectContent>
          </Select>
          <Select
            onValueChange={(value) => meta?.setSearchParams({ status: value })}
            defaultValue={"todos"}
          >
            <SelectTrigger className="w-64">
              <SelectValue placeholder="" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={"todos"}>Todos</SelectItem>
              <SelectItem value={"activos"}>Activos</SelectItem>
              <SelectItem value={"inactivos"}>Inactivos</SelectItem>
            </SelectContent>
          </Select>
          <div className="relative h-8 w-full flex items-center ">
            <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 z-10 h-5 w-5" />
            <Input
              type="text"
              placeholder="Buscar por nombres"
              className="pl-10 pr-3 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2"
              defaultValue={searchParams.get("fullName") ?? ""}
              onChange={(e) => debounceFullName(e.target.value)}
            />
          </div>
          <div className="relative h-8 w-full flex items-center ">
            <CreditCardIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 z-10 h-5 w-5" />
            <Input
              type="text"
              placeholder="Buscar por identificación"
              className="pl-10 pr-3 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2"
              defaultValue={searchParams.get("identification") ?? ""}
              onChange={(e) => debounceIdentification(e.target.value)}
            />
          </div>
        </div>
      </div>
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
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No se encontró resultados.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <div className="h-10 flex items-end justify-between mt-4">
        <p className="text-sm text-gray-600">
          Mostrando {start} a {end} de {meta?.totalItems} personas
        </p>
        <div className="flex items-center gap-x-2">
          <Button
            disabled={meta?.disabledPreviousPage}
            onClick={() => meta?.onPreviousPage?.()}
            variant={"outline"}
          >
            <ChevronLeft />
            Anterior
          </Button>
          {Array.from({ length: meta?.totalPages ?? 1 }, (_, i) => (
            <Button
              key={i}
              variant={"outline"}
              className={
                i === (meta?.currentPage ?? 1) - 1
                  ? "bg-primary text-primary-foreground"
                  : ""
              }
              onClick={() => meta?.onChangePage?.(i + 1)}
            >
              {i + 1}
            </Button>
          ))}
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
