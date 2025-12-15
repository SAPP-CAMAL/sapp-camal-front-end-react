"use client";

import { toast } from "sonner";
import { format, parseISO } from "date-fns";
import { parseAsString, useQueryStates } from "nuqs";
import { ColumnDef, flexRender, Row } from "@tanstack/react-table";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet,
  FileText,
  FileUp,
  Info,
  Car,
  User,
  Clock,
  Droplets,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { usePaginated } from "@/hooks/use-paginated";
import { DatePicker } from "@/components/ui/date-picker";
import { useGetRegisterVehicleByDate } from "@/features/vehicles/hooks";
import { DetailRegisterVehicleByDate } from "@/features/vehicles/domain";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDailyDisinfectionRegisterContext } from "../hooks/use-daily-disinfection-register-context";
import { RegisterVehicleTimeOut } from "./register-vehicle-time-out";
import { toCapitalize } from "../../../lib/toCapitalize";
import { handleDownloadRegisterVehicleReport } from "../utils/handle-download-register-vehicle-report";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

const columns: ColumnDef<DetailRegisterVehicleByDate, string>[] = [
  {
    header: "#",
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-medium">{row.index + 1}</span>
      </div>
    ),
  },
  {
    accessorKey: "registerVehicle.shipping.person.fullName",
    header: "Chofer",
    cell: ({ row }) =>
      toCapitalize(
        row.original.registerVehicle?.shipping?.person?.fullName ?? "",
        true
      ),
  },
  {
    accessorKey: "registerVehicle.shipping.vehicle.plate",
    header: "Placa",
    cell: ({ row }) =>
      row.original.registerVehicle?.shipping?.vehicle?.plate ?? "",
  },
  {
    accessorKey:
      "registerVehicle.shipping.vehicle.vehicleDetail.vehicleType.name",
    header: "Tipo Vehículo",
    cell: ({ row }) =>
      toCapitalize(
        row.original.registerVehicle?.shipping?.vehicle?.vehicleDetail
          ?.vehicleType?.name ?? "",
        true
      ),
  },
  {
    accessorKey: "species.name",
    header: "Especies",
    cell: ({ row }) => toCapitalize(row.original.species.name ?? "", true),
  },
  {
    accessorKey: "disinfectant.name",
    header: "Desinfectante",
  },
  {
    accessorKey: "dosage",
    header: "Dosificación",
  },
  {
    header: "H. Aplic. Ingreso",
    cell: ({ row }) => (
      <>{row.original.timeStar.split(":").slice(0, 2).join(":")}</>
    ),
  },
  {
    header: "H. Aplic. Salida",
    cell: ({ row }) => {
      const timeEnd = row.original.timeEnd;
      return (
        <>
          {timeEnd ? (
            timeEnd.split(":").slice(0, 2).join(":")
          ) : (
            <RegisterVehicleTimeOut id={row.original.id} />
          )}
        </>
      );
    },
  },
  {
    header: "Observaciones",
    cell: ({ row }) => (
      <Tooltip>
        <TooltipTrigger asChild>
          <Info className="w-4 h-4" />
        </TooltipTrigger>
        <TooltipContent side="top" align="center">
          {row.original.commentary || "Sin observaciones"}
        </TooltipContent>
      </Tooltip>
    ),
  },
];

// Obtener fecha actual en zona horaria local
const today = new Date();
const currentDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

