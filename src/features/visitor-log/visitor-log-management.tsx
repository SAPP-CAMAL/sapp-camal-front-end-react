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
import {
  Calendar,
  CheckIcon,
  ChevronsUpDownIcon,
  CreditCardIcon,
  Download,
  FileSpreadsheet,
  FileText,
  IdCardIcon,
  Loader2,
  SearchIcon,
} from "lucide-react";
import { useDebouncedCallback } from "use-debounce";
import { useSearchParams } from "next/navigation";
import { TableVisitorLog } from "./components/table-visitor-log";
import {
  getAllVisitorCompanies,
  getVisitorLogByFilterService,
  downloadVisitorLogReport,
} from "./server/db/visitor-log.service";
import { NewVisitorLogForm } from "./components/new-visitor-log.form";
import { format, parseISO } from "date-fns";
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
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { RegisterExitTime } from "./components/register-exit-time";
import { UpdateVisitorLogDialog } from "./components/update-visitor-log.form";
import { DatePicker } from "@/components/ui/date-picker";
import { toCapitalize } from "@/lib/toCapitalize";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";


export function VisitorLogManagement() {
  const visitorLogParams = useSearchParams();
  const [isDownloading, setIsDownloading] = useState<"EXCEL" | "PDF" | null>(null);
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
    queryKey: ["visitor-log", searchParams],
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

  const handleDownloadReport = async (typeReport: "EXCEL" | "PDF") => {
    setIsDownloading(typeReport);
    try {
      const body = {
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
      };

      const { blob, filename } = await downloadVisitorLogReport(typeReport, body);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success(`Reporte ${typeReport} descargado correctamente`);
    } catch {
      toast.error("Error al descargar el reporte");
    } finally {
      setIsDownloading(null);
    }
  };

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
            <div className="flex flex-col min-w-0">
              <span className="mb-1 text-sm font-medium text-gray-700">
                Fecha de Ingreso
              </span>
              {/* <div className="relative">
                <Calendar
                  className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10 cursor-pointer"
                  onClick={() => {
                    const input = document.getElementById(
                      "fecha-ingreso"
                    ) as HTMLInputElement;
                    if (input) input.showPicker();
                  }}
                />
                <Input
                  id="fecha-ingreso"
                  type="date"
                  className="w-full bg-muted transition-colors focus:bg-background pl-8 [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-2 [&::-webkit-calendar-picker-indicator]:cursor-pointer h-10"
                  value={searchParams.registerDate}
                  onChange={(e) => {
                    setSearchParams({
                      registerDate: e.target.value,
                      page: 1,
                    });
                  }}
                  title="Selecciona la fecha de ingreso de los animales"
                />
              </div> */}

              <DatePicker
                inputClassName='bg-secondary h-10 flex items-center'
                iconClassName='mt-1'
                selected={parseISO(searchParams.registerDate)}
                onChange={date => {
                  if (!date) return;
                  const registerDate = format(date, 'yyyy-MM-dd');
                  setSearchParams({ registerDate });
                }}
              />
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
                  className="pl-10 pr-3 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 h-10"
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
                  className="pl-10 pr-3 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 h-10"
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
                value={searchParams.idCompany}
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
      <div className="flex flex-col sm:flex-row justify-end ml-auto mb-4 gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" disabled={isDownloading !== null}>
              {isDownloading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              Descargar Reporte
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => handleDownloadReport("EXCEL")}
              disabled={isDownloading !== null}
            >
              <FileSpreadsheet className="h-4 w-4 mr-2 text-green-600" />
              Descargar Excel
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleDownloadReport("PDF")}
              disabled={isDownloading !== null}
            >
              <FileText className="h-4 w-4 mr-2 text-red-600" />
              Descargar PDF
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <NewVisitorLogForm />
      </div>
      <TableVisitorLog
        columns={[
          {
            header: "Fecha de Entrada",
            cell: ({ row }) => {
              const date = new Date(row.original.entryTime);

              const parts = new Intl.DateTimeFormat("es-EC", {
                // timeZone: "America/Guayaquil",
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              }).formatToParts(date);

              const get = (type: string) =>
                parts.find((p) => p.type === type)?.value;

              const formatted = `${get("year")}-${get("month")}-${get(
                "day"
              )} ${get("hour")}:${get("minute")} ${get(
                "dayPeriod"
              )?.toLowerCase()}`;
              return formatted;
            },
          },
          {
            header: "Fecha de Salida",
            cell: ({ row }) => {
              if (row.original.exitTime) {
                const date = new Date(row.original.exitTime);

                const parts = new Intl.DateTimeFormat("es-EC", {
                  // timeZone: "America/Guayaquil",
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                }).formatToParts(date);

                const get = (type: string) =>
                  parts.find((p) => p.type === type)?.value;

                const formatted = `${get("year")}-${get("month")}-${get(
                  "day"
                )} ${get("hour")}:${get("minute")} ${get(
                  "dayPeriod"
                )?.toLowerCase()}`;
                return formatted;
              }

              return <RegisterExitTime id={row.original.id} />;
            },
          },
          {
            accessorKey: "person.identification",
            header: "Identificación",
          },
          {
            accessorKey: "person.fullName",
            header: "Nombre Completo",
            cell: ({ row }) => toCapitalize(row.original?.person?.fullName ?? "", true)
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
            accessorKey: "visitPurpose",
            header: "Motivo de Visita",
          },
          {
            accessorKey: "observation",
            header: "Observaciones",
          },
          {
            header: "Acciones",
            cell: ({ row }) => {
              console.log(row.original);
              return (
                <div>
                  <UpdateVisitorLogDialog visitor={row.original} />
                </div>
              );
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
  value,
  onChangeValue,
}: {
  value?: string;
  onChangeValue: (idCompany?: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const query = useQuery({
    queryKey: ["visitor-company"],
    queryFn: () => getAllVisitorCompanies(),
  });

  const options = query.data?.data.map((company) => ({
    id: company.id.toString(),
    label: `${company.name}`,
    ruc: company.ruc,
    name: company.name,
  }));

  const selectedOption = options?.find((o) => o.id === value);

  const filteredOptions = options?.filter((o) =>
    o.label.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="justify-between pl-10 pr-3 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 h-10"
        >
          {selectedOption ? selectedOption.label : "Selecciona una empresa..."}
          <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[240px] p-0">
        <Command>
          <CommandInput
            placeholder="Buscar por empresa..."
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            <CommandEmpty>Empresa no encontrada.</CommandEmpty>
            <CommandGroup>
              {filteredOptions?.map((option) => (
                <CommandItem
                  key={option.id}
                  value={option.label}
                  onSelect={() => {
                    if (value === option.id) {
                      // Si ya está seleccionado, limpiar
                      onChangeValue(undefined);
                    } else {
                      onChangeValue(option.id); // Selección normal
                    }
                    setOpen(false);
                    setSearch(""); // Limpiar búsqueda
                  }}
                >
                  <CheckIcon
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === option.id ? "opacity-100" : "opacity-0"
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
