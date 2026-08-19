"use client";

import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Building2Icon, FileText, Activity, Settings, IdCardIcon, PhoneIcon, MailIcon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { parseAsInteger, parseAsString, useQueryStates } from "nuqs";
import { getVisitorCompaniesPaginatedService } from "./server/db/visitor-company.service";
import { getCompanyTypesService } from "@/features/company-type/server/db/company-type.service";
import { NewVisitorCompany } from "./components/new-visitor-company";
import { UpdateVisitorCompany } from "./components/update-visitor-company";
import { DeleteVisitorCompany } from "./components/delete-visitor-company";
import { TableVisitorCompany } from "./components/table-visitor-company";
import { toCapitalize } from "@/lib/toCapitalize";
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
import { VISITOR_COMPANY_TAG } from "./constants/visitor-company.constants";

export function VisitorCompanyManagement() {
  const [searchParams, setSearchParams] = useQueryStates(
    {
      page: parseAsInteger.withDefault(1),
      limit: parseAsInteger.withDefault(10),
      name: parseAsString.withDefault(""),
      status: parseAsString.withDefault("*"),
    },
    {
      history: "push",
    }
  );

  const query = useQuery({
    queryKey: [VISITOR_COMPANY_TAG, searchParams],
    queryFn: () =>
      getVisitorCompaniesPaginatedService({
        page: searchParams.page,
        limit: searchParams.limit,
        ...(!!searchParams.name && { name: searchParams.name }),
        ...(searchParams.status !== "*" && {
          status: searchParams.status === "true",
        }),
      }),
  });

  const companyTypesQuery = useQuery({
    queryKey: ["company-type"],
    queryFn: getCompanyTypesService,
  });

  const companyTypeNameById = useMemo(() => {
    const map = new Map<number, string>();
    (companyTypesQuery.data?.data ?? []).forEach((companyType) => {
      map.set(companyType.id, companyType.name);
    });
    return map;
  }, [companyTypesQuery.data]);

  const debounceName = useDebouncedCallback(
    (text: string) => setSearchParams({ name: text, page: 1 }),
    500
  );

  return (
    <div>
      <section className="mb-4 flex flex-col sm:flex-row sm:justify-between gap-2">
        <div>
          <h1 className="flex items-center gap-x-2 font-semibold text-xl">
            <Building2Icon />
            Empresas Visitantes
          </h1>
          <p className="text-gray-600 text-sm mt-1">
            Administra las empresas registradas para el ingreso de visitantes.
          </p>
        </div>
        <div className="flex gap-x-2">
          <NewVisitorCompany />
        </div>
      </section>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="flex gap-2 items-center">
            Filtros de Búsqueda
          </CardTitle>
          <CardDescription>
            Filtre las empresas visitantes por nombre o estado
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex flex-col w-full">
              <label className="mb-1 text-sm font-medium text-gray-700">
                Buscar por nombre
              </label>
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 z-10 h-5 w-5" />
                <Input
                  type="text"
                  placeholder="Buscar por nombre..."
                  className="pl-10 pr-3 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2"
                  defaultValue={searchParams.name}
                  onChange={(e) => debounceName(e.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-col w-full">
              <label className="mb-1 text-sm font-medium text-gray-700">
                Estado
              </label>
              <Select
                onValueChange={(value) => setSearchParams({ status: value, page: 1 })}
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

      <TableVisitorCompany
        columns={[
          {
            accessorKey: "name",
            header: () => (
              <div className="flex items-center gap-2">
                <Building2Icon className="h-4 w-4" />
                Nombre
              </div>
            ),
            cell: ({ row }) => (
              <div className="flex items-center gap-x-2">
                {toCapitalize(row.original.name, true)}
              </div>
            ),
          },
          {
            accessorKey: "ruc",
            header: () => (
              <div className="flex items-center gap-2">
                <IdCardIcon className="h-4 w-4" />
                RUC
              </div>
            ),
            cell: ({ row }) => <span>{row.original.ruc}</span>,
          },
          {
            accessorKey: "idCompanyType",
            header: () => (
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Tipo de Empresa
              </div>
            ),
            cell: ({ row }) => (
              <span>
                {companyTypeNameById.get(row.original.idCompanyType) ?? "-"}
              </span>
            ),
          },
          {
            accessorKey: "phone",
            header: () => (
              <div className="flex items-center gap-2">
                <PhoneIcon className="h-4 w-4" />
                Teléfono
              </div>
            ),
            cell: ({ row }) => <span>{row.original.phone ?? "-"}</span>,
          },
          {
            accessorKey: "email",
            header: () => (
              <div className="flex items-center gap-2">
                <MailIcon className="h-4 w-4" />
                Correo
              </div>
            ),
            cell: ({ row }) => <span>{row.original.email ?? "-"}</span>,
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
                <UpdateVisitorCompany visitorCompany={row.original} />
                <DeleteVisitorCompany visitorCompany={row.original} />
              </div>
            ),
          },
        ]}
        data={query.data?.data.items ?? []}
        meta={{
          ...query.data?.data.meta,
          onChangePage: (page) => setSearchParams({ page }),
          onNextPage: () => setSearchParams({ page: searchParams.page + 1 }),
          disabledNextPage: searchParams.page >= (query.data?.data.meta.totalPages ?? 0),
          onPreviousPage: () => setSearchParams({ page: searchParams.page - 1 }),
          disabledPreviousPage: searchParams.page <= 1,
          setSearchParams,
        }}
        isLoading={query.isLoading}
      />
    </div>
  );
}
