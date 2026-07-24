"use client";

import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { FileTextIcon, Activity, Settings, Tag } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { parseAsString, useQueryStates } from "nuqs";
import { getReportCodesService } from "./server/db/report-codes.service";
import { NewReportCode } from "./components/new-report-code";
import { UpdateReportCode } from "./components/update-report-code";
import { DeleteReportCode } from "./components/delete-report-code";
import { TableReportCodes } from "./components/table-report-codes";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SearchIcon } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDebouncedCallback } from "use-debounce";
import { REPORT_CODES_TAG } from "./constants/report-codes.constants";

export function ReportCodesManagement() {
  const [searchParams, setSearchParams] = useQueryStates(
    {
      code: parseAsString.withDefault(""),
      status: parseAsString.withDefault("*"),
    },
    {
      history: "push",
    }
  );

  const query = useQuery({
    queryKey: [REPORT_CODES_TAG],
    queryFn: getReportCodesService,
  });

  const debounceCode = useDebouncedCallback(
    (text: string) => setSearchParams({ code: text }),
    500
  );

  const filteredData = useMemo(() => {
    const items = query.data?.data ?? [];

    return items.filter((item) => {
      const matchesCode = searchParams.code
        ? item.code?.toLowerCase().includes(searchParams.code.toLowerCase())
        : true;
      const matchesStatus =
        searchParams.status !== "*"
          ? String(item.status) === searchParams.status
          : true;

      return matchesCode && matchesStatus;
    });
  }, [query.data, searchParams.code, searchParams.status]);

  return (
    <div>
      <section className="mb-4 flex flex-col sm:flex-row sm:justify-between gap-2">
        <div>
          <h1 className="flex items-center gap-x-2 font-semibold text-xl">
            <FileTextIcon />
            Códigos de Reporte
          </h1>
          <p className="text-gray-600 text-sm mt-1">
            Administra el catálogo maestro de códigos de reporte y su
            versión, usado por las plantillas de reporte y las actas de
            limpieza y desinfección.
          </p>
        </div>
        <div className="flex gap-x-2">
          <NewReportCode />
        </div>
      </section>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="flex gap-2 items-center">
            Filtros de Búsqueda
          </CardTitle>
          <CardDescription>
            Filtre los códigos de reporte por código o estado
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex flex-col w-full">
              <label className="mb-1 text-sm font-medium text-gray-700">
                Buscar por código
              </label>
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 z-10 h-5 w-5" />
                <Input
                  type="text"
                  placeholder="Buscar por código..."
                  className="pl-10 pr-3 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2"
                  defaultValue={searchParams.code}
                  onChange={(e) => debounceCode(e.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-col w-full">
              <label className="mb-1 text-sm font-medium text-gray-700">
                Estado
              </label>
              <Select
                onValueChange={(value) => setSearchParams({ status: value })}
                defaultValue={searchParams.status}
              >
                <SelectTrigger className="h-10 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <SelectValue placeholder="Seleccione un estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="*">Todos</SelectItem>
                  <SelectItem value="true">Activos</SelectItem>
                  <SelectItem value="false">Inactivos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <TableReportCodes
        columns={[
          {
            accessorKey: "code",
            header: () => (
              <div className="flex items-center gap-2">
                <FileTextIcon className="h-4 w-4" />
                Código
              </div>
            ),
            cell: ({ row }) => (
              <div className="flex items-center gap-x-2">
                {row.original.code}
              </div>
            ),
          },
          {
            accessorKey: "version",
            header: () => (
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Versión
              </div>
            ),
            cell: ({ row }) => (
              <div className="flex items-center gap-x-2">
                {row.original.version || "—"}
              </div>
            ),
          },
          {
            accessorKey: "status",
            header: () => (
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Estado
              </div>
            ),
            cell: ({ row }) => (
              <Badge>{row.original.status ? "Activo" : "Inactivo"}</Badge>
            ),
          },
          {
            id: "actions",
            header: () => (
              <div className="flex items-center justify-center gap-2">
                <Settings className="h-4 w-4" />
                Acciones
              </div>
            ),
            cell: ({ row }) => (
              <div className="flex justify-center gap-x-2">
                <UpdateReportCode reportCode={row.original} />
                <DeleteReportCode reportCode={row.original} />
              </div>
            ),
          },
        ]}
        data={filteredData}
        isLoading={query.isLoading}
      />
    </div>
  );
}
