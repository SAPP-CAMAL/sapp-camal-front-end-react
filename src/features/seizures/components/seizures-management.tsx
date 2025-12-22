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
  Loader2,
  Hash,
  Calendar,
  User,
  Info,
  Ticket,
  X,
  Package,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { default as BaseDatePicker } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "@/components/ui/react-datepicker-custom-styles.css";
import {
  ProductSeizureItem,
  SeizureType,
  SubproductSeizureItem,
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
  getProductSeizuresService,
  getSubproductSeizuresService,
  downloadSubproductTicket,
  downloadProductTicket,
} from "../server/seizures.service";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function SeizuresManagement() {
  const [seizureType, setSeizureType] = useState<SeizureType>("products");
  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  const { data: speciesData } = useAllSpecies();

  const [searchParams, setSearchParams] = useQueryStates(
    {
      page: parseAsInteger.withDefault(1),
      limit: parseAsInteger.withDefault(10),
      date: parseAsString.withDefault(""),
      specieId: parseAsInteger.withDefault(0),
    },
    {
      history: "push",
    }
  );

  const productQuery = useQuery({
    queryKey: [
      "product-seizures",
      searchParams.page,
      searchParams.limit,
      searchParams.date,
      searchParams.specieId,
    ],
    queryFn: () =>
      getProductSeizuresService({
        page: searchParams.page,
        limit: searchParams.limit,
        specieId: searchParams.specieId,
        ...(searchParams.date && { createdAt: searchParams.date }),
      }),
    enabled: seizureType === "products" && searchParams.specieId > 0,
  });

  const subproductQuery = useQuery({
    queryKey: [
      "subproduct-seizures",
      searchParams.page,
      searchParams.limit,
      searchParams.date,
      searchParams.specieId,
    ],
    queryFn: () =>
      getSubproductSeizuresService({
        page: searchParams.page,
        limit: searchParams.limit,
        specieId: searchParams.specieId,
        ...(searchParams.date && { createdAt: searchParams.date }),
      }),
    enabled: seizureType === "subproducts" && searchParams.specieId > 0,
  });

  const isLoading =
    seizureType === "products"
      ? productQuery.isLoading
      : subproductQuery.isLoading;

  const productData: ProductSeizureItem[] =
    productQuery.data?.data?.items ?? [];
  const subproductData: SubproductSeizureItem[] =
    subproductQuery.data?.data?.items ?? [];

  const meta =
    seizureType === "products"
      ? productQuery.data?.data?.meta
      : subproductQuery.data?.data?.meta;

  // Adaptar datos de subproductos para la tabla
  const adaptedSubproductData = subproductData.map((item) => ({
    id: item.subProductPostmortem_id,
    createdAt: item.createdAt,
    fullNameIntroducer: item.fullName,
    productDescription: item.productDescription,
    weight: item.weight,
    percentageAffection: item.percentageAffection,
  }));

  const handleDownloadSubproductTicket = async (id: number) => {
    setDownloadingId(id);
    try {
      const { blob, filename } = await downloadSubproductTicket(id);
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

  const handleDownloadProductTicket = async (id: number) => {
    setDownloadingId(id);
    try {
      const { blob, filename } = await downloadProductTicket(id);
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
        <h2 className="font-semibold text-lg sm:text-xl">Decomisos Realizados</h2>
        <p className="text-gray-600 text-xs sm:text-sm mt-1">
          Gestión de decomisos de productos y subproductos
        </p>
      </section>

      <Card className="mb-4">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="flex gap-2 items-center text-base sm:text-lg">
            Filtros de Búsqueda
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Filtre los registros por fecha y especie
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-3 sm:gap-4 w-full items-end">
            <div className="flex flex-col w-full">
              <label className="mb-1 text-xs sm:text-sm font-medium text-gray-700 flex items-center gap-1">
                <CalendarDays className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-primary" />
                Fecha <span className="text-muted-foreground font-normal">(opcional)</span>
              </label>
              <BaseDatePicker
                selected={
                  searchParams.date ? parseISO(searchParams.date) : null
                }
                onChange={(date: Date | null) => {
                  if (date) {
                    setSearchParams({
                      date: format(date, "yyyy-MM-dd"),
                      page: 1,
                    });
                  } else {
                    setSearchParams({ date: "", page: 1 });
                  }
                }}
                dateFormat="dd/MM/yyyy"
                locale={es}
                showIcon
                isClearable
                icon={
                  <CalendarDays className="text-muted-foreground h-4 w-4" />
                }
                placeholderText="Seleccione fecha"
                wrapperClassName="w-full"
                className="border-input flex w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs transition-[color,box-shadow] outline-none h-10"
                popperClassName="z-50"
                popperPlacement="bottom-start"
              />
            </div>

            <div className="flex flex-col w-full">
              <label className="mb-1 text-xs sm:text-sm font-medium text-gray-700 flex items-center gap-1">
                <PawPrint className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-primary" />
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
                <SelectTrigger className="h-10 text-sm">
                  <SelectValue placeholder="Seleccione uno" />
                </SelectTrigger>
                <SelectContent>
                  {speciesData?.data?.map((specie) => (
                    <SelectItem key={specie.id} value={specie.id.toString()}>
                      {specie.description || specie.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              variant="outline"
              className="h-10 text-xs sm:text-sm px-3"
              onClick={() => {
                setSearchParams({
                  date: "",
                  specieId: 0,
                  page: 1,
                });
              }}
              disabled={!searchParams.date && searchParams.specieId === 0}
            >
              <X className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
              Limpiar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Toggle Buttons */}
      <div className="flex gap-2 mb-4 justify-center">
        <Button
          variant={seizureType === "products" ? "default" : "outline"}
          size="sm"
          className="text-xs sm:text-sm px-3 sm:px-4"
          onClick={() => {
            setSeizureType("products");
            setSearchParams({ page: 1 });
          }}
        >
          <Package className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5" />
          Productos
        </Button>
        <Button
          variant={seizureType === "subproducts" ? "default" : "outline"}
          size="sm"
          className="text-xs sm:text-sm px-3 sm:px-4"
          onClick={() => {
            setSeizureType("subproducts");
            setSearchParams({ page: 1 });
          }}
        >
          <Layers className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5" />
          Subproductos
        </Button>
      </div>

      {seizureType === "products" ? (
        <SeizuresTable
          title="Lista de Decomisos - Productos"
          columns={[
            {
              id: "rowNumber",
              header: () => (
                <div className="flex items-center gap-1">
                  <Hash className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                  <span className="hidden sm:inline">Nro</span>
                  <span className="sm:hidden">#</span>
                </div>
              ),
              cell: ({ row }) => {
                const rowNumber =
                  (searchParams.page - 1) * searchParams.limit + row.index + 1;
                return <span className="font-medium">{rowNumber}</span>;
              },
            },
            {
              id: "seizureDate",
              header: () => (
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                  <span className="hidden md:inline">Fecha de Decomiso</span>
                  <span className="md:hidden">Fecha</span>
                </div>
              ),
              cell: ({ row }) => {
                const date = row.original.createdAt;
                if (!date) return "—";
                return format(parseISO(date), "dd/MM/yyyy");
              },
            },
            {
              id: "introducerName",
              header: () => (
                <div className="flex items-center gap-1">
                  <User className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                  Introductor
                </div>
              ),
              cell: ({ row }) => (
                <span className="font-medium line-clamp-2">
                  {row.original.fullNameIntroducer ?? "—"}
                </span>
              ),
            },
            {
              id: "detail",
              header: () => (
                <div className="flex items-center gap-1">
                  <Info className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                  Detalle
                </div>
              ),
              cell: ({ row }) => (
                <div className="flex flex-col min-w-[120px]">
                  <span className="font-medium text-xs sm:text-sm line-clamp-1">
                    {row.original.bodyPartDescription ?? "—"}
                  </span>
                  <span className="text-gray-600 text-[10px] sm:text-xs">
                    Peso: {row.original.weight ?? "—"} kg |{" "}
                    <span className="hidden sm:inline">
                      {row.original.isTotalConfiscation
                        ? "Decomiso Total"
                        : "Decomiso Parcial"}
                    </span>
                    <span className="sm:hidden">
                      {row.original.isTotalConfiscation ? "Total" : "Parcial"}
                    </span>
                  </span>
                </div>
              ),
            },
            {
              id: "actions",
              header: () => (
                <div className="flex items-center justify-center gap-1">
                  <Ticket className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                  <span className="hidden sm:inline">Ticket</span>
                </div>
              ),
              cell: ({ row }) => (
                <div className="flex justify-center">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="hover:bg-primary hover:text-white transition-colors h-7 w-7 sm:h-8 sm:w-8 p-0"
                        onClick={() => handleDownloadProductTicket(row.original.id)}
                        disabled={downloadingId === row.original.id}
                      >
                        {downloadingId === row.original.id ? (
                          <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                        ) : (
                          <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Descargar ticket de decomiso</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              ),
            },
          ]}
          data={productData}
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
      ) : (
        <SeizuresTable
          title="Lista de Decomisos - Subproductos"
          columns={[
            {
              id: "rowNumber",
              header: () => (
                <div className="flex items-center gap-1">
                  <Hash className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                  <span className="hidden sm:inline">Nro</span>
                  <span className="sm:hidden">#</span>
                </div>
              ),
              cell: ({ row }) => {
                const rowNumber =
                  (searchParams.page - 1) * searchParams.limit + row.index + 1;
                return <span className="font-medium">{rowNumber}</span>;
              },
            },
            {
              id: "seizureDate",
              header: () => (
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                  <span className="hidden md:inline">Fecha de Decomiso</span>
                  <span className="md:hidden">Fecha</span>
                </div>
              ),
              cell: ({ row }) => {
                const date = row.original.createdAt;
                if (!date) return "—";
                return format(parseISO(date), "dd/MM/yyyy");
              },
            },
            {
              id: "introducerName",
              header: () => (
                <div className="flex items-center gap-1">
                  <User className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                  Introductor
                </div>
              ),
              cell: ({ row }) => (
                <span className="font-medium line-clamp-2">
                  {row.original.fullNameIntroducer ?? "—"}
                </span>
              ),
            },
            {
              id: "detail",
              header: () => (
                <div className="flex items-center gap-1">
                  <Info className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                  Detalle
                </div>
              ),
              cell: ({ row }) => (
                <div className="flex flex-col min-w-[120px]">
                  <span className="font-medium text-xs sm:text-sm line-clamp-1">
                    {row.original.productDescription ?? "—"}
                  </span>
                  <span className="text-gray-600 text-[10px] sm:text-xs">
                    Peso: {row.original.weight ?? "—"} kg | Afección:{" "}
                    {row.original.percentageAffection ?? "—"}%
                  </span>
                </div>
              ),
            },
            {
              id: "actions",
              header: () => (
                <div className="flex items-center justify-center gap-1">
                  <Ticket className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                  <span className="hidden sm:inline">Ticket</span>
                </div>
              ),
              cell: ({ row }) => (
                <div className="flex justify-center">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="hover:bg-primary hover:text-white transition-colors h-7 w-7 sm:h-8 sm:w-8 p-0"
                        onClick={() =>
                          handleDownloadSubproductTicket(row.original.id)
                        }
                        disabled={downloadingId === row.original.id}
                      >
                        {downloadingId === row.original.id ? (
                          <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                        ) : (
                          <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Descargar ticket de decomiso</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              ),
            },
          ]}
          data={adaptedSubproductData}
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
      )}
    </div>
  );
}
