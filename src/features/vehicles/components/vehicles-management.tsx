"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { VehicleTable } from "./table-vehicles";
import { Badge } from "@/components/ui/badge";
import { parseAsInteger, parseAsString, useQueryStates } from "nuqs";
import { Edit, PlusIcon, SearchIcon, Truck } from "lucide-react";
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
import { useCatalogue } from "@/features/catalogues/hooks/use-catalogue";
import { capitalizeText } from "@/lib/utils";
import { getVehicleByFilterService } from "../server/db/vehicle.service";
import NewVehicleForm from "./new-vehicle.form";
import { toCapitalize } from "@/lib/toCapitalize";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function VehiclesManagement({}) {
  const searchCarriersParams = useSearchParams();
  const catalogueTransportsType = useCatalogue("TTR");
  const catalogueVehiclesType = useCatalogue("TVH");

  const [searchParams, setSearchParams] = useQueryStates(
    {
      page: parseAsInteger.withDefault(1),
      limit: parseAsInteger.withDefault(10),
      plate: parseAsString.withDefault(""),
      brand: parseAsString.withDefault(""),
      transportTypeId: parseAsInteger.withDefault(0),
      vehicleTypeId: parseAsInteger.withDefault(0),
    },
    {
      history: "push",
    }
  );
  const query = useQuery({
    queryKey: ["vehicle", searchParams],
    queryFn: () =>
      getVehicleByFilterService({
        page: searchParams.page,
        limit: searchParams.limit,
        ...(searchParams.plate != "" && { plate: searchParams.plate }),
        ...(searchParams.brand != "" && { brand: searchParams.brand }),
        ...(searchParams.transportTypeId != 0 && {
          transportTypeId: searchParams.transportTypeId,
          vehicleTypeId: searchParams.vehicleTypeId,
        }),
      }),
  });

  const debouncePlate = useDebouncedCallback(
    (text: string) => setSearchParams({ plate: text, page: 1 }),
    500
  );
  const debounceBrand = useDebouncedCallback(
    (text: string) => setSearchParams({ brand: text, page: 1 }),
    500
  );

  return (
    <div>
      <section className="mb-4 flex justify-between">
        <div>
          <h2>Vehículos</h2>
          <p className="text-gray-600 text-sm mt-1">
            Gestión de vehículos registrados en el sistema
          </p>
        </div>
      </section>
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="flex gap-2 items-center">
            Filtros de Búsqueda
          </CardTitle>
          <CardDescription>
            Filtre los vehículos por placa, marca, tipo de transporte o tipo de
            vehículo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
                Buscar por marca
              </label>
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 z-10 h-5 w-5" />
                <Input
                  type="text"
                  placeholder="Ingrese la marca"
                  className="pl-10 pr-3 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2"
                  defaultValue={searchCarriersParams.get("brand") ?? ""}
                  onChange={(e) => debounceBrand(e.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-col w-full">
              <label className="mb-1 text-sm font-medium text-gray-700">
                Tipo de transporte
              </label>
              <Select
                onValueChange={(value) => {
                  setSearchParams({ transportTypeId: Number(value), page: 1 });
                }}
                defaultValue={"*"}
              >
                <SelectTrigger className="h-10 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <SelectValue placeholder="Seleccione el tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="*">Todos los tipos</SelectItem>
                  {catalogueTransportsType.data?.data.map(
                    (transport, index) => (
                      <SelectItem
                        key={index}
                        value={String(transport.catalogueId)}
                      >
                        {(transport.name ?? "").toUpperCase()}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col w-full">
              <label className="mb-1 text-sm font-medium text-gray-700">
                Tipo de vehículo
              </label>
              <Select
                onValueChange={(value) => {
                  setSearchParams({ vehicleTypeId: Number(value), page: 1 });
                }}
                defaultValue={"*"}
              >
                <SelectTrigger className="h-10 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <SelectValue placeholder="Seleccione el vehículo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="*">Todos los vehículos</SelectItem>
                  {catalogueVehiclesType.data?.data.map((vehicle, index) => (
                    <SelectItem key={index} value={String(vehicle.catalogueId)}>
                      {(vehicle.name ?? "").toUpperCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="flex justify-end ml-auto mb-3">
        <NewVehicleForm
          vehicleTypes={catalogueVehiclesType.data?.data ?? []}
          transportsTypes={catalogueTransportsType.data?.data ?? []}
          onSuccess={() => query.refetch()}
          trigger={
            <Button>
              <PlusIcon className="h-4 w-4" />
              Nuevo Vehículo
            </Button>
          }
        />
      </div>
      <VehicleTable
        columns={[
          {
            accessorKey: "plate",
            header: "Placa",
          },
          {
            id: "brand",
            header: "Vehículo",
            cell: ({ row }) => {
              const brand = row.original.brand ?? "";
              const model = row.original.model ?? "";
              return toCapitalize(`${brand} - ${model}`, true);
            },
          },
          {
            id: "vehicleType",
            header: "Tipo",
            cell: ({ row }) => {
              const type = row.original.vehicleDetail?.vehicleType?.name;
              return (
                <Badge variant={"outline"} className="flex items-center gap-1">
                  {type}
                </Badge>
              );
            },
          },
          {
            id: "transportType",
            header: "Transporte",
            cell: ({ row }) => {
              const type = row.original.vehicleDetail?.transportType?.code;

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
            accessorKey: "color",
            header: "Color",
          },
          {
            accessorKey: "manufactureYear",
            header: "Año",
          },
          {
            header: "Acciones",
            cell: ({ row }) => {
              return (
                <div className="flex items-center space-x-2">
                  <NewVehicleForm
                    onSuccess={() => {
                      query.refetch();
                    }}
                    vehicleTypes={catalogueVehiclesType.data?.data ?? []}
                    transportsTypes={catalogueTransportsType.data?.data ?? []}
                    isUpdate={true}
                    initialData={{
                      id: row.original.id,
                      plate: row.original.plate,
                      vehicleTypeId: String(
                        row.original.vehicleDetailId ?? ""
                      ),
                      brand: row.original.brand ?? "",
                      model: row.original.model ?? "",
                      color: row.original.color ?? "",
                      year:
                        row.original.manufactureYear ??
                        new Date().getFullYear(),
                      transportTypeId: String(
                        row.original.vehicleDetail?.transportType?.id ?? ""
                      ),
                      status: row.original.status,
                    }}
                    trigger={
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex items-center gap-1"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    }
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
