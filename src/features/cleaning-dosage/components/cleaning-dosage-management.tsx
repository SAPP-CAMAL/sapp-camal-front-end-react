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
  PlusIcon,
  UserRound,
  Beaker,
  FlaskConical,
  AlertCircle,
  XIcon,
  Check,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { format, formatDate } from "date-fns";
import { es } from "date-fns/locale";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@radix-ui/react-tooltip";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getCleaningDosageByDateService,
  removeCleaningDosageById,
} from "../server/db/cleaning-dosage.service";
import React from "react";
import NewCleaningDosageForm from "./new-cleaning-dosage.form";
import { Badge } from "@/components/ui/badge";
import { ConfirmationDialog } from "@/components/confirmation-dialog";
import { DatePicker } from "@/components/ui/date-picker";

export function CleaningDosageManagement() {
  const queryClient = useQueryClient();
  const today = useMemo(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }, []);

  const [fecha, setFecha] = useState<Date>(today);
  const [startDate, setStartDate] = useState<Date>(today);
  const [endDate, setEndDate] = useState<Date>(today);

  const [floatingPosition, setFloatingPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<{
    startX: number;
    startY: number;
    elemX: number;
    elemY: number;
  } | null>(null);

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

  const { data: cleaningDosageData = [], isLoading: isLoadingData } = useQuery({
    queryKey: ["cleaning-dosage", startDate, endDate],
    queryFn: async () => {
      const data = await getCleaningDosageByDateService({
        startDate: formatDate(startDate, "yyyy-MM-dd"),
        endDate: formatDate(endDate, "yyyy-MM-dd")
      });
      return data ?? [];
    },
  });

  const handleDelete = async (id: number) => {
    try {
      await removeCleaningDosageById(id);
      toast.success("Registro eliminado exitosamente");
      handleRefresh();
    } catch (error) {
      toast.error("No se pudo eliminar el registro");
    }
  };

  const handleRefresh = () => {
    setFecha(today);
    queryClient.invalidateQueries({ queryKey: ["cleaning-dosage"] });
  };

  return (
    <div className="space-y-4">
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="mx-auto max-w-screen-xl px-3 md:px-4 py-3 md:py-4">
          <div className="text-center">
            <h1 className="text-2xl font-normal">
              REGISTRO DOSIFICACIÓN PARA LIMPIEZA Y SANITIZACIÓN
            </h1>
            {/* <p className="text-sm text-muted-foreground">
              Registros generados para:{" "}
              {format(fecha, "dd 'de' MMMM 'de' yyyy", { locale: es })}
            </p> */}
          </div>

          <div className="mt-3 flex flex-col lg:flex-row gap-3 lg:gap-4 lg:items-center lg:justify-between">
          <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Rango de fechas:
              </label>
              <div className="flex gap-2 items-end">
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-gray-500">Desde:</span>
                  <DatePicker
                    inputClassName="bg-secondary"
                    selected={startDate}
                    onChange={(newDate) => newDate && setStartDate(newDate)}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-gray-500">Hasta:</span>
                  <DatePicker
                    inputClassName="bg-secondary"
                    selected={endDate}
                    onChange={(newDate) => newDate && setEndDate(newDate)}
                  />
                </div>
                  <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>{
                        setStartDate(today);
                        setEndDate(today);
                      }}
                      className="whitespace-nowrap"
                      title="Filtrar solo hoy"
                    >
                      <CalendarIcon className="h-4 w-4 mr-1" />
                      Hoy
                    </Button>
              </div>
          </div>


            <div className="flex justify-start lg:justify-end">
              <NewCleaningDosageForm
                onSuccess={handleRefresh}
                trigger={
                  <Button className="w-full sm:w-auto">
                    <PlusIcon className="h-4 w-4" />
                    Registrar
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
        ) : cleaningDosageData.length === 0 ? (
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
                <TableHead className="text-center border font-bold" rowSpan={2}>
                  FECHA
                </TableHead>
                <TableHead className="text-center border font-bold" rowSpan={2}>
                  MATERIAL
                </TableHead>
                <TableHead className="text-center border font-bold" rowSpan={2}>
                  EQUIPO
                </TableHead>
                <TableHead className="text-center border font-bold" colSpan={4}>
                  DATOS SOBRE LA DESINFECCIÓN Y LIMPIEZA
                </TableHead>
                <TableHead className="text-center border font-bold" rowSpan={2}>
                  ACCIONES
                </TableHead>
              </TableRow>

              <TableRow>
                <TableHead className="text-center border font-bold">
                  <div className="flex items-center justify-center gap-2">
                    <FlaskConical className="h-4 w-4 text-white" />
                    <span>DOSIS</span>
                  </div>
                </TableHead>

                <TableHead className="text-center border font-bold">
                  <div className="flex items-center justify-center gap-2">
                    <Beaker className="h-4 w-4 text-white" />
                    <span>MÉTODO</span>
                  </div>
                </TableHead>

                <TableHead className="text-center border font-bold">
                  <div className="flex items-center justify-center gap-2">
                    <UserRound className="h-4 w-4 text-white" />
                    <span>RESPONSABLE</span>
                  </div>
                </TableHead>

                <TableHead className="text-center border font-bold">
                  <div className="flex items-center justify-center gap-2">
                    <AlertCircle className="h-4 w-4 text-white" />
                    <span>OBSERVACIÓN</span>
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {cleaningDosageData?.map((row, idx) => {
                const disabled =
                  format(fecha, "yyyy-MM-dd") !== format(today, "yyyy-MM-dd");

                return (
                  <TableRow key={idx}>
                    <TableCell className="text-center border">
                      {row.registrationDate}
                    </TableCell>

                    <TableCell className="text-center border">
                      <Badge variant="secondary" className="px-3 py-1">
                        {row.cleaningMaterial.name}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-center border">
                      <Badge variant="outline" className="px-3 py-1">
                        {row.equipment}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-center border">
                      <Badge variant="outline" className="px-3 py-1">
                        {row.dose}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-center border">
                      <Badge variant="secondary" className="px-3 py-1">
                        {row.cleaningMethod.name}
                      </Badge>
                    </TableCell>

                    <TableCell className="font-semibold text-center border">
                      {row.employee.person.fullName}
                    </TableCell>

                    <TableCell className="text-center border">
                      {row.observation ? (
                        <Badge
                          variant="outline"
                          className="px-3 py-1 max-w-[200px] truncate"
                        >
                          {row.observation}
                        </Badge>
                      ) : (
                        "-"
                      )}
                    </TableCell>

                    <TableCell className="text-center border">
                      <div className="flex items-center justify-center gap-2">
                        <Tooltip>
                          <NewCleaningDosageForm
                            onSuccess={handleRefresh}
                            isUpdate={true}
                            cleaningDosageData={row}
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

                        <ConfirmationDialog
                          title="¿Estás seguro de que deseas eliminar este registro?"
                          description="Esta acción no se puede deshacer. Esto eliminará permanentemente el registro de dosificación."
                          onConfirm={() => handleDelete(row.id)}
                          triggerBtn={
                            <Button
                              variant="outline"
                              size="icon"
                              disabled={disabled}
                              className={
                                disabled ? "opacity-50 cursor-not-allowed" : ""
                              }
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          }
                          cancelBtn={
                            <Button variant="outline" size="lg">
                              <XIcon className="h-4 w-4 mr-1" />
                              No
                            </Button>
                          }
                          confirmBtn={
                            <Button
                              variant="ghost"
                              className="hover:bg-red-600 hover:text-white"
                              size="lg"
                            >
                              <Check className="h-4 w-4 mr-1" />
                              Sí
                            </Button>
                          }
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}

export default CleaningDosageManagement;
