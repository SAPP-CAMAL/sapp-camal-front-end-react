"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  FileText,
  Eye,
  Truck,
  MapPin,
  PiggyBank,
  Hash,
  Clock,
  Package,
  CheckCircle2,
  AlertCircle,
  X,
  PencilLine,
  CircleEllipsis,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import type { AnimalDistribution } from "../domain/animal-distribution.types";

export function AnimalDistributionManagement() {
  const [date, setDate] = useState<Date>(new Date());
  const [selectedSpecie, setSelectedSpecie] = useState<string>("Bovino");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedDistribution, setSelectedDistribution] =
    useState<AnimalDistribution | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const certificateRef = useRef<HTMLDivElement>(null);

  const handleGeneratePDF = () => {
    if (!certificateRef.current) return;

    // Crear una nueva ventana con el contenido del certificado
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const content = certificateRef.current.innerHTML;
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Certificado de Distribución - ${selectedDistribution?.nroDistribucion}</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: system-ui, -apple-system, sans-serif;
              padding: 20px;
              background: white;
            }
            .space-y-1 > * + * {
              margin-top: 0.25rem;
            }
            .grid {
              display: grid;
            }
            .grid-cols-1 {
              grid-template-columns: repeat(1, minmax(0, 1fr));
            }
            .grid-cols-2 {
              grid-template-columns: repeat(2, minmax(0, 1fr));
            }
            .grid-cols-3 {
              grid-template-columns: repeat(3, minmax(0, 1fr));
            }
            .gap-2 {
              gap: 0.5rem;
            }
            .gap-3 {
              gap: 0.75rem;
            }
            .gap-4 {
              gap: 1rem;
            }
            .gap-6 {
              gap: 1.5rem;
            }
            .border {
              border: 1px solid #d1d5db;
            }
            .border-t-0 {
              border-top: 0;
            }
            .border-r {
              border-right: 1px solid #d1d5db;
            }
            .border-b {
              border-bottom: 1px solid #d1d5db;
            }
            .p-2 {
              padding: 0.5rem;
            }
            .p-3 {
              padding: 0.75rem;
            }
            .pr-4 {
              padding-right: 1rem;
            }
            .pb-2 {
              padding-bottom: 0.5rem;
            }
            .mb-1 {
              margin-bottom: 0.25rem;
            }
            .mb-2 {
              margin-bottom: 0.5rem;
            }
            .mt-2 {
              margin-top: 0.5rem;
            }
            .text-sm {
              font-size: 0.875rem;
              line-height: 1.25rem;
            }
            .text-xs {
              font-size: 0.75rem;
              line-height: 1rem;
            }
            .font-bold {
              font-weight: 700;
            }
            .font-semibold {
              font-weight: 600;
            }
            .font-medium {
              font-weight: 500;
            }
            .text-gray-600 {
              color: #4b5563;
            }
            .text-gray-700 {
              color: #374151;
            }
            .text-muted-foreground {
              color: #6b7280;
            }
            .text-center {
              text-align: center;
            }
            .text-right {
              text-align: right;
            }
            .uppercase {
              text-transform: uppercase;
            }
            .space-y-1 > * + * {
              margin-top: 0.25rem;
            }
            .space-y-2 > * + * {
              margin-top: 0.5rem;
            }
            .flex {
              display: flex;
            }
            .flex-col {
              flex-direction: column;
            }
            .items-center {
              align-items: center;
            }
            .gap-1 {
              gap: 0.25rem;
            }
            .leading-tight {
              line-height: 1.25;
            }
            table {
              width: 100%;
              border-collapse: collapse;
            }
            th, td {
              border: 1px solid #d1d5db;
              padding: 0.5rem;
              text-align: center;
            }
            th {
              background-color: #0d9488;
              color: white;
              font-weight: 700;
            }
            .bg-teal-600 {
              background-color: #0d9488;
            }
            .text-white {
              color: white;
            }
            @media print {
              body {
                padding: 0;
              }
              @page {
                margin: 1cm;
              }
            }
          </style>
        </head>
        <body>
          ${content}
          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `);
    
    printWindow.document.close();
  };

  // Datos de ejemplo
  const distributions = [
    {
      id: 4615,
      nroDistribucion: "4618",
      fechaDistribucion: "2025-07-08 09:39:35",
      nombreDestinatario: "MARIA NELY LIMA/Cód:109",
      lugarDestino: "MACAS Amazonas.Puestos: 120 -121",
      placaMedioTransporte: "ICM-0095/SEGUNDO MILLA",
      idsIngresos: "[23552]",
      estado: "REGISTRADO" as const,
    },
    {
      id: 4619,
      nroDistribucion: "4618",
      fechaDistribucion: "2025-07-08 09:39:35",
      nombreDestinatario: "MARIA NELY LIMA/Cód:109",
      lugarDestino: "MACAS Amazonas.Puestos: 120 -121",
      placaMedioTransporte: "ICM-0095/SEGUNDO MILLA",
      idsIngresos: "[23552]",
      estado: "REGISTRADO" as const,
    },
    {
      id: 4618,
      nroDistribucion: "4618",
      fechaDistribucion: "2025-07-08 09:39:35",
      nombreDestinatario: "MARIA NELY LIMA/Cód:109",
      lugarDestino: "MACAS Amazonas.Puestos: 120 -121",
      placaMedioTransporte: "ICM-0095/SEGUNDO MILLA",
      idsIngresos: "[23552]",
      estado: "REGISTRADO" as const,
    },
    {
      id: 4617,
      nroDistribucion: "4617",
      fechaDistribucion: "2025-07-07 12:53:12",
      nombreDestinatario: "ALEXANDER VASQUEZ/Cód:24",
      lugarDestino: "MACAS Amazonas. S. Ampliación E234",
      placaMedioTransporte: "IMA-1519/ESTEBAN ALIRIO",
      idsIngresos: "[23485]",
      estado: "ENTREGADO" as const,
    },
    {
      id: 4616,
      nroDistribucion: "4616",
      fechaDistribucion: "2025-07-07 12:53:12",
      nombreDestinatario: "ALEXANDER VASQUEZ/Cód:24",
      lugarDestino: "MACAS Amazonas. S. Ampliación E234",
      placaMedioTransporte: "IMA-1519/ESTEBAN ALIRIO",
      idsIngresos: "[23359]",
      estado: "ENTREGADO" as const,
    },
  ];

  const filteredDistributions = distributions.filter((dist) =>
    Object.values(dist).some((value) =>
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Calcular paginación
  const totalPages = Math.ceil(filteredDistributions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedDistributions = filteredDistributions.slice(
    startIndex,
    endIndex
  );

  // Resetear a página 1 cuando cambie el filtro de búsqueda o el tamaño de página
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  // Resetear a página 1 cuando cambie el tamaño de página
  useEffect(() => {
    setCurrentPage(1);
  }, [itemsPerPage]);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-gray-800">
          DISTRIBUCIÓN DE ANIMALES
        </h1>
        <p className="text-sm text-gray-600">
          Fecha de faenamiento:{" "}
          {format(date, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}
        </p>
      </div>

      {/* Filters Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            {/* Date Picker */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Fecha de faenamiento:
              </label>
              <DatePicker
                inputClassName="bg-secondary"
                selected={date}
                onChange={(newDate) => newDate && setDate(newDate)}
              />
            </div>

            {/* Species Buttons */}
            <div className="flex-1 space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Especie:
              </label>
              <div className="flex gap-2">
                <Button
                  variant={selectedSpecie === "Bovino" ? "default" : "outline"}
                  onClick={() => setSelectedSpecie("Bovino")}
                  className={
                    selectedSpecie === "Bovino"
                      ? "bg-teal-600 hover:bg-teal-700"
                      : ""
                  }
                >
                  Bovino
                </Button>
                <Button
                  variant={selectedSpecie === "Porcino" ? "default" : "outline"}
                  onClick={() => setSelectedSpecie("Porcino")}
                  className={
                    selectedSpecie === "Porcino"
                      ? "bg-teal-600 hover:bg-teal-700"
                      : ""
                  }
                >
                  Porcino
                </Button>
                <Button
                  variant={
                    selectedSpecie === "Ovino-Caprino" ? "default" : "outline"
                  }
                  onClick={() => setSelectedSpecie("Ovino-Caprino")}
                  className={
                    selectedSpecie === "Ovino-Caprino"
                      ? "bg-teal-600 hover:bg-teal-700"
                      : ""
                  }
                >
                  Ovino-Caprino
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search, Actions and Table */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="text-sm text-gray-600">
              {filteredDistributions.length} registros
            </div>

            <div className="flex gap-2 items-center flex-1 max-w-md">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                variant="outline"
                className="text-teal-600 border-teal-600 hover:bg-teal-50"
              >
                <FileText className="h-4 w-4 mr-2" />
                Reporte
              </Button>
            </div>
          </div>

          {/* Table */}
          <div className="relative overflow-auto border-2 rounded-lg">
        <Table>
          <TableHeader>
            <TableRow className="bg-teal-600 hover:bg-teal-600">
              <TableHead className="text-center border font-bold text-white py-3">
                <div className="flex flex-col items-center gap-1">
                  <Hash className="w-4 h-4" />
                  <span className="text-xs leading-tight">Nro<br />Distribución</span>
                </div>
              </TableHead>
              <TableHead className="text-center border font-bold text-white py-3">
                <div className="flex flex-col items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span className="text-xs leading-tight">Fecha de<br />Distribución</span>
                </div>
              </TableHead>
              <TableHead className="text-center border font-bold text-white py-3">
                <div className="flex flex-col items-center gap-1">
                  <PiggyBank className="w-4 h-4" />
                  <span className="text-xs leading-tight">Nombre de<br />destinatario</span>
                </div>
              </TableHead>
              <TableHead className="text-center border font-bold text-white py-3">
                <div className="flex flex-col items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span className="text-xs leading-tight">Lugar<br />destino</span>
                </div>
              </TableHead>
              <TableHead className="text-center border font-bold text-white py-3">
                <div className="flex flex-col items-center gap-1">
                  <Truck className="w-4 h-4" />
                  <span className="text-xs leading-tight">Placa del medio<br />de transporte</span>
                </div>
              </TableHead>
              <TableHead className="text-center border font-bold text-white py-3">
                <div className="flex flex-col items-center gap-1">
                  <Package className="w-4 h-4" />
                  <span className="text-xs leading-tight">Ids.<br />Ingresos</span>
                </div>
              </TableHead>
              <TableHead className="text-center border font-bold text-white py-3">
                <div className="flex flex-col items-center gap-1">
                <PencilLine className="w-4 h-4"/>
                <span className="text-xs">Estado</span>
                </div>
              </TableHead>
              <TableHead className="text-center border font-bold text-white py-3">
                <div className="flex flex-col items-center gap-1">
                <CircleEllipsis className= "w-4 h-4" />
                <span className="text-xs">Opción</span>
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedDistributions.map((dist) => {
              // Separar fecha y hora
              const [fecha, hora] = dist.fechaDistribucion.split(" ");
              
              // Separar nombre y código del destinatario
              const nombreParts = dist.nombreDestinatario.split("/");
              const nombre = nombreParts[0] || "";
              const codigo = nombreParts[1] || "";
              
              // Separar placa y conductor
              const placaParts = dist.placaMedioTransporte.split("/");
              const placa = placaParts[0] || "";
              const conductor = placaParts[1] || "";

              return (
                <TableRow key={dist.id}>
                  <TableCell className="font-medium text-center border">
                    {dist.nroDistribucion}
                  </TableCell>
                  <TableCell className="text-xs text-center border py-2">
                    <div className="flex flex-col">
                      <span className="font-medium">{hora}</span>
                      <span className="text-muted-foreground">{fecha}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-center border py-2">
                    <div className="flex flex-col">
                      <span className="font-medium">{nombre}</span>
                      <span className="text-muted-foreground">{codigo}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-center border py-2">
                    <div className="flex flex-col">
                      <span>{dist.lugarDestino.split(".")[0]}</span>
                      <span className="text-muted-foreground">
                        {dist.lugarDestino.split(".").slice(1).join(".")}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-center border py-2">
                    <div className="flex flex-col">
                      <span className="font-medium">{placa}</span>
                      <span className="text-muted-foreground">{conductor}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-center border">
                    {dist.idsIngresos}
                  </TableCell>
                  <TableCell className="text-center border">
                    <Badge
                    className={
                        dist.estado === "REGISTRADO"
                          ? "bg-white text-orange-600 border border-orange-600 hover:bg-orange-600 hover:text-white hover:border-orange-700 flex items-center gap-1 justify-center mx-auto w-fit"
                          : "bg-primary hover:bg-green-600 flex items-center gap-1 justify-center mx-auto w-fit"
                      }
                    >
                      {dist.estado === "REGISTRADO" ? (
                        <AlertCircle className="h-3 w-3" />
                      ) : (
                        <CheckCircle2 className="h-3 w-3" />
                      )}
                      {dist.estado}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center border">
                    <div className="flex justify-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-teal-600 hover:text-teal-700 hover:bg-teal-50"
                        onClick={() => {
                          setSelectedDistribution(dist);
                          setIsModalOpen(true);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
          </div>

          {/* Paginación */}
          {filteredDistributions.length > 0 && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4">
              <div className="flex items-center gap-3">
                <div className="text-sm text-muted-foreground">
                  Mostrando {startIndex + 1} a{" "}
                  {Math.min(endIndex, filteredDistributions.length)} de{" "}
                  {filteredDistributions.length} registros
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Mostrar:</span>
                  <Select
                    value={itemsPerPage.toString()}
                    onValueChange={(value) => setItemsPerPage(Number(value))}
                  >
                    <SelectTrigger className="w-20 h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5</SelectItem>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="25">25</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {totalPages > 1 && (
                <div className="flex items-center gap-x-2">
                <Button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((prev) => prev - 1)}
                  variant="outline"
                  size="sm"
                >
                  Anterior
                </Button>
                {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => {
                  const pageNumber = i + 1;
                  const isCurrentPage = pageNumber === currentPage;

                  // Mostrar primera página, última página, página actual y páginas alrededor
                  const showPage =
                    pageNumber === 1 ||
                    pageNumber === totalPages ||
                    Math.abs(pageNumber - currentPage) <= 2;

                  if (!showPage) return null;

                  return (
                    <Button
                      key={pageNumber}
                      variant="outline"
                      size="sm"
                      className={
                        isCurrentPage
                          ? "bg-teal-600 text-white hover:bg-teal-700 hover:text-white"
                          : ""
                      }
                      onClick={() => setCurrentPage(pageNumber)}
                    >
                      {pageNumber}
                    </Button>
                  );
                })}
                {totalPages > 10 && (
                  <span className="px-2 text-sm text-muted-foreground">
                    ... {totalPages}
                  </span>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((prev) => prev + 1)}
                >
                  Siguiente
                </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Detalles */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="!max-w-none w-[90vw] sm:w-[85vw] md:w-[90vw] max-h-[95vh] overflow-y-auto scrollbar-hide p-3 sm:p-4 md:p-6">
          <DialogHeader>
            <DialogTitle className="text-center text-sm sm:text-base md:text-lg font-bold text-gray-700 uppercase px-2 sm:px-4">
              CERTIFICACIÓN SANITARIA DE ORIGEN Y MOVILIZACIÓN DE CANALES Y
              SUBPRODUCTOS CÁRNICOS EN ESTADO PRIMARIO DESTINADOS A CONSUMO
              HUMANO
            </DialogTitle>
          </DialogHeader>

          {selectedDistribution && (
            <div ref={certificateRef} className="space-y-1 bg-white">
              {/* Información del Centro de Faenamiento */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-6 border border-gray-300 p-2 sm:p-3">
                <div className="border-r border-gray-300 pr-4">
                  <p className="text-sm font-bold text-gray-600 mb-1">
                    NOMBRE DEL CENTRO DE FAENAMIENTO :
                  </p>
                  <p className="text-sm font-semibold">
                    EMPRESA PÚBLICA MUNICIPAL DE FAENAMIENTO DEL CANTÓN IBARRA
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-600">
                      Nro. De CSOM: <span className="font-normal">001</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-600">
                      Código del Centro de Faenamiento:
                    </p>
                    <p className="text-sm font-semibold">10-045</p>
                  </div>
                </div>
              </div>

              {/* Hora y Fecha */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 border border-gray-300 border-t-0 p-2 sm:p-3">
                <div className="border-r border-gray-300 pr-4">
                  <p className="text-sm font-bold text-gray-600">HORA:</p>
                  <p className="text-sm font-semibold">
                    {selectedDistribution.fechaDistribucion.split(" ")[1]}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4 border-r border-gray-300 pr-4">
                  <div>
                    <p className="text-sm font-bold text-gray-600">
                      DÍA:{" "}
                      <span className="font-normal">
                        {selectedDistribution.fechaDistribucion
                          .split(" ")[0]
                          .split("-")[2]}
                      </span>
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-600">
                      MES:{" "}
                      <span className="font-normal">
                        {
                          [
                            "enero",
                            "febrero",
                            "marzo",
                            "abril",
                            "mayo",
                            "junio",
                            "julio",
                            "agosto",
                            "septiembre",
                            "octubre",
                            "noviembre",
                            "diciembre",
                          ][
                            parseInt(
                              selectedDistribution.fechaDistribucion
                                .split(" ")[0]
                                .split("-")[1]
                            ) - 1
                          ]
                        }
                      </span>
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-600">
                    AÑO:{" "}
                    <span className="font-normal">
                      {selectedDistribution.fechaDistribucion
                        .split(" ")[0]
                        .split("-")[0]}
                    </span>
                  </p>
                </div>
              </div>

              {/* Origen y Destino */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-6 border border-gray-300 border-t-0 p-2 sm:p-3">
                {/* ORIGEN */}
                <div className="space-y-2 border-r border-gray-300 pr-4">
                  <div className="border-b border-gray-300 pb-2">
                    <p className="text-sm font-bold text-gray-600">ORIGEN</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm">
                      <span className="font-bold text-gray-600">
                        PROVINCIA:
                      </span>{" "}
                      IMBABURA
                    </p>
                    <p className="text-sm">
                      <span className="font-bold text-gray-600">CANTÓN:</span>{" "}
                      IBARRA
                    </p>
                    <p className="text-sm">
                      <span className="font-bold text-gray-600">
                        PARROQUIA:
                      </span>{" "}
                      SAN MIGUEL DE IBARRA
                    </p>
                  </div>
                </div>

                {/* Información del Destinatario */}
                <div className="space-y-2">
                  <div>
                    <p className="text-sm font-bold text-gray-600 mb-1">
                      NOMBRE DEL DESTINATARIO
                    </p>
                    <p className="text-sm font-semibold">
                      {selectedDistribution.nombreDestinatario}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-600 mb-1">
                      LUGAR DE DESTINO
                    </p>
                    <p className="text-sm font-semibold">
                      {selectedDistribution.lugarDestino}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-600 mb-1">
                      PLACA DEL MEDIO DE TRANSPORTE
                    </p>
                    <p className="text-sm font-semibold">
                      {selectedDistribution.placaMedioTransporte}
                    </p>
                  </div>
                </div>
              </div>

              {/* DESTINO */}
              <div className="border border-gray-300 border-t-0 p-2 sm:p-3">
                <div className="border-b border-gray-300 pb-2 mb-2">
                  <p className="text-sm font-bold text-gray-600">DESTINO</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4">
                  <p className="text-sm">
                    <span className="font-bold text-gray-600">PROVINCIA:</span>{" "}
                    IMBABURA
                  </p>
                  <p className="text-sm">
                    <span className="font-bold text-gray-600">CANTÓN:</span>{" "}
                    IBARRA
                  </p>
                  <p className="text-sm">
                    <span className="font-bold text-gray-600">PARROQUIA:</span>{" "}
                    SAN FRANCISCO
                  </p>
                </div>
              </div>

              {/* Botón Generar Certificado */}
              <div className="flex justify-center pt-4 pb-3">
                <Button 
                  onClick={handleGeneratePDF}
                  className="bg-teal-600 hover:bg-teal-700 px-6 sm:px-8 text-sm sm:text-base"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Generar Certificado
                </Button>
              </div>

              {/* Tabla de Productos/Subproductos */}
              <div className="mt-2">
                <Table className="text-xs sm:text-sm">
                  <TableHeader>
                    <TableRow className="bg-teal-600 hover:bg-teal-600">
                      <TableHead className="text-center border font-bold text-white py-2 px-1">
                        <div className="flex flex-col items-center gap-1">
                          <PiggyBank className="w-4 h-4" />
                          <span className="text-xs leading-tight">ESPECIE/COD.<br />ANIMAL</span>
                        </div>
                      </TableHead>
                      <TableHead className="text-center border font-bold text-white py-2 px-1">
                        <div className="flex flex-col items-center gap-1">
                          <Package className="w-4 h-4" />
                          <span className="text-xs leading-tight">PRODUCTO/<br />SUBPRODUCTO</span>
                        </div>
                      </TableHead>
                      <TableHead className="text-center border font-bold text-white py-2 px-1">
                        <div className="flex flex-col items-center gap-1">
                          <Hash className="w-4 h-4" />
                          <span className="text-xs leading-tight">PESO DE TODA<br />LA CANAL</span>
                        </div>
                      </TableHead>
                      <TableHead className="text-center border font-bold text-white py-2 px-1">
                        <div className="flex flex-col items-center gap-1">
                          <Hash className="w-4 h-4" />
                          <span className="text-xs leading-tight">NRO.<br />Ingreso</span>
                        </div>
                      </TableHead>
                      <TableHead className="text-center border font-bold text-white py-2 px-1">
                        <div className="flex flex-col items-center gap-1">
                          <Eye className="w-4 h-4" />
                          <span className="text-xs leading-tight">Opción<br />(PRODUCTO)</span>
                        </div>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="text-center border py-2 px-1">
                        <div className="flex flex-col text-xs">
                          <span className="font-medium">PORCINO [103]</span>
                          <span className="text-muted-foreground">[02P-026] - CERDO LEVANTE DEPILADO</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center border py-2 px-1">
                        <span className="text-xs">Vísceras</span>
                      </TableCell>
                      <TableCell className="text-center border py-2 px-1">
                        <span className="text-xs">-</span>
                      </TableCell>
                      <TableCell className="text-center border py-2 px-1">
                        <span className="text-xs font-medium">23552</span>
                      </TableCell>
                      <TableCell className="text-center border py-2 px-1">
                        <span className="text-xs">-</span>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
