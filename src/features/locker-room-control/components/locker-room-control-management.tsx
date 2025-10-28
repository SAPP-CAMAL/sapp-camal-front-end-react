"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  CalendarIcon,
  EditIcon,
  Trash2,
  Eye,
  Package,
  Shield,
  AlertCircle,
  PlusIcon,
  Shirt,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  getLockerRoomControlByDateService,
  removeLockerRoomControlById,
} from "../server/db/locker-room-control.service";
import NewLockerRoomControlForm from "./new-locker-room.form";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@radix-ui/react-tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { getAllBiosecurityLinesService } from "../server/db/biosecurity-line.service";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { capitalizeText } from "@/lib/utils";

// Componente para mostrar observaciones
function ObservationsPopover({ observations }: { observations: string[] }) {
  if (!observations || observations.length === 0) {
    return (
      <Badge variant="secondary" className="cursor-default">
        <AlertCircle className="h-4 w-4" />
        Sin observaciones
      </Badge>
    );
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 gap-2">
          <AlertCircle className=" h-4 w-4" />
          Ver ({observations.length})
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="center">
        <div className="space-y-2">
          <h4 className="font-semibold text-sm flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            Observaciones
          </h4>
          <div className="space-y-1.5">
            {observations.map((obs, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2 text-sm p-2 bg-muted rounded-md"
              >
                <span className="text-muted-foreground font-medium">•</span>
                <span className="flex-1">{obs}</span>
              </div>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

// Componente para mostrar vestuario y lencería
function VestuarioPopover({ items }: { items: string[] }) {
  if (!items || items.length === 0) {
    return (
      <Badge variant="secondary" className="cursor-default">
        Sin items
      </Badge>
    );
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 gap-2">
          <Shirt className="text-green-500 h-4 w-4" />
          Ver ({items.length})
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="center">
        <div className="space-y-2">
          <h4 className="font-semibold text-sm flex items-center gap-2">
            <Shirt className="h-4 w-4" />
            Vestuario y Lencería
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {items.map((item, idx) => (
              <Badge
                key={idx}
                variant="secondary"
                className="justify-center text-xs py-1.5"
              >
                {item}
              </Badge>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

// Componente para mostrar equipo de protección
function EquipoProteccionPopover({ items }: { items: string[] }) {
  if (!items || items.length === 0) {
    return (
      <Badge variant="secondary" className="cursor-default">
        Sin items
      </Badge>
    );
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 gap-2">
          <Shield className="h-4 w-4 text-red-500" />
          Ver ({items.length})
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="center">
        <div className="space-y-2">
          <h4 className="font-semibold text-sm flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Equipo de Protección
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {items.map((item, idx) => (
              <Badge
                key={idx}
                variant="secondary"
                className="justify-center text-xs py-1.5"
              >
                {item}
              </Badge>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export function LockerRoomControlManagement() {
  const queryClient = useQueryClient();
  const today = useMemo(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }, []);

  const [fecha, setFecha] = useState<Date>(today);
  const [selectedLine, setSelectedLine] = useState("1");
  const [floatingPosition, setFloatingPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<{
    startX: number;
    startY: number;
    elemX: number;
    elemY: number;
  } | null>(null);
  console.log({ selectedLine });

  useEffect(() => {
    if (typeof window !== "undefined") {
      setFloatingPosition({
        x: 20,
        y: window.innerHeight - 150,
      });
    }
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging && dragRef.current) {
        const deltaX = e.clientX - dragRef.current.startX;
        const deltaY = e.clientY - dragRef.current.startY;
        setFloatingPosition({
          x: dragRef.current.elemX + deltaX,
          y: dragRef.current.elemY + deltaY,
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  const { data: lockerRoomData = [], isLoading: isLoadingData } = useQuery({
    queryKey: ["locker-room-data", fecha, selectedLine],
    queryFn: async () => {
      const formattedDate = format(fecha, "yyyy-MM-dd");
      const data = await getLockerRoomControlByDateService(
        formattedDate,
        Number(selectedLine)
      );
      return data ?? [];
    },
  });

  const biosecurityLinesList = useQuery({
    queryKey: ["biosecurity-lines"],
    queryFn: getAllBiosecurityLinesService,
  });

  const handleDelete = async (id: number) => {
    try {
      await removeLockerRoomControlById(id);
      toast.success("Registro eliminado exitosamente");
      handleRefresh();
    } catch (error) {
      toast.error("No se pudo eliminar el registro");
    }
  };

  const handleRefresh = () => {
    setFecha(today);
    queryClient.invalidateQueries({ queryKey: ["locker-room-data"] });
  };

  return (
    <div className="space-y-4">
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="mx-auto max-w-screen-xl px-3 md:px-4 py-3 md:py-4">
          <div className="text-center">
            <h1 className="text-2xl font-normal">
              INGRESO CONTROL DE VESTUARIO
            </h1>
            <p className="text-sm text-muted-foreground">
              Registros generados para:{" "}
              {format(fecha, "dd 'de' MMMM 'de' yyyy", { locale: es })}
            </p>
          </div>

          <div className="mt-3 flex flex-col lg:flex-row gap-3 lg:gap-4 lg:items-center lg:justify-between">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
              <Label
                htmlFor="fecha"
                className="text-sm font-medium whitespace-nowrap"
              >
                Fecha:
              </Label>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative w-full sm:w-[200px]">
                  <CalendarIcon
                    className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10 cursor-pointer"
                    onClick={() => {
                      const input = document.getElementById(
                        "fecha"
                      ) as HTMLInputElement;
                      if (input) input.showPicker();
                    }}
                  />
                  <Input
                    id="fecha"
                    type="date"
                    className="w-full bg-muted transition-colors focus:bg-background pl-8 [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-2 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                    value={fecha ? format(fecha, "yyyy-MM-dd") : ""}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      const dateValue = e.target.value;
                      if (dateValue) {
                        const [year, month, day] = dateValue
                          .split("-")
                          .map(Number);
                        const newDate = new Date(year, month - 1, day);
                        setFecha(newDate);
                      }
                    }}
                    title="Selecciona la fecha"
                  />
                </div>
                {format(fecha, "yyyy-MM-dd") !==
                  format(today, "yyyy-MM-dd") && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setFecha(today)}
                    className="text-xs px-2 py-1 h-8 whitespace-nowrap"
                    title="Volver a hoy"
                  >
                    Hoy
                  </Button>
                )}
              </div>
            </div>
            {/* Línea */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 lg:ml-2">
              <span className="text-sm text-black font-semibold whitespace-nowrap">
                Línea:
              </span>
              <Select
                value={selectedLine}
                onValueChange={(value) => setSelectedLine(value)}
              >
                <SelectTrigger className="h-10 w-full border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500">
                  <SelectValue placeholder="Seleccione una línea" />
                </SelectTrigger>
                <SelectContent>
                  {biosecurityLinesList.data?.data.map((line, index) => (
                    <SelectItem key={index} value={String(line.id)}>
                      {capitalizeText(line.name)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-start lg:justify-end">
              <NewLockerRoomControlForm
                onSuccess={handleRefresh}
                biosecurityLines={biosecurityLinesList.data?.data ?? []}
                selectedLine={selectedLine}
                setSelectedLine={setSelectedLine}
                trigger={
                  <Button className="w-full sm:w-auto">
                    <PlusIcon className="h-4 w-4" />
                    Ingresar Vestuario
                  </Button>
                }
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div
        className="relative overflow-auto border-2 rounded-lg"
        style={{ maxHeight: "calc(100vh - 280px)" }}
      >
        {isLoadingData ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-2"></div>
              <p className="text-sm text-muted-foreground">
                Cargando datos ...
              </p>
            </div>
          </div>
        ) : lockerRoomData.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <p className="text-muted-foreground">
                No hay datos disponibles para la fecha
              </p>
            </div>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-center border font-bold border-l-0">
                  FECHA
                </TableHead>
                <TableHead className="text-center border font-bold">
                  EMPLEADO
                </TableHead>
                <TableHead className="text-center border font-bold">
                  RESPONSABLE
                </TableHead>
                <TableHead className="text-center border font-bold">
                  OBSERVACIONES
                </TableHead>
                <TableHead className="text-center border font-bold">
                  VESTUARIO Y LENCERIA
                </TableHead>
                <TableHead className="text-center border font-bold">
                  EQUIPO DE PROTECCIÓN
                </TableHead>
                <TableHead className="text-center border font-bold">
                  ACCIONES
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {lockerRoomData?.map((row, idx) => (
                <TableRow key={idx}>
                  <TableCell className="text-center border">
                    {new Date(row.timeRegister).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="font-semibold border">
                    {row.employeeFullName}
                  </TableCell>
                  <TableCell className="font-semibold border">
                    {row.responsibleFullName}
                  </TableCell>
                  <TableCell className="text-center border">
                    <ObservationsPopover observations={row.observations} />
                  </TableCell>
                  <TableCell className="text-center border">
                    <VestuarioPopover
                      items={
                        row.detailsLockerGrouped?.["VESTUARIO Y LENCERIA"] ?? []
                      }
                    />
                  </TableCell>
                  <TableCell className="text-center border">
                    <EquipoProteccionPopover
                      items={
                        row.detailsLockerGrouped?.["EQUIPO DE PROTECCIÓN"] ?? []
                      }
                    />
                  </TableCell>
                  <TableCell className="text-center border">
                    <div className="flex items-center justify-center gap-2">
                      {(() => {
                        const disabled =
                          format(fecha, "yyyy-MM-dd") !==
                          format(today, "yyyy-MM-dd");

                        return (
                          <>
                            <Tooltip>
                              <NewLockerRoomControlForm
                                isUpdate={true}
                                lockerRoomData={row}
                                selectedLine={selectedLine}
                                setSelectedLine={setSelectedLine}
                                biosecurityLines={
                                  biosecurityLinesList.data?.data ?? []
                                }
                                onSuccess={handleRefresh}
                                trigger={
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      disabled={disabled}
                                      className={
                                        disabled
                                          ? "opacity-50 cursor-not-allowed"
                                          : ""
                                      }
                                    >
                                      <EditIcon className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                }
                              />
                              <TooltipContent
                                side="top"
                                align="center"
                                sideOffset={5}
                                avoidCollisions
                                style={{
                                  backgroundColor: "var(--primary)",
                                  color: "var(--primary-foreground)",
                                  padding: "0.5rem 1rem",
                                  borderRadius: "0.375rem",
                                  fontSize: "0.875rem",
                                }}
                              >
                                {disabled
                                  ? "Solo editable en la fecha de hoy"
                                  : "Editar"}
                              </TooltipContent>
                            </Tooltip>

                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => handleDelete(row.id)}
                                  disabled={disabled}
                                  className={
                                    disabled
                                      ? "opacity-50 cursor-not-allowed"
                                      : ""
                                  }
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent
                                side="top"
                                align="center"
                                sideOffset={5}
                                avoidCollisions
                                style={{
                                  backgroundColor: "var(--primary)",
                                  color: "var(--primary-foreground)",
                                  padding: "0.5rem 1rem",
                                  borderRadius: "0.375rem",
                                  fontSize: "0.875rem",
                                }}
                              >
                                {disabled
                                  ? "Solo eliminable en la fecha de hoy"
                                  : "Eliminar"}
                              </TooltipContent>
                            </Tooltip>
                          </>
                        );
                      })()}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}

export default LockerRoomControlManagement;
