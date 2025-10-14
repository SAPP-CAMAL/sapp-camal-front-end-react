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
  Activity,
  Beef,
  ChevronLeft,
  ChevronRight,
  IdCardIcon,
  Search,
  SearchIcon,
  TagIcon,
  XIcon,
} from "lucide-react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useDebouncedCallback } from "use-debounce";
import { MetaPagination } from "@/features/people/domain";
import { useState } from "react";
import { Specie } from "../domain";
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
    setSearchParams: (params: any) => void;
    searchParams: any;
  };
  isLoading?: boolean;
  children?: React.ReactNode;
  speciesData: Specie[];
}

export type Payment = {
  id: string;
  amount: number;
  status: "pending" | "processing" | "success" | "failed";
  email: string;
};

export function TableIntroducers<TData, TValue>({
  columns,
  data,
  meta,
  isLoading,
  speciesData,
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data: data,
    columns: columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const [fullName, setFullName] = useState("");
  const [identification, setIdentification] = useState("");
  const [brandName, setBrandName] = useState("");

  const start = ((meta?.currentPage ?? 0) - 1) * (meta?.itemsPerPage ?? 0) + 1;

  const end =
    ((meta?.currentPage ?? 0) - 1) * (meta?.itemsPerPage ?? 0) +
    (meta?.itemCount ?? 0);

  const debounceFullName = useDebouncedCallback((text: string) => {
    meta?.setSearchParams({ fullName: text, page: 1 });
  }, 500);

  const debounceIdentification = useDebouncedCallback(
    (text: string) => meta?.setSearchParams({ identification: text, page: 1 }),
    500
  );

  const debounceBrandName = useDebouncedCallback(
    (text: string) => meta?.setSearchParams({ brandName: text, page: 1 }),
    500
  );

  return (
    <div className="overflow-hidden rounded-lg border p-4">
      <div className="py-4 px-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-2 w-full">
          <div className="relative flex items-center">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 z-10 h-5 w-5" />
            <Input
              type="text"
              placeholder="Buscar por nombres"
              className="pl-10 pr-3 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 h-10"
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value);
                debounceFullName(e.target.value);
              }}
            />
          </div>
          <div className="relative flex items-center">
            <IdCardIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 z-10 h-5 w-5" />
            <Input
              type="text"
              placeholder="Número de Identificación"
              className="pl-10 pr-3 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 h-10"
              value={identification}
              onChange={(e) => {
                setIdentification(e.target.value);
                debounceIdentification(e.target.value);
              }}
            />
          </div>
          <div className="relative flex items-center">
            <TagIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 z-10 h-5 w-5" />
            <Input
              type="text"
              placeholder="Buscar por marcas"
              className="pl-10 pr-3 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 h-10"
              value={brandName}
              onChange={(e) => {
                setBrandName(e.target.value);
                debounceBrandName(e.target.value);
              }}
            />
          </div>
          <Select
            onValueChange={(value: string) => {
              meta?.setSearchParams({ species: [value] });
            }}
            value={meta?.searchParams.species[0] ?? "*"}
          >
            <SelectTrigger className="w-full h-10">
              <Beef className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Selecciona una especie" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="*">Todas las especies</SelectItem>
              {speciesData?.map((specie, index) => (
                <SelectItem
                  key={specie.id || index}
                  value={String(specie.name)}
                >
                  {specie.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            onValueChange={(value) => meta?.setSearchParams({ status: value })}
            value={meta?.searchParams.status ?? "*"}
          >
            <SelectTrigger className="w-full h-10">
              <Activity className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Seleccione un estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={"*"}>Todos los estados</SelectItem>
              <SelectItem value={"true"}>Activos</SelectItem>
              <SelectItem value={"false"}>Inactivos</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {Object.keys(meta?.searchParams).length > 0 && (
          <div className="mt-4 flex justify-end">
            <Button
              variant={"outline"}
              onClick={() => {
                meta?.setSearchParams(null);
                setFullName("");
                setIdentification("");
                setBrandName("");
              }}
            >
              <XIcon />
              Limpiar Filtros
            </Button>
          </div>
        )}
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