// Componente de tarjeta para vista móvil
function MobileCard({
  row,
  index,
  isSelected,
  onClick,
}: {
  row: DetailRegisterVehicleByDate;
  index: number;
  isSelected: boolean;
  onClick: () => void;
}) {
  const timeEnd = row.timeEnd;

  return (
    <Card
      className={`cursor-pointer transition-all ${isSelected ? "ring-2 ring-primary bg-blue-50" : "hover:bg-muted/50"}`}
      onClick={onClick}
    >
      <CardContent className="p-3 space-y-3">
        {/* Header con número y placa */}
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="text-xs">
            #{index + 1}
          </Badge>
          <Badge variant="secondary" className="font-mono">
            {row.registerVehicle?.shipping?.vehicle?.plate ?? "N/A"}
          </Badge>
        </div>

        {/* Chofer */}
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <span className="text-sm font-medium truncate">
            {toCapitalize(
              row.registerVehicle?.shipping?.person?.fullName ?? "",
              true
            )}
          </span>
        </div>

        {/* Vehículo y Especie */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Car className="h-3.5 w-3.5" />
            <span>
              {toCapitalize(
                row.registerVehicle?.shipping?.vehicle?.vehicleDetail
                  ?.vehicleType?.name ?? "",
                true
              )}
            </span>
          </div>
          <span>•</span>
          <span>{toCapitalize(row.species.name ?? "", true)}</span>
        </div>

        {/* Desinfectante y Dosificación */}
        <div className="flex items-center gap-2 text-xs">
          <Droplets className="h-3.5 w-3.5 text-blue-500" />
          <span>{row.disinfectant.name}</span>
          <span className="text-muted-foreground">({row.dosage})</span>
        </div>

        {/* Horarios */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-1.5 text-xs">
            <Clock className="h-3.5 w-3.5 text-green-600" />
            <span className="text-muted-foreground">Ingreso:</span>
            <span className="font-medium">
              {row.timeStar.split(":").slice(0, 2).join(":")}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <Clock className="h-3.5 w-3.5 text-orange-600" />
            <span className="text-muted-foreground">Salida:</span>
            {timeEnd ? (
              <span className="font-medium">
                {timeEnd.split(":").slice(0, 2).join(":")}
              </span>
            ) : (
              <RegisterVehicleTimeOut id={row.id} />
            )}
          </div>
        </div>

        {/* Observaciones si existen */}
        {row.commentary && (
          <div className="text-xs text-muted-foreground bg-muted/50 rounded p-2 mt-2">
            <span className="font-medium">Obs:</span> {row.commentary}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function DailyDisinfectionLogTable() {
  const [searchParams, setSearchParams] = useQueryStates(
    { date: parseAsString.withDefault(currentDate) },
    { history: "push" }
  );
  const {
    handleSetDailyDisinfectionRegister,
    handleRemoveDailyDisinfectionRegister,
  } = useDailyDisinfectionRegisterContext();

  const query = useGetRegisterVehicleByDate(searchParams.date);

  const { table } = usePaginated({ columns, data: query.data.data });

  const handleSelectRow = (
    e: React.MouseEvent,
    row: Row<DetailRegisterVehicleByDate>
  ) => {
    row.getToggleSelectedHandler()(e);

    const isSelected = row.getIsSelected();

    if (isSelected) handleRemoveDailyDisinfectionRegister();
    else handleSetDailyDisinfectionRegister(row.original);
  };

  const handleSelectMobileCard = (
    row: Row<DetailRegisterVehicleByDate>,
    index: number
  ) => {
    const isSelected = row.getIsSelected();
    row.toggleSelected(!isSelected);

    if (isSelected) handleRemoveDailyDisinfectionRegister();
    else handleSetDailyDisinfectionRegister(row.original);
  };

  const handleDownloadReport = async (type: "EXCEL" | "PDF") => {
    const parsedDate = parseISO(searchParams.date);
    if (Number.isNaN(parsedDate.getTime())) {
      toast.error("Fecha inválida");
      return;
    }
    const formattedDate = format(parsedDate, "yyyy-MM-dd");

    toast.promise(handleDownloadRegisterVehicleReport(formattedDate, type), {
      loading: "Generando reporte...",
      success: `Reporte ${type} descargado correctamente`,
      error: "Error al descargar el reporte",
    });
  };

  return (
    <div className="overflow-hidden rounded-lg border p-2 sm:p-4">
      {/* Header con filtros */}
      <div className="py-3 sm:py-4 px-1 sm:px-2 flex flex-col sm:flex-row gap-3 sm:gap-0 sm:justify-between">
        <h2 className="text-base sm:text-lg font-semibold">Registros Diarios</h2>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm whitespace-nowrap text-muted-foreground">
              Fecha:
            </span>
            <DatePicker
              inputClassName="bg-secondary h-9 text-sm"
              selected={parseISO(searchParams.date)}
              onChange={(date) => {
                if (!date) return;
                const formattedDate = format(date, "yyyy-MM-dd");
                setSearchParams({ date: formattedDate });
              }}
            />
          </div>

          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button
                size="sm"
                className="w-full sm:w-auto h-9"
                title="Generar reporte de los registros actuales"
                disabled={!query.data || query.data.data.length === 0}
              >
                <FileUp className="h-4 w-4" />
                <span className="ml-1.5">Reporte</span>
                <ChevronDown className="h-3 w-3 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-48"
              sideOffset={5}
              alignOffset={0}
            >
              <DropdownMenuItem
                onClick={() => handleDownloadReport("EXCEL")}
                className="cursor-pointer"
              >
                <FileSpreadsheet className="h-4 w-4 mr-2 text-green-600" />
                <span>Descargar Excel</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleDownloadReport("PDF")}
                className="cursor-pointer"
              >
                <FileText className="h-4 w-4 mr-2 text-red-600" />
                <span>Descargar PDF</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Vista móvil - Cards */}
      <div className="block lg:hidden space-y-3">
        {query.isLoading ? (
          <div className="text-center py-8 animate-pulse font-semibold text-muted-foreground">
            Cargando...
          </div>
        ) : table.getRowModel().rows?.length ? (
          table.getRowModel().rows.map((row, index) => (
            <MobileCard
              key={row.id}
              row={row.original}
              index={index}
              isSelected={row.getIsSelected()}
              onClick={() => handleSelectMobileCard(row, index)}
            />
          ))
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No hay resultados
          </div>
        )}
      </div>

      {/* Vista desktop - Tabla */}
      <div className="hidden lg:block overflow-x-auto">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className="text-xs whitespace-nowrap">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {query.isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center animate-pulse font-semibold"
                >
                  Cargando...
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className={row.getIsSelected() ? "bg-blue-50" : ""}
                  onClick={(e) => handleSelectRow(e, row)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="text-sm">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No hay resultados
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Paginación responsive */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mt-4 pt-3 border-t">
        <Button
          variant="outline"
          size="sm"
          disabled={!table.getCanPreviousPage()}
          onClick={() => table.previousPage()}
          className="w-full sm:w-auto"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Anterior
        </Button>

        <span className="text-xs sm:text-sm text-muted-foreground text-center order-first sm:order-none">
          Pág. {table.getState().pagination.pageIndex + 1} de{" "}
          {table.getPageCount() || 1}
          <span className="hidden sm:inline"> • {searchParams.date}</span>
        </span>

        <Button
          variant="outline"
          size="sm"
          disabled={!table.getCanNextPage()}
          onClick={() => table.nextPage()}
          className="w-full sm:w-auto"
        >
          Siguiente
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}
