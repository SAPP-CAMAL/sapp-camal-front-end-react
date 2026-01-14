"use client";

import { useQuery } from "@tanstack/react-query";
import { PeopleTable } from "./table-people";
import { getPeopleByFilterService } from "../server/db/people.service";
import { NewPerson } from "./new-person.form";
import { parseAsInteger, useQueryStates, parseAsString } from "nuqs";
import { ReportDownloadButtons } from "@/components/report-download-buttons";
import { fetchWithFallback } from "@/lib/ky";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { UpdatePerson } from "./update-person.form";
import { toCapitalize } from "@/lib/toCapitalize";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CreditCardIcon, SearchIcon } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDebouncedCallback } from "use-debounce";
import { useSearchParams } from "next/navigation";

export function PeopleManagement({}) {
  const searchPeopleParams = useSearchParams();

  const [searchParams, setSearchParams] = useQueryStates(
    {
      page: parseAsInteger.withDefault(1),
      limit: parseAsInteger.withDefault(10),
      status: parseAsString.withDefault("todos"),
      identification: parseAsString.withDefault(""),
      fullName: parseAsString.withDefault(""),
      isEmployee: parseAsString.withDefault("*"),
    },
    {
      history: "push",
    }
  );

  const query = useQuery({
    queryKey: ["people", searchParams],
    queryFn: () =>
      getPeopleByFilterService({
        page: searchParams.page,
        limit: searchParams.limit,
        ...(searchParams.status === "activos"
          ? { status: true }
          : searchParams.status === "inactivos"
          ? { status: false }
          : {}),
        identificacion: searchParams.identification,
        ...(searchParams.fullName.length > 2 && {
          fullName: searchParams.fullName,
        }),
        ...(searchParams.isEmployee === "true" && { isEmployee: true }),
      }),
  });

  const debounceFullName = useDebouncedCallback(
    (text: string) => setSearchParams({ fullName: text, page: 1 }),
    500
  );

  const debounceIdentification = useDebouncedCallback(
    (text: string) => setSearchParams({ identification: text, page: 1 }),
    500
  );

  const [isLoadingExcel, setIsLoadingExcel] = useState(false);
  const [isLoadingPdf, setIsLoadingPdf] = useState(false);

  async function handleDownloadReport(type: 'EXCEL' | 'PDF') {
    if (type === 'EXCEL') setIsLoadingExcel(true);
    if (type === 'PDF') setIsLoadingPdf(true);
    try {
      // Construir body con filtros actuales
      const body: any = {
        // page: searchParams.page,
        // limit: searchParams.limit,
      };
      if (searchParams.fullName && searchParams.fullName.length > 0) body.fullName = searchParams.fullName;
      if (searchParams.identification && searchParams.identification.length > 0) body.identificacion = searchParams.identification;
      if (searchParams.status === 'activos') body.status = true;
      if (searchParams.status === 'inactivos') body.status = false;
      if (searchParams.isEmployee === 'true') body.isEmployee = true;
      if (searchParams.isEmployee === 'false') body.isEmployee = false;

      const endpoint = `/v1/1.0.0/person/person-by-filter-report?reportType=${type}`;
      // Obtener token manualmente
      let token = '';
      if (typeof document !== 'undefined') {
        const match = document.cookie.match(/accessToken=([^;]+)/);
        if (match) token = match[1];
      }
      const response = await fetchWithFallback(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(body),
      });
      if (!response.ok) throw new Error('No se pudo descargar el reporte');
      const blob = await response.blob();
      const fileType = type === 'EXCEL' ? 'xlsx' : 'pdf';
      const fileName = `personas_${Date.now()}.${fileType}`;
      const urlBlob = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = urlBlob;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(urlBlob);
      toast.success('Reporte descargado exitosamente');
    } catch (e) {
      toast.error('No se pudo descargar el reporte.');
    } finally {
      if (type === 'EXCEL') setIsLoadingExcel(false);
      if (type === 'PDF') setIsLoadingPdf(false);
    }
  }

  const handleDownloadExcel = () => handleDownloadReport('EXCEL');
  const handleDownloadPdf = () => handleDownloadReport('PDF');

  return (
    <div>
      <section className="mb-4 flex justify-between">
        <div className="py-0 px-2">
          <h2>Lista de Personas</h2>
          {/* <h3>Gestión de Personas</h3> */}
          <p className="text-gray-600 text-sm mt-1">
            Administra la información de todas las personas en el sistema
          </p>
        </div>
        <ReportDownloadButtons
          onDownloadExcel={handleDownloadExcel}
          onDownloadPdf={handleDownloadPdf}
          isLoadingExcel={isLoadingExcel}
          isLoadingPdf={isLoadingPdf}
          spinnerIcon={Loader2}
        />
      </section>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="flex gap-2 items-center">
            Filtros de Búsqueda
          </CardTitle>
          <CardDescription>
            Filtre las personas por nombre, identificación, tipo de personal o
            estado
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            <div className="flex flex-col w-full">
              <label className="mb-1 text-sm font-medium text-gray-700">
                Buscar por nombre
              </label>
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 z-10 h-5 w-5" />
                <Input
                  type="text"
                  placeholder="Buscar por nombre completo"
                  className="pl-10 pr-3 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2"
                  defaultValue={searchPeopleParams.get("fullName") ?? ""}
                  onChange={(e) => debounceFullName(e.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-col w-full">
              <label className="mb-1 text-sm font-medium text-gray-700">
                Buscar por identificación
              </label>
              <div className="relative">
                <CreditCardIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 z-10 h-5 w-5" />
                <Input
                  type="text"
                  placeholder="Ingrese identificación"
                  className="pl-10 pr-3 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2"
                  defaultValue={searchPeopleParams.get("identification") ?? ""}
                  onChange={(e) => debounceIdentification(e.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-col w-full">
              <label className="mb-1 text-sm font-medium text-gray-700">
                Tipo de Personal
              </label>
              <Select
                onValueChange={(value) => {
                  setSearchParams({
                    isEmployee: value,
                    page: 1,
                  });
                }}
                defaultValue={searchPeopleParams.get("isEmployee") ?? "*"}
              >
                <SelectTrigger className="h-10 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <SelectValue placeholder="Seleccione tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="*">Todos</SelectItem>
                  <SelectItem value="true">Personal Camal</SelectItem>
                  <SelectItem value="false">Otros</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col w-full">
              <label className="mb-1 text-sm font-medium text-gray-700">
                Estado
              </label>
              <Select
                onValueChange={(value) =>
                  setSearchParams({ status: value, page: 1 })
                }
                defaultValue={searchPeopleParams.get("status") ?? "todos"}
              >
                <SelectTrigger className="h-10 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <SelectValue placeholder="Seleccione un estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="activos">Activos</SelectItem>
                  <SelectItem value="inactivos">Inactivos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="flex justify-end ml-auto mb-4">
        <NewPerson />
      </div>
      <PeopleTable
        columns={[
          {
            accessorKey: "code",
            header: "Código",
          },
          {
            accessorKey: "fullName",
            header: "Nombre Completo",
            cell: ({ row }) => (
              <div>{toCapitalize(row.original.fullName ?? "", true)}</div>
            ),
          },
          {
            accessorKey: "identificationType.code",
            header: "Tipo ID",
            cell: ({ row }) => (
              <Badge variant={"outline"}>
                {row.original.identificationType?.description}
              </Badge>
            ),
          },
          {
            accessorKey: "identification",
            header: "Identificación",
          },
          {
            accessorKey: "isEmployee",
            header: "Personal Camal",
            cell: ({ row }) => (
              <Badge variant={"outline"}>
                {row.original.isEmployee ? "Si" : "No"}
              </Badge>
            ),
          },
          {
            accessorKey: "status",
            header: "Estado",
            cell: ({ row }) => (
              <Badge variant={row.original.status ? "default" : "inactive"}>
                {row.original.status ? "Activo" : "Inactivo"}
              </Badge>
            ),
          },
          {
            header: "Acciones",
            cell: ({ row }) => {
              return (
                <div>
                  <UpdatePerson person={row.original} />
                </div>
              );
            },
          },
        ]}
        data={query.data?.data.items ?? []}
        meta={{
          ...query.data?.data.meta,
          onChangePage: (page) => {
            setSearchParams({ page });
          },
          onNextPage: () => {
            setSearchParams({ page: searchParams.page + 1 });
          },
          disabledNextPage:
            searchParams.page >= (query.data?.data.meta.totalPages ?? 0),
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
