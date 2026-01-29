"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SeizuresTable } from "./table-seizures";
import { parseAsInteger, parseAsString, useQueryStates } from "nuqs";
import {
  CalendarDays,
  PawPrint,
  FileText,
  Hash,
  Calendar,
  Info,
  User,
  Loader2,
  Clock,
  X,
  FileUp,
  ChevronDown,
  FileSpreadsheet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { toCapitalize } from "@/lib/toCapitalize";
import { default as BaseDatePicker } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "@/components/ui/react-datepicker-custom-styles.css";
import {
  AnimalSeizureItem,
} from "../domain";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAllSpecies } from "@/features/specie/hooks/use-all-species";
import { useQuery } from "@tanstack/react-query";
import {
  getAnimalSeizuresService,
  getAnimalConfiscationReportService,
  downloadAnimalSeizuresReport,
} from "../server/seizures.service";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function SeizuresManagement() {
  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  const { data: speciesData } = useAllSpecies();

  const [searchParams, setSearchParams] = useQueryStates(
    {
      page: parseAsInteger.withDefault(1),
      limit: parseAsInteger.withDefault(10),
      startDate: parseAsString.withDefault(format(new Date(), "yyyy-MM-dd")),
      endDate: parseAsString.withDefault(format(new Date(), "yyyy-MM-dd")),
      specieId: parseAsInteger.withDefault(0),
    },
    {
      history: "push",
    }
  );

  const animalSeizuresQuery = useQuery({
    queryKey: [
      "animal-seizures",
      searchParams.page,
      searchParams.limit,
      searchParams.startDate,
      searchParams.endDate,
      searchParams.specieId,
    ],
    queryFn: () =>
      getAnimalSeizuresService({
        page: searchParams.page,
        limit: searchParams.limit,
        idSpecie: searchParams.specieId,
        ...(searchParams.startDate && { startDate: searchParams.startDate }),
        ...(searchParams.endDate && { endDate: searchParams.endDate }),
      }),
    enabled: searchParams.specieId > 0,
  });

  const isLoading = animalSeizuresQuery.isLoading;
  const seizuresData: AnimalSeizureItem[] = animalSeizuresQuery.data?.data?.items ?? [];
  const meta = animalSeizuresQuery.data?.data?.meta;

  const handleDownloadTicket = async (id: number) => {
    setDownloadingId(id);
    try {
      const { blob, filename } = await getAnimalConfiscationReportService(id);

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("Ticket descargado correctamente");
    } catch {
      toast.error("Error al descargar el ticket");
    } finally {
      setDownloadingId(null);
    }
  };

  const handleDownloadReport = async (type: 'EXCEL' | 'PDF') => {
    toast.promise(
      downloadAnimalSeizuresReport({
        page: searchParams.page,
        limit: searchParams.limit,
        startDate: searchParams.startDate,
        endDate: searchParams.endDate,
        idSpecie: searchParams.specieId,
        typeReport: type,
      }),
      {
        loading: 'Generando reporte...',
        success: `Reporte ${type} descargado correctamente`,
        error: 'Error al descargar el reporte',
      }
    );
  };

  return (
    <div>
      <section className="mb-4">
        <div className="py-0 px-2">
          <h2>Decomisos Realizados</h2>
          <p className="text-gray-600 text-sm mt-1">
            Gestión unificada de decomisos por animal
          </p>
        </div>
      </section>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="flex gap-2 items-center">
            Filtros de Búsqueda
          </CardTitle>
          <CardDescription>
            Filtre los decomisos por rango de fechas y especie
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div className="flex flex-col w-full">
              <label className="mb-1 text-sm font-medium text-gray-700">
                Fecha Inicio
              </label>
              <BaseDatePicker
                selected={
                  searchParams.startDate ? parseISO(searchParams.startDate) : null
                }
                onChange={(date: Date | null) => {
                  if (date) {
                    setSearchParams({
                      startDate: format(date, "yyyy-MM-dd"),
                      page: 1,
                    });
                  } else {
                    setSearchParams({ startDate: "", page: 1 });
                  }
                }}
                dateFormat="dd/MM/yyyy"
                locale={es}
                showIcon
                isClearable
                icon={
                  <CalendarDays className="text-muted-foreground h-4 w-4" />
                }
                placeholderText="Desde"
                wrapperClassName="w-full"
                className="flex w-full min-w-0 rounded-md border border-gray-300 bg-background px-3 py-1 text-sm shadow-xs transition-[color,box-shadow] outline-none h-10 focus:ring-2"
                popperClassName="z-50"
                popperPlacement="bottom-start"
              />
            </div>

            <div className="flex flex-col w-full">
              <label className="mb-1 text-sm font-medium text-gray-700">
                Fecha Fin
              </label>
              <BaseDatePicker
                selected={
                  searchParams.endDate ? parseISO(searchParams.endDate) : null
                }
                onChange={(date: Date | null) => {
                  if (date) {
                    setSearchParams({
                      endDate: format(date, "yyyy-MM-dd"),
                      page: 1,
                    });
                  } else {
                    setSearchParams({ endDate: "", page: 1 });
                  }
                }}
                dateFormat="dd/MM/yyyy"
                locale={es}
                showIcon
                isClearable
                icon={
                  <CalendarDays className="text-muted-foreground h-4 w-4" />
                }
                placeholderText="Hasta"
                wrapperClassName="w-full"
                className="flex w-full min-w-0 rounded-md border border-gray-300 bg-background px-3 py-1 text-sm shadow-xs transition-[color,box-shadow] outline-none h-10 focus:ring-2"
                popperClassName="z-50"
                popperPlacement="bottom-start"
              />
            </div>

            <div className="flex flex-col w-full">
              <label className="mb-1 text-sm font-medium text-gray-700">
                Especie
              </label>
              <Select
                value={
                  searchParams.specieId > 0
                    ? searchParams.specieId.toString()
                    : ""
                }
                onValueChange={(value) => {
                  if (value) {
                    setSearchParams({
                      specieId: parseInt(value),
                      page: 1,
                    });
                  }
                }}
              >
                <SelectTrigger className="h-10 text-sm bg-background border-gray-300 focus:ring-2">
                  <SelectValue placeholder="Seleccione especie" />
                </SelectTrigger>
                <SelectContent>
                  {speciesData?.data?.map((specie) => (
                    <SelectItem key={specie.id} value={specie.id.toString()}>
                      {specie?.description || specie.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {seizuresData.length > 0 && (
        <div className="flex justify-end mb-4">
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button
                title="Generar reporte de los registros actuales"
              >
                <FileUp className="h-4 w-4" />
                <span className="ml-2">Reporte</span>
                <ChevronDown className="h-3 w-3 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-56"
              sideOffset={5}
              alignOffset={0}
            >
              <DropdownMenuItem
                onClick={() => handleDownloadReport('EXCEL')}
                className="cursor-pointer"
              >
                <FileSpreadsheet className="h-4 w-4 mr-2 text-green-600" />
                <span>Descargar Excel</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleDownloadReport('PDF')}
                className="cursor-pointer"
              >
                <FileText className="h-4 w-4 mr-2 text-red-600" />
                <span>Descargar PDF</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      <SeizuresTable
        title="Lista de Decomisos por Animal"
        columns={[
          {
            id: "rowNumber",
            header: () => (
              <div className="flex items-center gap-1">
                <Hash className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Nro</span>
                <span className="sm:hidden">#</span>
              </div>
            ),
            cell: ({ row }) => {
              const rowNumber =
                (searchParams.page - 1) * searchParams.limit + row.index + 1;
              return <span className="font-semibold text-primary">{rowNumber}</span>;
            },
          },
          {
            id: "seizureDate",
            header: () => (
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                <span>Fecha</span>
              </div>
            ),
            cell: ({ row }) => {
              const postmortem = row.original.postmortem?.[0];
              const date = postmortem?.createdAt;
              if (!date) return "—";
              return format(parseISO(date), "dd/MM/yyyy");
            },
          },
          {
            id: "seizureTime",
            header: () => (
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                <span>Hora</span>
              </div>
            ),
            cell: ({ row }) => {
              const postmortem = row.original.postmortem?.[0];
              const date = postmortem?.createdAt;
              if (!date) return "—";
              return format(parseISO(date), "HH:mm");
            },
          },
          {
            id: "details",
            header: () => (
              <div className="flex items-center gap-1">
                <Info className="h-3 w-3 sm:h-4 sm:w-4" />
                Animal / Marca
              </div>
            ),
            cell: ({ row }) => {
              const brand = row.original.detailCertificateBrands?.detailsCertificateBrand?.brand;
              const stage = row.original.detailCertificateBrands?.productiveStage;
              return (
                <div className="flex flex-col">
                  <span className="font-bold text-sm">Cód: {row.original.code}</span>
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-medium uppercase">
                    <span>{stage?.name}</span>
                    <span>|</span>
                    <span className="text-primary font-bold">Marca: {brand?.name}</span>
                  </div>
                </div>
              );
            },
          },
          {
            id: "observations",
            header: () => (
              <div className="flex items-center gap-1">
                <FileText className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                Observaciones (Partes / Pesos)
              </div>
            ),
            cell: ({ row }) => {
              const products = row.original.postmortem.flatMap(pm => pm.productPostmortem);
              const subproducts = row.original.postmortem.flatMap(pm => pm.subProductPostmortem);

              if (products.length === 0 && subproducts.length === 0) return "—";

              return (
                <div className="flex flex-wrap gap-1 max-w-[400px]">
                  {products.map((p, idx) => (
                    <span key={`p-${idx}`} className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
                      {p.bodyPart?.description} ({p.weight}kg)
                    </span>
                  ))}
                  {subproducts.map((s, idx) => (
                    <span key={`s-${idx}`} className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-50 text-blue-700 border border-blue-200">
                      {s.speciesDisease?.productDisease?.product?.description || "Subproducto"} ({s.weight}kg)
                    </span>
                  ))}
                </div>
              );
            },
          },
          {
            id: "introducer",
            header: () => (
              <div className="flex items-center gap-1">
                <User className="h-3 w-3 sm:h-4 sm:w-4" />
                Introductor
              </div>
            ),
            cell: ({ row }) => {
              const brand = row.original.detailCertificateBrands?.detailsCertificateBrand?.brand;
              const fullName = brand?.introducer?.user?.person?.fullName;
              return (
                <div className="flex flex-col max-w-[150px]">
                  <span className="font-semibold text-xs truncate">
                    {fullName ? toCapitalize(fullName, true) : "—"}
                  </span>
                </div>
              );
            },
          },
          {
            id: "actions",
            header: () => (
              <div className="flex items-center justify-center gap-1">
                <FileText className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                <span className="hidden sm:inline">Ticket</span>
              </div>
            ),
            cell: ({ row }) => {
              return (
                <div className="flex justify-center">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="hover:bg-primary hover:text-white transition-colors h-7 w-7 p-0 rounded-full border-primary/20"
                        onClick={() => handleDownloadTicket(row.original.id)}
                        disabled={downloadingId === row.original.id}
                      >
                        {downloadingId === row.original.id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <FileText className="h-3 w-3" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Descargar Reporte de Decomiso</TooltipContent>
                  </Tooltip>
                </div>
              );
            },
          },
        ]}
        data={seizuresData}
        meta={{
          totalItems: meta?.totalItems ?? 0,
          itemCount: meta?.itemCount ?? 0,
          itemsPerPage: meta?.itemsPerPage ?? searchParams.limit,
          totalPages: meta?.totalPages ?? 1,
          currentPage: meta?.currentPage ?? searchParams.page,
          onChangePage: (page) => {
            setSearchParams({ page });
          },
          onNextPage: () => {
            setSearchParams({ page: searchParams.page + 1 });
          },
          disabledNextPage: searchParams.page >= (meta?.totalPages ?? 1),
          onPreviousPage: () => {
            setSearchParams({ page: searchParams.page - 1 });
          },
          disabledPreviousPage: searchParams.page <= 1,
          setSearchParams,
        }}
        isLoading={isLoading}
      />
    </div>
  );
}
