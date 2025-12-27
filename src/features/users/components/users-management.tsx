"use client";

import { useQuery } from "@tanstack/react-query";
import { UsersTable } from "./users-table";
import { NewUser } from "./new-user.form";
import { parseAsInteger, useQueryStates, parseAsString } from "nuqs";
import { ReportDownloadButtons } from "@/components/report-download-buttons";
import { fetchWithFallback } from "@/lib/ky";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { getUsersByFilter } from "../server/db/queries.users";
import { toCapitalize } from "../../../lib/toCapitalize";
import { UpdateUserForm } from "./update-user.form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SearchIcon, PlusIcon, UserIcon, CreditCardIcon, FilterIcon, MailIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDebouncedCallback } from "use-debounce";
import { useSearchParams as useNextSearchParams } from "next/navigation";

export function UsersManagement() {
  const searchUsersParams = useNextSearchParams();

  const [searchParams, setSearchParams] = useQueryStates(
    {
      page: parseAsInteger.withDefault(1),
      limit: parseAsInteger.withDefault(10),
      fullName: parseAsString.withDefault(""),
      email: parseAsString.withDefault(""),
      userName: parseAsString.withDefault(""),
      identification: parseAsString.withDefault(""),
    },
    {
      history: "push",
    }
  );

  const query = useQuery({
    queryKey: ["users", searchParams],
    queryFn: () => getUsersByFilter(searchParams),
  });

  const debounceFullName = useDebouncedCallback(
    (text: string) => setSearchParams({ fullName: text, page: 1 }),
    500
  );

  const debounceEmail = useDebouncedCallback(
    (text: string) => setSearchParams({ email: text, page: 1 }),
    500
  );

  const debounceUserName = useDebouncedCallback(
    (text: string) => setSearchParams({ userName: text, page: 1 }),
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
        page: searchParams.page,
        limit: searchParams.limit,
      };
      if (searchParams.fullName && searchParams.fullName.length > 0) body.fullName = searchParams.fullName;
      if (searchParams.email && searchParams.email.length > 0) body.email = searchParams.email;
      if (searchParams.userName && searchParams.userName.length > 0) body.userName = searchParams.userName;
      if (searchParams.identification && searchParams.identification.length > 0) body.identification = searchParams.identification;

      const endpoint = `/v1/1.0.0/users/by-filter-report?reportType=${type}`;
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
      const fileName = `usuarios_${Date.now()}.${fileType}`;
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
        <div className='py-0 px-2'>
				<h2>Lista de Usuarios</h2>
         <div>
          {/* <h1 className="font-semibold text-xl px-2">Gestión de Usuarios</h1> */}
          <p className="text-gray-600 text-sm px-2 mb-2">
            Administra la información de todos los usuarios registrados en la
            aplicación.
          </p>
        </div>
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
            Filtre los usuarios por nombre, correo electrónico, nombre de usuario o identificación
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            <div className="flex flex-col w-full">
              <label className="mb-1 text-sm font-medium text-gray-700">
                Buscar por nombre
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 z-10 h-5 w-5" />
                <Input
                  type="text"
                  placeholder="Buscar por nombre completo"
                  className="pl-10 pr-3 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2"
                  defaultValue={searchUsersParams.get("fullName") ?? ""}
                  onChange={(e) => debounceFullName(e.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-col w-full">
              <label className="mb-1 text-sm font-medium text-gray-700">
                Buscar por correo
              </label>
              <div className="relative">
                <MailIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 z-10 h-5 w-5" />
                <Input
                  type="text"
                  placeholder="Buscar por correo electrónico"
                  className="pl-10 pr-3 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2"
                  defaultValue={searchUsersParams.get("email") ?? ""}
                  onChange={(e) => debounceEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-col w-full">
              <label className="mb-1 text-sm font-medium text-gray-700">
                Buscar por usuario
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 z-10 h-5 w-5" />
                <Input
                  type="text"
                  placeholder="Buscar por nombre de usuario"
                  className="pl-10 pr-3 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2"
                  defaultValue={searchUsersParams.get("userName") ?? ""}
                  onChange={(e) => debounceUserName(e.target.value)}
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
                  defaultValue={searchUsersParams.get("identification") ?? ""}
                  onChange={(e) => debounceIdentification(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <section className="mb-4 flex justify-between">

<div className="flex gap-2 justify-end ml-auto">
          <NewUser />
        </div>
      </section>
      <UsersTable
        columns={[
          {
            accessorKey: "userName",
            header: "Nombre de Usuario",
          },
          {
            accessorKey: "email",
            header: "Correo Electrónico",
          },
          {
            accessorKey: "person.identification",
            header: "Identificación",
          },
          {
            accessorKey: "person.fullName",
            header: "Nombre Completo",
            cell: ({ row }) => {
              return (
                <span>
                  {toCapitalize(row.original.person.fullName ?? "", true)}
                </span>
              );
            },
          },
          {
            header: "Acciones",
            cell: ({ row }) => {
              return (
                <div>
                  <UpdateUserForm userId={row.original.id} />
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
