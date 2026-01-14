"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { NewCarrier } from "./new-carrier.form";
import { CarriersTable } from "./table-carriers";
import { ReportDownloadButtons } from "@/components/report-download-buttons";
import { fetchWithFallback } from "@/lib/ky";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { parseAsInteger, parseAsString, useQueryStates } from "nuqs";
import { CreditCardIcon, EditIcon, PlusIcon, SearchIcon, Truck } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { getCarriersByFilterService } from "../server/carriers.service";
import { useSearchParams } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";
import { Button } from "@/components/ui/button";
import { useCatalogue } from "@/features/catalogues/hooks/use-catalogue";
import { capitalizeText } from "@/lib/utils";
import { toCapitalize } from "@/lib/toCapitalize";
import { useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function CarriersManagement({}) {
  const searchCarriersParams = useSearchParams();
  const catalogueTransportsType = useCatalogue("TTR");

  const [searchParams, setSearchParams] = useQueryStates(
    {
      page: parseAsInteger.withDefault(1),
      limit: parseAsInteger.withDefault(10),
      identification: parseAsString.withDefault(""),
      fullName: parseAsString.withDefault(""),
      plate: parseAsString.withDefault(""),
      transportTypeId: parseAsInteger.withDefault(0),
      shippingStatus: parseAsString.withDefault("*"),
      vehicleStatus: parseAsString.withDefault("*"),
    },
    {
      history: "push",
      clearOnDefault: true,
    }
  );
  const query = useQuery({
    queryKey: ["shipping", searchParams],
    queryFn: () =>
      getCarriersByFilterService({
        page: searchParams.page,
        limit: searchParams.limit,
        ...(searchParams.identification != "" && {
          identification: searchParams.identification,
        }),
        ...(searchParams.fullName.length > 2 && {
          fullName: searchParams.fullName,
        }),
        ...(searchParams.plate != "" && { plate: searchParams.plate }),
        ...(searchParams.transportTypeId != 0 && {
          transportTypeId: searchParams.transportTypeId,
        }),
        ...(searchParams.shippingStatus !== "*" && {
          shippingStatus: searchParams.shippingStatus === "true",
        }),
        ...(searchParams.vehicleStatus !== "*" && {
          vehicleStatus: searchParams.vehicleStatus === "true",
        }),
      }),
    enabled: searchParams !== null,
    staleTime: 1000,
  });

  const debounceFullName = useDebouncedCallback(
    (text: string) => setSearchParams({ fullName: text, page: 1 }),
    500
  );

  const debounceIdentification = useDebouncedCallback(
    (text: string) => setSearchParams({ identification: text, page: 1 }),
    500
  );

  const debouncePlate = useDebouncedCallback(
    (text: string) => setSearchParams({ plate: text, page: 1 }),
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
      if (searchParams.identification && searchParams.identification.length > 0) body.identification = searchParams.identification;
      if (searchParams.fullName && searchParams.fullName.length > 0) body.fullName = searchParams.fullName;
      if (searchParams.plate && searchParams.plate.length > 0) body.plate = searchParams.plate;
      if (searchParams.transportTypeId && searchParams.transportTypeId !== 0) body.transportTypeId = searchParams.transportTypeId;
      if (searchParams.shippingStatus && searchParams.shippingStatus !== '*') body.shippingStatus = searchParams.shippingStatus === 'true';
      if (searchParams.vehicleStatus && searchParams.vehicleStatus !== '*') body.vehicleStatus = searchParams.vehicleStatus === 'true';

      const endpoint = `/v1/1.0.0/shipping/report-by-filter?reportType=${type}`;
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
      const fileName = `transportistas_${Date.now()}.${fileType}`;
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
        <div>
          <h2 className="font-semibold text-xl">Transportistas</h2>
          <p className="text-gray-600 text-sm mt-1">
            Gestión de transportistas y vehículos registrados en el sistema
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
            Filtre los transportistas por nombre, identificación, placa, tipo de
            transporte o estado
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-4">
            <div className="flex flex-col w-full">
              <label className="mb-1 text-sm font-medium text-gray-700">
                Buscar por nombre
              </label>
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 z-10 h-5 w-5" />
                <Input
                  type="text"
                  placeholder="Buscar por nombres"
                  className="pl-10 pr-3 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2"
                  defaultValue={searchCarriersParams.get("fullName") ?? ""}
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
                  placeholder="Ingrese Identificación"
                  className="pl-10 pr-3 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2"
                  defaultValue={
                    searchCarriersParams.get("identification") ?? ""
                  }
                  onChange={(e) => debounceIdentification(e.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-col w-full">
              <label className="mb-1 text-sm font-medium text-gray-700">
                Buscar por placa
              </label>
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 z-10 h-5 w-5" />
                <Input
                  type="text"
                  placeholder="Ingrese la placa"
                  className="pl-10 pr-3 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2"
                  defaultValue={searchCarriersParams.get("plate") ?? ""}
                  onChange={(e) => debouncePlate(e.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-col w-full">
              <label className="mb-1 text-sm font-medium text-gray-700">
                Tipo de transporte
              </label>
              <Select
                value={String(searchParams.transportTypeId)}
                onValueChange={(value) => {
                  setSearchParams({ transportTypeId: Number(value), page: 1 });
                }}
              >
                <SelectTrigger className="h-10 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <SelectValue placeholder="Seleccione el tipo de transporte" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Todos los tipos</SelectItem>
                  {catalogueTransportsType.data?.data.map(
                    (transport, index) => (
                      <SelectItem
                        key={index}
                        value={String(transport.catalogueId)}
                      >
                        {capitalizeText(transport.name)}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col w-full">
              <label className="mb-1 text-sm font-medium text-gray-700">
                Estado Transportista
              </label>
              <Select
                value={searchParams.shippingStatus}
                onValueChange={(value) => {
                  setSearchParams({ shippingStatus: value, page: 1 });
                }}
              >
                <SelectTrigger className="h-10 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <SelectValue placeholder="Seleccione un estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={"*"}>Todos los estados</SelectItem>
                  <SelectItem value={"true"}>Activo</SelectItem>
                  <SelectItem value={"false"}>Inactivo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="flex justify-end ml-auto mb-3">
        <NewCarrier
          trigger={
            <Button>
              <PlusIcon className="h-4 w-4" />
              Nuevo Transportista
            </Button>
          }
        />
      </div>
      <CarriersTable
        columns={[
          {
            accessorKey: "person.fullName",
            header: "Transportista",
          },
          {
            accessorKey: "person.identification",
            header: "Identificación",
          },
          {
            id: "vehicle",
            header: "Vehículo",
            accessorFn: (row) => row.vehicle,
            cell: ({ row }) => {
              const vehicle = row.original.vehicle;
              const vehicleName = vehicle.vehicleDetail?.vehicleType?.name?.trim() ?? "";
              let value = vehicleName === 'N/A' ? vehicleName: toCapitalize(vehicleName);

              if (vehicle.color) value += ` • ${vehicle.color}`;
              if (vehicle.manufactureYear)
                value += ` • ${vehicle.manufactureYear}`;

              return (
                <div className="flex flex-col">
                  <span className="font-medium">
                    {vehicle.brand} {vehicle.model}
                  </span>
                  <span className="text-sm text-muted-foreground">{value}</span>
                </div>
              );
            },
          },
          {
            accessorKey: "vehicle.plate",
            header: "Placa",
          },
          {
            id: "transportType",
            header: "Tipo Transporte",
            cell: ({ row }) => {
              const type =
                row.original.vehicle?.vehicleDetail?.transportType?.code;

              if (!type) return null;

              let label = type;
              let colorVariant: "tertiary" | "quaterniary" | "destructive" =
                "quaterniary";

              if (type === "PRS") {
                label = "Productos";
                colorVariant = "tertiary";
              } else if (type === "ANM") {
                label = "Animales";
                colorVariant = "quaterniary";
              }

              return (
                <Badge
                  variant={colorVariant}
                  className="flex items-center gap-1"
                >
                  <Truck />
                  {label}
                </Badge>
              );
            },
          },
          {
            accessorKey: "status",
            header: "Estado",
            cell: ({ row }) => (
              <Badge>{row.original.status ? "Activo" : "Inactivo"}</Badge>
            ),
          },
          {
            header: "Acciones",
            cell: ({ row }) => {
              const [open, setOpen] = useState(false);
              return (
                <div className="flex items-center space-x-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" onClick={() => setOpen(true)}>
                        <EditIcon />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent
                      side="top"
                      align="center"
                      sideOffset={5}
                      avoidCollisions
                    >
                      Editar Tranportista
                    </TooltipContent>
                  </Tooltip>
                  <NewCarrier
                    shipping={row.original}
                    isUpdate={true}
                    open={open}
                    onOpenChange={setOpen}
                    onSuccess={() => query.refetch()}
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
