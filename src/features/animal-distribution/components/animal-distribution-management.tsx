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
  Check,
  PencilLine,
  CircleEllipsis,
  Calendar as CalendarIcon,
  Info,
  MoreVertical,
  ShoppingBag,
  Receipt,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { AnimalDistribution, PaginationMeta, Order } from "../domain/animal-distribution.types";
import { mapOrderToDistribution } from "../domain/animal-distribution.types";
import { getActiveLinesDataService } from "@/features/antemortem/server/db/antemortem.service";
import type { LineItem } from "@/features/antemortem/domain/line.types";
import { getPaginatedOrders } from "../server/db/animal-distribution.service";
import { ProductsModal } from "@/features/order-entry/components/products-modal";

export function AnimalDistributionManagement() {
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [selectedSpecie, setSelectedSpecie] = useState<string>("Bovino");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedDistribution, setSelectedDistribution] =
    useState<AnimalDistribution | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const certificateRef = useRef<HTMLDivElement>(null);
  
  // Estados para cargar especies desde la API
  const [availableLines, setAvailableLines] = useState<LineItem[]>([]);
  const [isLoadingLines, setIsLoadingLines] = useState(false);
  
  // Estado para controlar si el filtro de fecha está activo
  const [isDateFilterActive, setIsDateFilterActive] = useState(false);
  
  // Estados para los datos de distribuciones desde la API
  const [distributions, setDistributions] = useState<AnimalDistribution[]>([]);
  const [orders, setOrders] = useState<Order[]>([]); // Pedidos completos para acceder a detalles
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [isLoadingDistributions, setIsLoadingDistributions] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null); // Pedido seleccionado para el modal
  
  // Estados para el modal de productos
  const [isProductsModalOpen, setIsProductsModalOpen] = useState(false);
  const [selectedOrderForProducts, setSelectedOrderForProducts] = useState<Order | null>(null);
  const [productType, setProductType] = useState<"producto" | "subproducto">("producto");
  
  // Estados para modales de confirmación
  const [confirmAction, setConfirmAction] = useState<{
    isOpen: boolean;
    type: "approve" | "reject" | null;
    orderId: number | null;
    orderNumber: string;
  }>({
    isOpen: false,
    type: null,
    orderId: null,
    orderNumber: "",
  });
  const [isProcessing, setIsProcessing] = useState(false);

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

  // Función para cargar todas las especies disponibles
  const loadAvailableLines = async () => {
    try {
      setIsLoadingLines(true);
      const response = await getActiveLinesDataService();
      setAvailableLines(response);

      // Establecer la primera línea como especie activa si hay datos
      if (response.length > 0) {
        setSelectedSpecie(response[0].description);
      }
    } catch (error) {
      console.error('Error cargando especies disponibles:', error);
      setAvailableLines([]);
    } finally {
      setIsLoadingLines(false);
    }
  };

  // Función para cargar distribuciones desde la API
  const loadDistributions = async () => {
    try {
      setIsLoadingDistributions(true);
      setLoadError(null);
      
      // Encontrar el ID de la especie seleccionada
      const selectedLine = availableLines.find(line => line.description === selectedSpecie);
      const idSpecie = selectedLine?.idSpecie;
      
      const filters: any = {
        page: currentPage,
        limit: itemsPerPage,
      };
      
      // Agregar idSpecie si existe
      if (idSpecie) {
        filters.idSpecie = idSpecie;
      }
      
      // Solo agregar filtros de fecha si está activo
      if (isDateFilterActive) {
        filters.startDate = format(startDate, "yyyy-MM-dd");
        filters.endDate = format(endDate, "yyyy-MM-dd");
      }
      
      // Agregar término de búsqueda si existe
      if (searchTerm) {
        filters.searchTerm = searchTerm;
      }
      
      const response = await getPaginatedOrders(filters);
      
      if (response.code === 201 && response.data) {
        // Guardar los pedidos completos
        setOrders(response.data.items);
        // Mapear los pedidos al formato de distribuciones
        const mappedDistributions = response.data.items.map(mapOrderToDistribution);
        setDistributions(mappedDistributions);
        setMeta(response.data.meta);
      } else {
        setOrders([]);
        setDistributions([]);
        setMeta(null);
      }
    } catch (error) {
      console.error("Error loading distributions:", error);
      setLoadError("Error al cargar las distribuciones");
      setOrders([]);
      setDistributions([]);
      setMeta(null);
    } finally {
      setIsLoadingDistributions(false);
    }
  };
  
  // Efecto para cargar especies disponibles al montar el componente
  useEffect(() => {
    loadAvailableLines();
  }, []);
  
  // Efecto para cargar distribuciones cuando cambien los filtros
  useEffect(() => {
    // Solo cargar si ya tenemos las líneas disponibles
    if (availableLines.length > 0) {
      loadDistributions();
    }
  }, [currentPage, itemsPerPage, isDateFilterActive, startDate, endDate, searchTerm, selectedSpecie, availableLines]);

  // Los datos ahora vienen de la API (estado: distributions)

  // Los datos ya vienen filtrados de la API, solo mostramos lo que viene
  const filteredDistributions = distributions;

  // La paginación la maneja la API, solo mostramos los datos
  const paginatedDistributions = filteredDistributions;
  const totalPages = meta?.totalPages || 1;

  // Resetear a página 1 cuando cambie el filtro de búsqueda o el tamaño de página
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  // Resetear a página 1 cuando cambie el tamaño de página, las fechas o el filtro de fecha
  useEffect(() => {
    setCurrentPage(1);
  }, [itemsPerPage, startDate, endDate, isDateFilterActive]);

  // Función para aplicar el filtro de fecha
  const handleApplyDateFilter = () => {
    // Validar que la fecha fin no sea anterior a la fecha inicio
    if (endDate < startDate) {
      alert("La fecha fin no puede ser anterior a la fecha inicio");
      return;
    }
    setIsDateFilterActive(true);
  };

  // Función para limpiar el filtro de fecha
  const handleClearDateFilter = () => {
    setIsDateFilterActive(false);
  };

  // Función para establecer las fechas de hoy
  const handleTodayClick = () => {
    const today = new Date();
    setStartDate(today);
    setEndDate(today);
    setIsDateFilterActive(true); // Activar el filtro al seleccionar hoy
  };

  // Función para abrir modal de confirmación de aprobación
  const handleApproveOrderClick = (orderId: number, orderNumber: string) => {
    setConfirmAction({
      isOpen: true,
      type: "approve",
      orderId,
      orderNumber,
    });
  };

  // Función para abrir modal de confirmación de rechazo
  const handleRejectOrderClick = (orderId: number, orderNumber: string) => {
    setConfirmAction({
      isOpen: true,
      type: "reject",
      orderId,
      orderNumber,
    });
  };

  // Función para confirmar la acción (aprobar o rechazar)
  const handleConfirmAction = async () => {
    if (!confirmAction.orderId || !confirmAction.type) return;

    setIsProcessing(true);
    try {
      const { updateOrderStatus } = await import("../server/db/animal-distribution.service");
      const statusCode = confirmAction.type === "approve" ? "APR" : "REC";
      await updateOrderStatus(confirmAction.orderId, statusCode);
      
      // Mostrar toast de éxito
      const message = confirmAction.type === "approve" 
        ? "Orden aprobada exitosamente" 
        : "Orden rechazada exitosamente";
      toast.success(message);
      
      // Recargar las distribuciones
      loadDistributions();
      
      // Cerrar el modal
      setConfirmAction({
        isOpen: false,
        type: null,
        orderId: null,
        orderNumber: "",
      });
    } catch (error) {
      console.error("Error al cambiar el estado de la orden:", error);
      toast.error("Error al cambiar el estado de la orden");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-gray-800">
          DISTRIBUCIÓN DE ANIMALES
        </h1>
        <p className="text-sm text-gray-600">
          {isDateFilterActive ? (
            <>
              Mostrando distribuciones del{" "}
              <span className="font-semibold">{format(startDate, "dd/MM/yyyy")}</span>
              {" "}al{" "}
              <span className="font-semibold">{format(endDate, "dd/MM/yyyy")}</span>
            </>
          ) : (
            "Mostrando todas las distribuciones"
          )}
        </p>
      </div>

      {/* Filters Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-end">
            {/* Date Range Picker */}
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
                {!isDateFilterActive ? (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={handleApplyDateFilter}
                    className="bg-teal-600 hover:bg-teal-700 whitespace-nowrap"
                    title="Filtrar por este rango de fechas"
                  >
                    <CalendarIcon className="h-4 w-4 mr-1" />
                    Filtrar
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleTodayClick}
                      className="whitespace-nowrap"
                      title="Filtrar solo hoy"
                    >
                      <CalendarIcon className="h-4 w-4 mr-1" />
                      Hoy
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleClearDateFilter}
                      className="whitespace-nowrap text-gray-700"
                      title="Mostrar todas las fechas"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Limpiar filtro
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Species Buttons */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Especie:
              </label>
              <div className="flex gap-2 flex-wrap">
                {isLoadingLines ? (
                  <div className="text-sm text-gray-500">Cargando especies...</div>
                ) : availableLines.length > 0 ? (
                  availableLines.map((line) => (
                    <Button
                      key={line.id}
                      variant={selectedSpecie === line.description ? "default" : "outline"}
                      onClick={() => setSelectedSpecie(line.description)}
                      className={
                        selectedSpecie === line.description
                          ? "bg-teal-600 hover:bg-teal-700"
                          : ""
                      }
                    >
                      {line.description}
                    </Button>
                  ))
                ) : (
                  // Fallback a botones estáticos si no hay datos de la API
                  <>
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
                  </>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search, Actions and Table */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-sm text-gray-600">
                {filteredDistributions.length} registros
                {isDateFilterActive && (
                  <span className="text-teal-600 font-medium"> (filtrados por fecha)</span>
                )}
              </div>
              {/* Indicador de rango de fechas - solo visible si el filtro está activo */}
              {isDateFilterActive && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-50 border border-teal-200 rounded-md">
                  <CalendarIcon className="h-4 w-4 text-teal-600" />
                  <span className="text-sm font-medium text-teal-700">
                    {format(startDate, "dd/MM/yyyy")} - {format(endDate, "dd/MM/yyyy")}
                  </span>
                  {filteredDistributions.length > 0 && (
                    <span className="ml-1 px-2 py-0.5 bg-teal-600 text-white text-xs font-semibold rounded-full">
                      {filteredDistributions.length}
                    </span>
                  )}
                </div>
              )}
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
          {isLoadingDistributions ? (
            <div className="flex flex-col items-center justify-center py-12 px-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mb-4"></div>
              <p className="text-sm text-gray-500">Cargando distribuciones...</p>
            </div>
          ) : loadError ? (
            <div className="flex flex-col items-center justify-center py-12 px-4">
              <div className="bg-red-100 rounded-full p-4 mb-4">
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                Error al cargar distribuciones
              </h3>
              <p className="text-sm text-gray-500 text-center max-w-md mb-4">
                {loadError}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => loadDistributions()}
              >
                Reintentar
              </Button>
            </div>
          ) : filteredDistributions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4">
              <div className="bg-gray-100 rounded-full p-4 mb-4">
                <Info className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                No hay distribuciones registradas
              </h3>
              <p className="text-sm text-gray-500 text-center max-w-md">
                {isDateFilterActive ? (
                  <>
                    No se encontraron distribuciones entre el{" "}
                    <span className="font-medium text-gray-700">
                      {format(startDate, "dd/MM/yyyy")}
                    </span>
                    {" "}y el{" "}
                    <span className="font-medium text-gray-700">
                      {format(endDate, "dd/MM/yyyy")}
                    </span>
                  </>
                ) : (
                  "No se encontraron distribuciones"
                )}
                {searchTerm && (
                  <>
                    {" "}que coincidan con &quot;<span className="font-medium text-gray-700">{searchTerm}</span>&quot;
                  </>
                )}
              </p>
              <div className="flex gap-2 mt-4">
                {isDateFilterActive ? (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleTodayClick}
                    >
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      Ver distribuciones de hoy
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleClearDateFilter}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Ver todas las distribuciones
                    </Button>
                  </>
                ) : searchTerm && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSearchTerm("")}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Limpiar búsqueda
                  </Button>
                )}
              </div>
            </div>
          ) : (
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
                  <span className="text-xs leading-tight">Fecha de<br />PEDIDO</span>
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
                  <span className="text-xs leading-tight">Ingresos</span>
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
                    <span className="font-medium">{dist.nombreDestinatario}</span>
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
                        dist.estado === "PENDIENTE"
                          ? "bg-white text-orange-600 border border-orange-600 hover:bg-orange-600 hover:text-white hover:border-orange-700 flex items-center gap-1 justify-center mx-auto w-fit"
                          : dist.estado === "APROBADO"
                          ? "bg-primary hover:bg-green-600 flex items-center gap-1 justify-center mx-auto w-fit"
                          : dist.estado === "RECHAZADO"
                          ? "bg-white text-red-600 border border-red-600 hover:bg-red-600 hover:text-white hover:border-red-700 flex items-center gap-1 justify-center mx-auto w-fit"
                          : "bg-teal-600 hover:bg-teal-700 flex items-center gap-1 justify-center mx-auto w-fit"
                      }
                    >
                      {dist.estado === "PENDIENTE" ? (
                        <AlertCircle className="h-3 w-3" />
                      ) : dist.estado === "RECHAZADO" ? (
                        <X className="h-3 w-3" />
                      ) : (
                        <CheckCircle2 className="h-3 w-3" />
                      )}
                      {dist.estado}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center border">
                    <div className="flex justify-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-teal-600 hover:text-teal-700 hover:bg-teal-50"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel className="text-xs text-muted-foreground">
                            Opciones
                          </DropdownMenuLabel>
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedDistribution(dist);
                              // Encontrar el pedido completo correspondiente
                              const order = orders.find(o => o.id === dist.id);
                              setSelectedOrder(order || null);
                              setIsModalOpen(true);
                            }}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Ver Certificado
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              const order = orders.find(o => o.id === dist.id);
                              setSelectedOrderForProducts(order || null);
                              setIsProductsModalOpen(true);
                            }}
                          >
                            <ShoppingBag className="h-4 w-4 mr-2" />
                            Productos y Subproductos
                          </DropdownMenuItem>
                          
                          {/* Solo mostrar opciones de cambio de estado si el estado es PENDIENTE */}
                          {dist.estado === "PENDIENTE" && (
                            <>
                              <DropdownMenuSeparator />
                              
                              <DropdownMenuLabel className="text-xs text-muted-foreground">
                                Cambiar Estado
                              </DropdownMenuLabel>
                              
                              <DropdownMenuItem
                                onClick={() => handleApproveOrderClick(dist.id, dist.nroDistribucion)}
                                className="text-green-600 focus:text-green-600"
                              >
                                <Check className="h-4 w-4 mr-2" />
                                Aprobar
                              </DropdownMenuItem>
                              
                              <DropdownMenuItem
                                onClick={() => handleRejectOrderClick(dist.id, dist.nroDistribucion)}
                                className="text-red-600 focus:text-red-600"
                              >
                                <X className="h-4 w-4 mr-2" />
                                Rechazar
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
            </div>
          )}

          {/* Paginación */}
          {meta && meta.totalItems > 0 && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4">
              <div className="flex items-center gap-3">
                <div className="text-sm text-muted-foreground">
                  Mostrando {((currentPage - 1) * itemsPerPage) + 1} a{" "}
                  {Math.min(currentPage * itemsPerPage, meta.totalItems)} de{" "}
                  {meta.totalItems} registros
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
        <DialogContent className="max-w-none! w-[90vw] sm:w-[85vw] md:w-[90vw] max-h-[95vh] overflow-y-auto scrollbar-hide p-3 sm:p-4 md:p-6">
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
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedOrder?.orderDetails && selectedOrder.orderDetails.length > 0 ? (
                      selectedOrder.orderDetails.map((detail) => {
                        // Calcular el peso total desde animalWeighing
                        const totalWeight = detail.animalProduct?.detailsSpeciesCertificate?.animalWeighing
                          ?.reduce((sum, weighing) => sum + weighing.totalWeight, 0) || 0;
                        
                        return (
                          <TableRow key={detail.id}>
                            <TableCell className="text-center border py-2 px-1">
                              <div className="flex flex-col text-xs">
                                <span className="font-medium">
                                  {selectedSpecie} [{detail.animalProduct?.detailsSpeciesCertificate?.animalCode || '-'}]
                                </span>
                                <span className="text-muted-foreground">
                                  {detail.animalProduct?.detailsSpeciesCertificate?.detailCertificateBrands?.productiveStage?.name || '-'}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="text-center border py-2 px-1">
                              <div className="flex flex-col text-xs">
                                <span className="font-medium">
                                  {detail.animalProduct?.speciesProduct?.productName || '-'}
                                </span>
                                <span className="text-muted-foreground">
                                  {detail.animalProduct?.speciesProduct?.productCode || '-'}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="text-center border py-2 px-1">
                              <span className="text-xs font-medium">
                                {totalWeight > 0 ? `${totalWeight.toFixed(2)} LB` : '-'}
                              </span>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center border py-4">
                          <span className="text-sm text-muted-foreground">
                            No hay productos disponibles
                          </span>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de Productos y Subproductos */}
      {selectedOrderForProducts && (
        <ProductsModal
          isOpen={isProductsModalOpen}
          onClose={() => {
            setIsProductsModalOpen(false);
            setSelectedOrderForProducts(null);
            // Recargar distribuciones después de cerrar el modal
            loadDistributions();
          }}
          orderId={selectedOrderForProducts.id}
          specieId={availableLines.find(line => line.description === selectedSpecie)?.idSpecie || 0}
          productType={productType}
          onProductTypeChange={setProductType}
          readOnly={selectedOrderForProducts.orderStatus.name !== 'PENDIENTE'}
          orderStatus={selectedOrderForProducts.orderStatus.name}
          animalIds={
            // Extraer IDs únicos de animales de los orderDetails
            Array.from(
              new Set(
                selectedOrderForProducts.orderDetails
                  ?.map(d => d.animalProduct?.detailsSpeciesCertificate?.id)
                  .filter((id): id is number => id !== undefined && id !== null)
              )
            )
          }
        />
      )}

      {/* Modal de Confirmación para Aprobar/Rechazar */}
      <AlertDialog open={confirmAction.isOpen} onOpenChange={(open) => {
        if (!open && !isProcessing) {
          setConfirmAction({
            isOpen: false,
            type: null,
            orderId: null,
            orderNumber: "",
          });
        }
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              {confirmAction.type === "approve" ? (
                <>
                  <Check className="h-5 w-5 text-primary" />
                  Aprobar Orden
                </>
              ) : (
                <>
                  <X className="h-5 w-5 text-red-600" />
                  Rechazar Orden
                </>
              )}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction.type === "approve" ? (
                <p>
                  ¿Está seguro de que desea <span className="font-semibold text-primary">aprobar</span> la orden{" "}
                  <span className="font-semibold text-gray-900">{confirmAction.orderNumber}</span>?
                </p>
              ) : (
                <p>
                  ¿Está seguro de que desea <span className="font-semibold text-red-700">rechazar</span> la orden{" "}
                  <span className="font-semibold text-gray-900">{confirmAction.orderNumber}</span>?
                </p>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmAction}
              disabled={isProcessing}
              className={confirmAction.type === "approve" ? "bg-primary hover:bg-primary" : "bg-red-600 hover:bg-red-700"}
            >
              {isProcessing ? (
                <>
                  <CircleEllipsis className="h-4 w-4 mr-2 animate-spin" />
                  Procesando...
                </>
              ) : confirmAction.type === "approve" ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Sí, Aprobar
                </>
              ) : (
                <>
                  <X className="h-4 w-4 mr-2" />
                  Sí, Rechazar
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
