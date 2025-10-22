"use client";

import { useQuery } from "@tanstack/react-query";
import { parseAsInteger, useQueryStates, parseAsString } from "nuqs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CheckIcon, ChevronsUpDownIcon, SearchIcon } from "lucide-react";
import { useDebouncedCallback } from "use-debounce";
import { useSearchParams } from "next/navigation";
import { TableVisitorLog } from "./components/table-visitor-log";
import {
  getAllVisitorCompanies,
  getVisitorLogByFilterService,
} from "./server/db/visitor-log.service";
import { NewVisitorLogForm } from "./components/new-visitor-log.form";
import { format } from "date-fns";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function VisitorLogManagement() {
  const visitorLogParams = useSearchParams();
  const [searchParams, setSearchParams] = useQueryStates(
    {
      page: parseAsInteger.withDefault(1),
      limit: parseAsInteger.withDefault(10),
      registerDate: parseAsString.withDefault(format(new Date(), "yyyy-MM-dd")),
      identification: parseAsString.withDefault(""),
      fullName: parseAsString.withDefault(""),
      idCompany: parseAsString.withDefault(""),
    },
    {
      history: "push",
    }
  );

  const query = useQuery({
    queryKey: ["people", searchParams],
    queryFn: () =>
      getVisitorLogByFilterService({
        page: searchParams.page,
        limit: searchParams.limit,
        registerDate: searchParams.registerDate,
        ...(searchParams.identification.length > 0 && {
          identification: searchParams.identification,
        }),
        ...(searchParams.fullName.length > 0 && {
          fullName: searchParams.fullName,
        }),
        ...(!!searchParams.idCompany && {
          idCompany: Number(searchParams.idCompany),
        }),
      }),
  });

  const debounceIdentification = useDebouncedCallback(
    (text: string) => setSearchParams({ identification: text, page: 1 }),
    500
  );
  const debounceFullname = useDebouncedCallback(
    (text: string) => setSearchParams({ fullName: text, page: 1 }),
    500
  );

  return (
    <div>
      <section className="mb-4 flex justify-between">
        <div className="py-0 px-2">
          <h2>Registro de Visitas</h2>
          <p className="text-gray-600 text-sm mt-1">
            Administra la información de todas las visitas en el sistema
          </p>
        </div>
      </section>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="flex gap-2 items-center">
            Filtros de Búsqueda
          </CardTitle>
          <CardDescription>
            Filtre las visitas por fecha de registro, identificación, nombre
            completo, empresa
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            <div className="flex flex-col w-full">
              <label className="mb-1 text-sm font-medium text-gray-700">
                Buscar por fecha de registro
              </label>
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 z-10 h-5 w-5" />
                <Input
                  type="date"
                  placeholder="Buscar por fecha de registro"
                  className="pl-10 pr-3 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2"
                  value={searchParams.registerDate}
                  onChange={(e) =>
                    setSearchParams({ registerDate: e.target.value, page: 1 })
                  }
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
                  placeholder="Ingrese identificación"
                  className="pl-10 pr-3 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2"
                  defaultValue={visitorLogParams.get("identification") ?? ""}
                  onChange={(e) => debounceIdentification(e.target.value)}
                />
              </div>
            </div>
            <div className="flex flex-col w-full">
              <label className="mb-1 text-sm font-medium text-gray-700">
                Buscar por Nombre completo
              </label>
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 z-10 h-5 w-5" />
                <Input
                  type="text"
                  placeholder="Ingrese nombre completo"
                  className="pl-10 pr-3 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2"
                  defaultValue={visitorLogParams.get("fullname") ?? ""}
                  onChange={(e) => debounceFullname(e.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-col w-full">
              <label className="mb-1 text-sm font-medium text-gray-700">
                Empresa
              </label>
              <SelectCompany
                onChangeValue={(idCompany) => {
                  setSearchParams({
                    idCompany: idCompany ? idCompany?.toString() : "",
                    page: 1,
                  });
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="flex justify-end ml-auto mb-4">
        <NewVisitorLogForm />
      </div>
      <TableVisitorLog
        columns={[
          {
            accessorKey: "visitPurpose",
            header: "Motivo de Visita",
          },
          {
            accessorKey: "entryTime",
            header: "Fecha de Entrada",
          },
          {
            accessorKey: "exitTime",
            header: "Fecha de Salida",
          },
          {
            accessorKey: "observation",
            header: "Observaciones",
          },
          {
            accessorKey: "person.identification",
            header: "Identificación",
          },
          {
            accessorKey: "person.fullName",
            header: "Nombre Completo",
          },
          {
            accessorKey: "company.name",
            header: "Empresa",
          },
          {
            accessorKey: "company.companyType.name",
            header: "Tipo de Empresa",
          },
          {
            header: "Acciones",
            cell: ({ row }) => {
              return <div>{/* <UpdatePerson person={row.original} /> */}</div>;
            },
          },
        ]}
        data={query.data?.data?.items ?? []}
        meta={{
          ...query.data?.data?.meta,
          onChangePage: (page) => {
            setSearchParams({ page });
          },
          onNextPage: () => {
            setSearchParams({ page: searchParams.page + 1 });
          },
          disabledNextPage:
            searchParams.page >= (query.data?.data?.meta.totalPages ?? 0),
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

export function SelectCompany({
  onChangeValue,
}: {
  onChangeValue: (idCompany?: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");

  const query = useQuery({
    queryKey: ["visitor-company"],
    queryFn: () => getAllVisitorCompanies(),
  });

  const options = query.data?.data.map((company) => ({
    value: `${company.ruc}-${company.name}`,
    label: `${company.ruc}-${company.name}`,
  }));

  useEffect(() => {
    if (!!value) {
      const company = query.data?.data.find(
        (company) => company.ruc === value.split("-")[0]
      );

      onChangeValue(company?.id);
    } else {
      onChangeValue(undefined);
    }
  }, [value]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {value
            ? options?.find((option) => option.value === value)?.label
            : "Selecciona una empresa..."}
          <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[240px] p-0">
        <Command>
          <CommandInput placeholder="Buscar por empresa..." />
          <CommandList>
            <CommandEmpty>Empresa no encontrada.</CommandEmpty>
            <CommandGroup>
              {options?.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={(currentValue) => {
                    setValue(currentValue === value ? "" : currentValue);
                    setOpen(false);
                  }}
                >
                  <CheckIcon
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === option.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
