"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
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
      searchParams.specieId,
    ],
    queryFn: () =>
      getAnimalSeizuresService({
        page: searchParams.page,
        limit: searchParams.limit,
        idSpecie: searchParams.specieId,
        ...(searchParams.startDate && { startDate: searchParams.startDate }),
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

  return (
    <div className="px-2 sm:px-0">
      <section className="mb-4">
        <h2 className="font-semibold text-lg sm:text-xl text-primary">Decomisos Realizados</h2>
        <p className="text-gray-600 text-xs sm:text-sm mt-1">
          Gestión unificada de decomisos por animal
        </p>
      </section>

      <Card className="mb-4 border-none shadow-sm bg-muted/30">
        <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-2">
          <CardTitle className="flex gap-2 items-center text-sm font-bold uppercase tracking-wider text-muted-foreground">
            Filtros de Búsqueda
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-3 sm:gap-4 w-full items-end">
            <div className="flex flex-col w-full">
              <label className="mb-1 text-xs font-semibold text-gray-500 uppercase tracking-tight flex items-center gap-1">
                <CalendarDays className="h-3 w-3 text-primary" />
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
                className="border-input flex w-full min-w-0 rounded-md border bg-background px-3 py-1 text-sm shadow-xs transition-[color,box-shadow] outline-none h-10"
                popperClassName="z-50"
                popperPlacement="bottom-start"
              />
            </div>

            <div className="flex flex-col w-full">
              <label className="mb-1 text-xs font-semibold text-gray-500 uppercase tracking-tight flex items-center gap-1">
                <PawPrint className="h-3 w-3 text-primary" />
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
                <SelectTrigger className="h-10 text-sm bg-background">
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

            <div className="flex items-end h-full">
              <Button
                variant="outline"
                className="h-10 text-xs sm:text-sm px-4 bg-background w-full sm:w-auto"
                onClick={() => {
                  setSearchParams({
                    startDate: "",
                    specieId: 0,
                    page: 1,
                  });
                }}
                disabled={!searchParams.startDate && searchParams.specieId === 0}
              >
                <X className="h-3 w-3 sm:h-4 sm:w-4 mr-1 ml-[-4px]" />
                Limpiar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

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
              const date = row.original.createdAt;
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
              const date = row.original.createdAt;
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
