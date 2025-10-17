"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AddresseesTable } from "./table-addressees";
import { Badge } from "@/components/ui/badge";
import { parseAsInteger, parseAsString, useQueryStates } from "nuqs";
import { EditIcon, MapPin, PlusIcon, SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";
import { Button } from "@/components/ui/button";
import { capitalizeText } from "@/lib/utils";
import { getAdresseesByFilterService } from "../server/addressees.service";
import { useProvinces } from "@/features/provinces/hooks/use-provinces";
import { format } from "date-fns";
import NewAddresseesForm from "./new-addressees.form";
import { toCapitalize } from "@/lib/toCapitalize";

export function AddresseesManagement({}) {
  const searchAddresseesParams = useSearchParams();
  const { data: provinces } = useProvinces();

  const [searchParams, setSearchParams] = useQueryStates(
    {
      page: parseAsInteger.withDefault(1),
      limit: parseAsInteger.withDefault(10),
      fullName: parseAsString.withDefault(""),
      identification: parseAsString.withDefault(""),
      providenceId: parseAsInteger.withDefault(0),
    },
    {
      history: "push",
    }
  );
  const query = useQuery({
    queryKey: ["addressees", searchParams],
    queryFn: () =>
      getAdresseesByFilterService({
        page: searchParams.page,
        limit: searchParams.limit,
        ...(searchParams.identification.length > 2 && {
          identification: searchParams.identification,
        }),
        ...(searchParams.fullName.length > 2 && {
          fullName: searchParams.fullName,
        }),
        ...(searchParams.providenceId != null && {
          provinceId: searchParams.providenceId,
        }),
      }),
  });

  const debounceFullName = useDebouncedCallback((text: string) => {
    setSearchParams({ fullName: text, page: 1 });
  }, 500);

  const debounceIdentification = useDebouncedCallback(
    (text: string) => setSearchParams({ identification: text, page: 1 }),
    500
  );

  return (
    <div>
      <section className="mb-4 flex justify-between">
        <div>
          <h2 className="font-semibold text-xl">Destinatarios</h2>
          <p className="text-gray-600 text-sm mt-1">
            Gestión de destinatarios registrados en el sistema
          </p>
        </div>
      </section>
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="flex gap-2 items-center">
            Filtros de Búsqueda
          </CardTitle>
          <CardDescription>
            Filtre los destinatarios por nombre, número de identificación o
            provincia
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
            <div className="flex flex-col w-full">
              <label className="mb-1 text-sm font-medium text-gray-700">
                Buscar por nombre
              </label>
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 z-10 h-5 w-5" />
                <Input
                  type="text"
                  placeholder="Ingrese el nombre"
                  className="pl-10 pr-3 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2"
                  defaultValue={searchAddresseesParams.get("fullName") ?? ""}
                  onChange={(e) => debounceFullName(e.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-col w-full">
              <label className="mb-1 text-sm font-medium text-gray-700">
                Buscar por identificación
              </label>
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 z-10 h-5 w-5" />
                <Input
                  type="text"
                  placeholder="Ingrese la identificación"
                  className="pl-10 pr-3 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2"
                  defaultValue={
                    searchAddresseesParams.get("identification") ?? ""
                  }
                  onChange={(e) => debounceIdentification(e.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-col w-full">
              <label className="mb-1 text-sm font-medium text-gray-700">
                Provincia
              </label>
              <Select
                onValueChange={(value) => {
                  setSearchParams({ providenceId: Number(value), page: 1 });
                }}
                defaultValue="*"
              >
                <SelectTrigger className="h-10 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <SelectValue placeholder="Seleccione la provincia" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="*">Todas las provincias</SelectItem>
                  {provinces?.data?.map((province, index) => (
                    <SelectItem key={index} value={String(province.id)}>
                      {capitalizeText(province.name)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="flex justify-end ml-auto mb-3">
        <NewAddresseesForm
          provinces={provinces?.data ?? []}
          onSuccess={() => query.refetch()}
          trigger={
            <Button>
              <PlusIcon className="h-4 w-4" />
              Nuevo Destinatario
            </Button>
          }
        />
      </div>
      <AddresseesTable
        columns={[
          {
            accessorKey: "fullName",
            header: "Destinatario",
            cell: ({ row }) => {
              return (
                <div className="flex flex-col">
                  <span className="font-medium text-sm">
                    {toCapitalize(row.original.fullName ?? "", true) ?? "—"}
                  </span>
                  <span className="text-gray-600 text-xs">
                    {row.original.email ?? "—"}{" "}
                  </span>
                </div>
              );
            },
          },
          {
            accessorKey: "identification",
            header: "Identificación",
          },
          {
            header: "Dirección",
            cell: ({ row }) => {
              const address = row.original.addresses?.[0];
              if (!address) return "—";

              return (
                <div className="flex flex-col">
                  <span className="font-medium text-sm">
                    {toCapitalize(address.canton ?? "", true) ?? "—"} -{" "}
                    {toCapitalize(address.province ?? "", true) ?? "—"}
                  </span>
                  <span className="text-gray-600 text-xs">
                    {toCapitalize(address.parish ?? "", true) ?? "—"} -{" "}
                    {toCapitalize(address.firstStree ?? "", true) ?? "—"}
                  </span>
                </div>
              );
            },
          },
          {
            header: "Provincia",
            cell: ({ row }) => (
              <Badge variant="outline" className="flex items-center gap-1">
                <MapPin className="text-purple-500" />
                <span className="text-purple-600 font-medium">
                  {row.original.addresses?.[0]?.province ?? "—"}
                </span>
              </Badge>
            ),
          },
          {
            accessorKey: "status",
            header: "Estado",
            cell: ({ row }) => (
              <Badge>{row.original.status ? "Activo" : "Inactivo"}</Badge>
            ),
          },
          {
            accessorKey: "createdAt",
            header: "Fecha Registro",
            cell: ({ row }) => {
              const date = row.original.createdAt;
              if (!date) return "—";

              return format(new Date(date), "yyyy-MM-dd");
            },
          },
          {
            header: "Acciones",
            cell: ({ row }) => {
              return (
                <div className="flex items-center space-x-2">
                  <NewAddresseesForm
                    provinces={provinces?.data ?? []}
                    onSuccess={() => query.refetch()}
                    isUpdate={true}
                    trigger={
                      <Button variant={"outline"}>
                        <EditIcon className="h-4 w-4" />
                        Editar
                      </Button>
                    }
                    addresseeData={row.original}
                  />
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
