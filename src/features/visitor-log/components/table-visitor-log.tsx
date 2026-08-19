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
  Clock,
  Building,
  FileText,
  CreditCard,
  Info,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { MetaPagination } from "@/features/people/domain";
import { useIsMobile } from "@/hooks/use-mobile";
import { VisitorLogFilterResponse } from "../domain";
import { RegisterExitTime } from "./register-exit-time";
import { UpdateVisitorLogDialog } from "./update-visitor-log.form";
import { toCapitalize } from "@/lib/toCapitalize";

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

const formatDateTime = (dateStr: string) => {
  if (!dateStr) return "";
  try {
    const date = new Date(dateStr);
    const parts = new Intl.DateTimeFormat("es-EC", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).formatToParts(date);

    const get = (type: string) => parts.find((p) => p.type === type)?.value;
    return `${get("year")}-${get("month")}-${get("day")} ${get("hour")}:${get("minute")} ${get("dayPeriod")?.toLowerCase()}`;
  } catch (e) {
    return dateStr;
  }
};

const VisitorMobileCard = ({ item }: { item: VisitorLogFilterResponse }) => {
  const formattedEntry = formatDateTime(item.entryTime);
  const formattedExit = item.exitTime ? formatDateTime(item.exitTime) : null;

  return (
    <Card className="mb-4 overflow-hidden border border-gray-200 shadow-xs hover:shadow-md transition-shadow">
      <CardContent className="p-4 space-y-4">
        {/* Header with Name and Actions */}
        <div className="flex justify-between items-start border-b pb-3 gap-2">
          <div className="space-y-1">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Visitante
            </div>
            <h3 className="font-bold text-base text-gray-900 leading-tight">
              {toCapitalize(item.person?.fullName ?? "", true)}
            </h3>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
              <span className="font-medium bg-muted px-2 py-0.5 rounded-xs flex items-center gap-1">
                <CreditCard className="h-3 w-3 text-muted-foreground" />
                {item.person?.identification}
              </span>
            </div>
          </div>
          <div className="flex-shrink-0">
            <UpdateVisitorLogDialog visitor={item} />
          </div>
        </div>

        {/* Time section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-muted/30 rounded-lg p-3 border">
          <div className="space-y-1">
            <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
              <Clock className="h-3 w-3 text-emerald-600" />
              Entrada
            </div>
            <div className="text-sm font-semibold text-gray-800">
              {formattedEntry}
            </div>
          </div>

          <div className="space-y-1 border-t sm:border-t-0 sm:border-l pt-2 sm:pt-0 sm:pl-3">
            <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
              <Clock className="h-3 w-3 text-rose-600" />
              Salida
            </div>
            {formattedExit ? (
              <div className="text-sm font-semibold text-gray-800">
                {formattedExit}
              </div>
            ) : (
              <div className="mt-1">
                <RegisterExitTime id={item.id} />
              </div>
            )}
          </div>
        </div>

        {/* Details section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          {/* Company info */}
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              <Building className="h-3.5 w-3.5 text-blue-500" />
              Empresa
            </div>
            <div className="font-semibold text-gray-800">
              {item.company?.name || "N/A"}
            </div>
            <div className="text-xs text-muted-foreground">
              {item.company?.companyType?.name || ""}
            </div>
          </div>

          {/* Visit Purpose */}
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              <FileText className="h-3.5 w-3.5 text-indigo-500" />
              Motivo de Visita
            </div>
            <div className="font-medium text-gray-800">
              {item.visitPurpose || "N/A"}
            </div>
          </div>
        </div>

        {/* Observations */}
        {item.observation && (
          <div className="bg-yellow-50/50 border border-yellow-100 rounded-lg p-3 text-sm">
            <div className="text-xs font-semibold text-yellow-800 mb-1 flex items-center gap-1">
              <Info className="h-3.5 w-3.5" />
              Observaciones
            </div>
            <p className="text-gray-700 text-xs italic leading-relaxed">
              &quot;{item.observation}&quot;
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export function TableVisitorLog<TData extends VisitorLogFilterResponse, TValue>({
  columns,
  data,
  meta,
  isLoading,
}: DataTableProps<TData, TValue>) {
  const isMobile = useIsMobile();
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
    <div className="overflow-hidden rounded-lg border p-4">
      {isMobile ? (
        <div className="space-y-4 my-2">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            </div>
          ) : data.length === 0 ? (
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
          ) : (
            data.map((item) => (
              <VisitorMobileCard key={item.id} item={item} />
            ))
          )}
        </div>
      ) : (
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
      )}

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
        <p className="text-sm text-gray-600 text-center sm:text-left">
          Mostrando {start > 0 && `${start} a`} {end} de {meta?.totalItems ?? 0}{" "}
          personas
        </p>
        <div className="flex flex-wrap items-center justify-center gap-2">
          <Button
            disabled={meta?.disabledPreviousPage}
            onClick={() => meta?.onPreviousPage?.()}
            variant={"outline"}
            size="sm"
          >
            <ChevronLeft className="h-4 w-4" />
            Anterior
          </Button>
          {meta && meta.totalPages && meta.totalPages > 1 && (
            <div className="hidden sm:flex items-center gap-1">
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
                    size="sm"
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
                <span className="px-2 text-xs">... {meta.totalPages}</span>
              )}
            </div>
          )}
          <Button
            variant={"outline"}
            size="sm"
            disabled={meta?.disabledNextPage}
            onClick={() => meta?.onNextPage?.()}
          >
            Siguiente
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
