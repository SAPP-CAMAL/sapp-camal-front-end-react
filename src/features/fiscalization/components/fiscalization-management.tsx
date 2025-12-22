"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FiscalizationTable } from "./table-fiscalization";
import { parseAsInteger, parseAsString, useQueryStates } from "nuqs";
import {
  FileSpreadsheet,
  SearchIcon,
  X,
  CalendarDays,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { useDebouncedCallback } from "use-debounce";
import { Button } from "@/components/ui/button";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { default as BaseDatePicker } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "@/components/ui/react-datepicker-custom-styles.css";
import { FiscalizationItem } from "../domain";
import {
  downloadFiscalizationExcelReport,
  getFiscalizationByFilterService,
} from "../server/fiscalization.service";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";

export function FiscalizationManagement() {
  const currentMonth = format(new Date(), "yyyy-MM");
  const [isDownloading, setIsDownloading] = useState(false);

  const [searchParams, setSearchParams] = useQueryStates(
    {
      page: parseAsInteger.withDefault(1),
      limit: parseAsInteger.withDefault(10),
      month: parseAsString.withDefault(currentMonth),
      search: parseAsString.withDefault(""),
    },
    {
      history: "push",
    }
  );

  const query = useQuery({
    queryKey: ["fiscalization", searchParams.page, searchParams.limit, searchParams.month],
    queryFn: () =>
      getFiscalizationByFilterService({
        page: searchParams.page,
        limit: searchParams.limit,
        monthlyDate: searchParams.month,
      }),
  });

  const debounceSearch = useDebouncedCallback((text: string) => {
    setSearchParams({ search: text, page: 1 });
  }, 500);

  const handleClearSearch = () => {
    setSearchParams({ search: "", page: 1 });
  };

  const handleDownloadExcel = async () => {
    setIsDownloading(true);
    try {
      const { blob, filename } = await downloadFiscalizationExcelReport(
        searchParams.month
      );
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("Reporte Excel descargado correctamente");
    } catch {
      toast.error("Error al descargar el reporte");
    } finally {
      setIsDownloading(false);
    }
  };

  const data: FiscalizationItem[] = query.data?.data?.items ?? [];

  return (
    <div>
      <section className="mb-4 flex justify-between items-start">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            className="bg-primary text-white hover:text-primary hover:bg-white"
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="font-semibold text-xl">Lista de Fiscalización</h2>
          </div>
        </div>
      </section>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="flex gap-2 items-center">
            Filtros de Búsqueda
          </CardTitle>
          <CardDescription>
            Filtre los registros por fecha y destinatario
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full items-end">
            <div className="flex flex-col w-full">
              <label className="mb-1 text-sm font-medium text-gray-700 flex items-center gap-1">
                <CalendarDays className="h-3.5 w-3.5 text-emerald-600" />
                Fecha
              </label>
              <BaseDatePicker
                selected={parseISO(`${searchParams.month}-01`)}
                onChange={(date: Date | null) => {
                  if (date) {
                    setSearchParams({
                      month: format(date, "yyyy-MM"),
                      page: 1,
                    });
                  }
                }}
                dateFormat="yyyy-MM"
                locale={es}
                showMonthYearPicker
                showIcon
                icon={
                  <CalendarDays className="mt-[1px] text-muted-foreground" />
                }
                placeholderText="Seleccione mes"
                className="border-input flex w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none md:text-sm h-10"
                popperClassName="z-50"
                popperPlacement="bottom-start"
              />
            </div>

            <div className="flex flex-col w-full">
              <label className="mb-1 text-sm font-medium text-gray-700 flex items-center gap-1">
                <SearchIcon className="h-3.5 w-3.5 text-primary" />
                Buscar
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    type="text"
                    placeholder="Buscar..."
                    className="pr-3 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2"
                    defaultValue={searchParams.search}
                    onChange={(e) => debounceSearch(e.target.value)}
                  />
                </div>
                <Button
                  variant="default"
                  size="icon"
                  className="bg-primary hover:bg-primary"
                >
                  <SearchIcon className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleClearSearch}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex flex-col w-full">
              <label className="mb-1 text-sm font-medium text-gray-700 invisible">
                Acciones
              </label>
              <Button
                variant="outline"
                className="border-primary text-primary hover:text-primary hover:border-primary hover:bg-primary"
                onClick={handleDownloadExcel}
                disabled={isDownloading}
              >
                {isDownloading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                )}
                {isDownloading ? "Descargando..." : "Generar EXCEL"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <FiscalizationTable
        columns={[
          {
            id: "rowNumber",
            header: "#",
            cell: ({ row }) => {
              const rowNumber = (searchParams.page - 1) * searchParams.limit + row.index + 1;
              return <span className="font-medium">{rowNumber}</span>;
            },
          },
          {
            id: "entryDate",
            header: "Fecha de ingreso",
            cell: ({ row }) => {
              const date = row.original.certificate?.issueDate;
              if (!date) return "—";
              return format(parseISO(date), "dd/MM/yyyy");
            },
          },
          {
            id: "slaughterDate",
            header: "Fecha de faenamiento",
            cell: ({ row }) => {
              const date = row.original.slaughterDate;
              if (!date) return "—";
              return format(parseISO(date), "dd/MM/yyyy");
            },
          },
          {
            id: "addressee",
            header: "INTRODUCTOR",
            cell: ({ row }) => (
              <div className="flex flex-col">
                <span className="font-medium text-sm">
                  {row.original.brand?.introducer?.user?.person?.fullName ?? "—"}
                </span>
                <span className="text-gray-600 text-xs">
                  {row.original.codes ?? "—"}
                </span>
              </div>
            ),
          },
          {
            id: "validityDate",
            header: "Fecha de vigencia",
            cell: ({ row }) => {
              const date = row.original.certificate?.issueDate;
              if (!date) return "—";
              return format(parseISO(date), "dd/MM/yyyy");
            },
          },
          {
            id: "fiscalizationDate",
            header: "Fecha de fiscalización",
            cell: () => "—",
          },
        ]}
        data={data}
        meta={{
          totalItems: query.data?.data?.meta?.totalItems ?? 0,
          itemCount: query.data?.data?.meta?.itemCount ?? 0,
          itemsPerPage: query.data?.data?.meta?.itemsPerPage ?? searchParams.limit,
          totalPages: query.data?.data?.meta?.totalPages ?? 1,
          currentPage: query.data?.data?.meta?.currentPage ?? searchParams.page,
          onChangePage: (page) => {
            setSearchParams({ page });
          },
          onNextPage: () => {
            setSearchParams({ page: searchParams.page + 1 });
          },
          disabledNextPage:
            searchParams.page >= (query.data?.data?.meta?.totalPages ?? 1),
          onPreviousPage: () => {
            setSearchParams({ page: searchParams.page - 1 });
          },
          disabledPreviousPage: searchParams.page <= 1,
          setSearchParams,
        }}
        isLoading={query.isLoading}
      />
    </div>
  );
}
