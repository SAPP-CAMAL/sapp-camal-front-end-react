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
import { CalendarIcon, Download, Settings, ChevronDown } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
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

// Mock data para introductores
const introductores = [
  {
    id: "1",
    nombre: "Ganadería San José",
    marca: "SJ",
    certificado: "CERT-2024-001",
    animales: "5-10",
  },
  {
    id: "2",
    nombre: "Finca El Paraíso",
    marca: "EP",
    certificado: "CERT-2024-002",
    animales: "8-15",
  },
  {
    id: "3",
    nombre: "Ranch Los Alamos",
    marca: "LA",
    certificado: "CERT-2024-003",
    animales: "3-8",
  },
  {
    id: "4",
    nombre: "Hacienda Santa María",
    marca: "SM",
    certificado: "CERT-2024-004",
    animales: "10-20",
  },
  {
    id: "5",
    nombre: "Estancia La Esperanza",
    marca: "LE",
    certificado: "CERT-2024-005",
    animales: "6-12",
  },
];

type IntroductorRow = {
  id: string;
  introductor: (typeof introductores)[0] | null;
  values: number[];
};

export function PostmortemManagement() {
  const [rows, setRows] = useState<IntroductorRow[]>([
    { id: "row-1", introductor: introductores[0], values: Array(18).fill(0) },
    { id: "row-2", introductor: null, values: Array(18).fill(0) },
    { id: "row-3", introductor: null, values: Array(18).fill(0) },
    { id: "row-4", introductor: null, values: Array(18).fill(0) },
    { id: "row-5", introductor: null, values: Array(18).fill(0) },
  ]);

  const [openPopover, setOpenPopover] = useState<string | null>(null);

  const handleIntroductorSelect = (
    rowId: string,
    introductor: (typeof introductores)[0]
  ) => {
    setRows((prev) =>
      prev.map((row) => (row.id === rowId ? { ...row, introductor } : row))
    );
    setOpenPopover(null);
  };

  const handleValueChange = (rowId: string, index: number, value: string) => {
    const numValue = parseInt(value) || 0;
    setRows((prev) =>
      prev.map((row) =>
        row.id === rowId
          ? {
              ...row,
              values: row.values.map((v, i) => (i === index ? numValue : v)),
            }
          : row
      )
    );
  };

  const calculateTotal = (values: number[]) => {
    return values.reduce((sum, val) => sum + val, 0);
  };

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

      {/* Tabla de Decomisos */}
      <Card className="p-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="i-lucide-clipboard-list text-muted-foreground" />
            <h2 className="text-base font-medium">
              Registro de Decomisos por Patologías
            </h2>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="text-teal-600 border-teal-600 bg-white hover:bg-teal-50"
            >
              <Settings className="h-4 w-4 mr-1" />
              Configuración de Reportes
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-teal-600 border-teal-600 bg-white hover:bg-teal-50"
            >
              <Download className="h-4 w-4 mr-1" />
              Generar Reportes
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto border rounded-lg">
          <Table className="min-w-[1600px]">
            {/* Fila principal de SUBPRODUCTOS Y PRODUCTOS */}
            <TableHeader className="sticky top-0 z-20">
              <TableRow className="border-b-2">
                <TableHead
                  rowSpan={3}
                  className="min-w-[280px] bg-gray-100 align-middle sticky left-0 z-30 border-r-2 text-center font-bold text-gray-900"
                >
                  INTRODUCTOR
                </TableHead>
                <TableHead
                  className="bg-blue-100 text-gray-900 font-bold text-center border-r"
                  colSpan={13}
                >
                  SUBPRODUCTOS
                </TableHead>
                <TableHead
                  className="bg-purple-100 text-gray-900 font-bold text-center border-r"
                  colSpan={2}
                >
                  PRODUCTOS
                </TableHead>
                <TableHead
                  className="bg-orange-100 text-gray-900 font-bold text-center"
                  rowSpan={3}
                >
                  TOTAL
                </TableHead>
              </TableRow>

              {/* Fila de grupos de patologías */}
              <TableRow className="border-b">
                <TableHead
                  className="bg-green-100 text-gray-900 font-semibold text-center text-xs border-r"
                  colSpan={7}
                >
                  HÍGADO
                </TableHead>
                <TableHead
                  className="bg-blue-100 text-gray-900 font-semibold text-center text-xs border-r"
                  colSpan={6}
                >
                  PULMÓN
                </TableHead>
                <TableHead
                  className="bg-purple-100 text-gray-900 font-semibold text-center text-xs"
                  rowSpan={2}
                >
                  Decomiso Total
                </TableHead>
                <TableHead
                  className="bg-purple-100 text-gray-900 font-semibold text-center text-xs border-r"
                  rowSpan={2}
                >
                  Decomiso Parcial
                </TableHead>
              </TableRow>

              {/* Fila de columnas individuales */}
              <TableRow className="border-b-2">
                {/* Hígado */}
                <TableHead className="bg-green-50 text-gray-900 text-center text-xs font-medium">
                  Distomatosis
                </TableHead>
                <TableHead className="bg-green-50 text-gray-900 text-center text-xs font-medium">
                  Absceso Hep.
                </TableHead>
                <TableHead className="bg-green-50 text-gray-900 text-center text-xs font-medium">
                  Adherencia
                </TableHead>
                <TableHead className="bg-green-50 text-gray-900 text-center text-xs font-medium">
                  Telangiectasia
                </TableHead>
                <TableHead className="bg-green-50 text-gray-900 text-center text-xs font-medium">
                  Cirrosis
                </TableHead>
                <TableHead className="bg-green-50 text-gray-900 text-center text-xs font-medium">
                  Esteatósis
                </TableHead>
                <TableHead className="bg-green-50 text-gray-900 text-center text-xs font-medium border-r">
                  Fibrosis
                </TableHead>
                {/* Pulmón */}
                <TableHead className="bg-blue-50 text-gray-900 text-center text-xs font-medium">
                  Neumonía
                </TableHead>
                <TableHead className="bg-blue-50 text-gray-900 text-center text-xs font-medium">
                  Hemorragias
                </TableHead>
                <TableHead className="bg-blue-50 text-gray-900 text-center text-xs font-medium">
                  Enfisema
                </TableHead>
                <TableHead className="bg-blue-50 text-gray-900 text-center text-xs font-medium">
                  Edema
                </TableHead>
                <TableHead className="bg-blue-50 text-gray-900 text-center text-xs font-medium">
                  Corazón
                </TableHead>
                <TableHead className="bg-blue-50 text-gray-900 text-center text-xs font-medium border-r">
                  Intestino
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {rows.map((row) => {
                const total = calculateTotal(row.values);
                return (
                  <TableRow key={row.id} className="hover:bg-gray-50/50">
                    <TableCell className="sticky left-0 z-20 bg-background border-r-2 p-3">
                      {row.introductor ? (
                        <div className="space-y-1.5">
                          <div className="font-semibold text-base text-gray-900">
                            {row.introductor.nombre}
                          </div>
                          <div className="text-sm text-gray-600 space-y-0.5">
                            <div>Marca: {row.introductor.marca}</div>
                            <div>Cert: {row.introductor.certificado}</div>
                            <div>Animales: {row.introductor.animales}</div>
                          </div>
                          <Popover
                            open={openPopover === row.id}
                            onOpenChange={(open) =>
                              setOpenPopover(open ? row.id : null)
                            }
                          >
                            <PopoverTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-full justify-between text-xs mt-1 hover:bg-gray-100"
                              >
                                <span className="flex items-center gap-1">
                                  <ChevronDown className="h-3 w-3" />
                                </span>
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-[400px] p-0"
                              align="start"
                            >
                              <Command>
                                <CommandInput
                                  placeholder="Buscar por nombre o marca..."
                                  className="h-9"
                                />
                                <CommandList>
                                  <CommandEmpty>
                                    No se encontraron introductores.
                                  </CommandEmpty>
                                  <CommandGroup>
                                    {introductores.map((intro) => (
                                      <CommandItem
                                        key={intro.id}
                                        onSelect={() =>
                                          handleIntroductorSelect(row.id, intro)
                                        }
                                        className="flex flex-col items-start py-3"
                                      >
                                        <div className="font-medium">
                                          {intro.nombre}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                          Marca: {intro.marca} | Cert:{" "}
                                          {intro.certificado} | Animales:{" "}
                                          {intro.animales}
                                        </div>
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                                </CommandList>
                              </Command>
                            </PopoverContent>
                          </Popover>
                        </div>
                      ) : (
                        <div className="space-y-1.5">
                          <div className="text-sm text-gray-400">
                            Seleccionar introductor...
                          </div>
                          <div className="text-sm text-gray-400 space-y-0.5">
                            <div>Marca: --</div>
                            <div>Cert: --</div>
                            <div>Animales: --</div>
                          </div>
                          <Popover
                            open={openPopover === row.id}
                            onOpenChange={(open) =>
                              setOpenPopover(open ? row.id : null)
                            }
                          >
                            <PopoverTrigger asChild>
                              <Button
                                variant="ghost"
                                className="h-7 w-full justify-center hover:bg-gray-100"
                              >
                                <ChevronDown className="h-4 w-4" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-[400px] p-0"
                              align="start"
                            >
                              <Command>
                                <CommandInput
                                  placeholder="Buscar por nombre o marca..."
                                  className="h-9"
                                />
                                <CommandList>
                                  <CommandEmpty>
                                    No se encontraron introductores.
                                  </CommandEmpty>
                                  <CommandGroup>
                                    {introductores.map((intro) => (
                                      <CommandItem
                                        key={intro.id}
                                        onSelect={() =>
                                          handleIntroductorSelect(row.id, intro)
                                        }
                                        className="flex flex-col items-start py-3"
                                      >
                                        <div className="font-medium">
                                          {intro.nombre}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                          Marca: {intro.marca} | Cert:{" "}
                                          {intro.certificado} | Animales:{" "}
                                          {intro.animales}
                                        </div>
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                                </CommandList>
                              </Command>
                            </PopoverContent>
                          </Popover>
                        </div>
                      )}
                    </TableCell>

                    {/* Todas las columnas de datos (13 subproductos) */}
                    {row.values.slice(0, 13).map((value, i) => (
                      <TableCell key={`col-${i}`} className="p-1 text-center">
                        <Input
                          type="number"
                          min="0"
                          value={value || ""}
                          onChange={(e) =>
                            handleValueChange(row.id, i, e.target.value)
                          }
                          className="h-8 w-14 text-center border-gray-200 focus:border-blue-400 focus:ring-blue-400"
                          placeholder="-"
                        />
                      </TableCell>
                    ))}

                    {/* Productos (2) - Decomiso Total y Parcial */}
                    {row.values.slice(13, 15).map((value, i) => (
                      <TableCell key={`prod-${i}`} className="p-1 text-center">
                        <Input
                          type="number"
                          min="0"
                          value={value || ""}
                          onChange={(e) =>
                            handleValueChange(row.id, i + 13, e.target.value)
                          }
                          className="h-8 w-14 text-center border-gray-200 focus:border-purple-400 focus:ring-purple-400"
                          placeholder="-"
                        />
                      </TableCell>
                    ))}

                    {/* Total */}
                    <TableCell className="text-center font-bold text-base bg-orange-50 border-l-2">
                      {total > 0 ? total : "-"}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
