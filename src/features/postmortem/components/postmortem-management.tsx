"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CalendarIcon, Download, Settings } from "lucide-react";
import { format } from "date-fns";
import { useEffect, useRef } from "react";

export function PostmortemManagement() {
  return (
    <div className="space-y-4 p-4">
      <div className="text-center">
        <h1 className="text-xl font-semibold">
          Inspección Postmortem Agrocalidad (Decomisos)
        </h1>
        <p className="text-muted-foreground text-sm">
          Sistema de registro de decomisos por patologías
        </p>
      </div>

      {/* Filtros */}
      <Card className="p-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="flex items-center gap-3">
            <Label className="min-w-40">Fecha de Inspección</Label>
            <div className="relative w-[200px]">
              <CalendarIcon
                className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10 cursor-pointer"
                onClick={() => {
                  const input = document.getElementById(
                    "fecha-postmortem"
                  ) as HTMLInputElement;
                  if (input) input.showPicker();
                }}
              />
              <Input
                id="fecha-postmortem"
                type="date"
                className="w-full bg-white transition-colors focus:bg-white pl-8 [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-2 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                defaultValue={format(new Date(), "yyyy-MM-dd")}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  // Handle date change if needed
                }}
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Label className="min-w-40 inline-flex">Línea de Producción</Label>
            <Select defaultValue="ovinos">
              <SelectTrigger className="max-w-64">
                <SelectValue placeholder="Selecciona una línea" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ovinos">Línea de Ovinos</SelectItem>
                <SelectItem value="bovinos">Línea de Bovinos</SelectItem>
                <SelectItem value="caprinos">Línea de Caprinos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Acciones */}
      <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          size="sm"
          className=" text-teal-600 border-teal-600 bg-white hover:bg-teal-50"
        >
          <Settings className="h-4 w-4 mr-1" />
          Configuración de Reportes
        </Button>
        <Button
          variant="outline"
          size="sm"
          className=" text-teal-600 border-teal-600 bg-white hover:bg-teal-50"
        >
          <Download className="h-4 w-4 mr-1" />
          Generar Reportes
        </Button>
      </div>

      {/* Tabla de Decomisos */}
      <Card className="p-3">
        <div className="mb-2 flex items-center gap-2">
          <div className="i-lucide-clipboard-list text-muted-foreground" />
          <h2 className="text-sm font-medium">
            Registro de Decomisos por Patologías
          </h2>
        </div>

        <Table className="min-w-[1400px] border">
          {/* Fila principal de SUBPRODUCTOS Y PRODUCTOS */}
          <TableHeader className="sticky top-0 z-20 [&_th]:text-center">
            <TableRow>
              <TableHead rowSpan={3} className="min-w-60 bg-secondary align-middle sticky left-0 z-30">
                INTRODUCTOR
              </TableHead>
              <TableHead className="bg-blue-50 text-black font-medium" colSpan={18}>
                SUBPRODUCTOS
              </TableHead>
              <TableHead className="bg-blue-50 text-black font-medium" colSpan={2}>
                PRODUCTOS
              </TableHead>
            </TableRow>

            {/* Fila de grupos de patologías */}
            <TableRow>
              <TableHead className="bg-green-100 text-green-900" colSpan={7}>
                HÍGADO
              </TableHead>
              <TableHead className="bg-blue-100 text-blue-900" colSpan={5}>
                PULMÓN
              </TableHead>
              <TableHead className="bg-red-50 text-red-900" rowSpan={2}>
                Corazón
              </TableHead>
              <TableHead className="bg-red-50 text-red-900" rowSpan={2}>
                Intestino
              </TableHead>
              <TableHead className="bg-red-50 text-red-900" rowSpan={2}>
                Otros
              </TableHead>
              <TableHead className="bg-red-50 text-red-900" rowSpan={2}>
                Mastitis
              </TableHead>
              <TableHead className="bg-red-50 text-red-900" rowSpan={2}>
                Metritis
              </TableHead>
              <TableHead className="bg-red-50 text-red-900" rowSpan={2}>
                TOTAL
              </TableHead>
              <TableHead className="bg-indigo-50 text-indigo-900" rowSpan={2}>
                Decomiso Total
              </TableHead>
              <TableHead className="bg-indigo-50 text-indigo-900" rowSpan={2}>
                Decomiso Parcial
              </TableHead>
            </TableRow>

            {/* Fila de columnas individuales */}
            <TableRow>
              {/* Hígado */}
              <TableHead className="bg-green-50 text-center">
                Distomatosis
              </TableHead>
              <TableHead className="bg-green-50 text-center">
                Absceso Hep.
              </TableHead>
              <TableHead className="bg-green-50 text-center">
                Adherencias
              </TableHead>
              <TableHead className="bg-green-50 text-center">
                Triquinosis
              </TableHead>
              <TableHead className="bg-green-50 text-center">
                Cirrosis
              </TableHead>
              <TableHead className="bg-green-50 text-center">
                Esteatósis
              </TableHead>
              <TableHead className="bg-green-50 text-center">
                Fibrosis
              </TableHead>
              {/* Pulmón */}
              <TableHead className="bg-blue-50 text-center">
                Neumonía
              </TableHead>
              <TableHead className="bg-blue-50 text-center">Hemorragias</TableHead>
              <TableHead className="bg-blue-50 text-center">
                Enfisema
              </TableHead>
              <TableHead className="bg-blue-50 text-center">
                Hemorragias
              </TableHead>
              <TableHead className="bg-blue-50 text-center">Otros</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {/* Fila del selector de introductor */}
            <TableRow>
              <TableCell className="sticky left-0 z-20 bg-background">
                <Select>
                  <SelectTrigger className="h-8">
                    <SelectValue placeholder="Seleccionar introductor…" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Introductor #1</SelectItem>
                    <SelectItem value="2">Introductor #2</SelectItem>
                    <SelectItem value="3">Introductor #3</SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
              {Array(18)
                .fill(0)
                .map((_, i) => (
                  <TableCell key={i} className="text-center">
                    -
                  </TableCell>
                ))}
            </TableRow>

            {/* Filas de ejemplo */}
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell className="text-muted-foreground sticky left-0 z-20 bg-background">
                  Introductor #{i + 1}
                </TableCell>
                {/* Hígado (7) */}
                {Array.from({ length: 7 }).map((__, j) => (
                  <TableCell key={`h-${i}-${j}`}>-</TableCell>
                ))}
                {/* Pulmón (5) */}
                {Array.from({ length: 5 }).map((__, j) => (
                  <TableCell key={`p-${i}-${j}`}>-</TableCell>
                ))}
                {/* Rosados (6) */}
                {Array.from({ length: 6 }).map((__, j) => (
                  <TableCell key={`r-${i}-${j}`}>-</TableCell>
                ))}
                {/* Productos (2) */}
                <TableCell>-</TableCell>
                <TableCell>-</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
