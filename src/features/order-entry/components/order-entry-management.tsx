"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Search,
  Trash2,
  FolderOpen,
  Hash,
  Calendar,
  User,
  PiggyBank,
  Edit,
  Package,
  Save,
  ShoppingBag,
  CheckSquare,
  Tag,
  ChevronRight,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { OrderEntry, ProductSubproduct } from "../domain/order-entry.types";

export function OrderEntryManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<OrderEntry | null>(null);
  const [products, setProducts] = useState<ProductSubproduct[]>([]);
  const [fechaFaenamiento, setFechaFaenamiento] = useState<Date>(new Date());
  const [selectedEspecie, setSelectedEspecie] = useState<string>("Bovino");
  const [selectedIntroductor, setSelectedIntroductor] = useState<string>("");
  const [introductorSearch, setIntroductorSearch] = useState("");
  const [checkedOrders, setCheckedOrders] = useState<Set<number>>(new Set());
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [productType, setProductType] = useState<"producto" | "subproducto">("producto");
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [currentAnimalId, setCurrentAnimalId] = useState<number | null>(null);

  // Datos de ejemplo
  const orders: OrderEntry[] = [
    {
      id: 27286,
      nroIngreso: "27286",
      codigo: "11",
      fechaIngreso: "2025-11-10 19:03:00",
      codDestinatario: "RICHARD MAURICIO ESCOBAR ESCOBAR",
      especie: "PORCINO",
      totalAnimales: 1,
    },
    {
      id: 27285,
      nroIngreso: "27285",
      codigo: "16",
      fechaIngreso: "2025-11-10 19:02:41",
      codDestinatario: "GISELE SOFIA GUEVARA RUANO",
      especie: "PORCINO",
      totalAnimales: 1,
    },
    {
      id: 27284,
      nroIngreso: "27284",
      codigo: "59",
      fechaIngreso: "2025-11-10 19:02:20",
      codDestinatario: "ZAYA ÑUSTA SEGOVIA CORDOVA",
      especie: "PORCINO",
      totalAnimales: 1,
    },
    {
      id: 27283,
      nroIngreso: "27283",
      codigo: "32",
      fechaIngreso: "2025-11-10 19:02:02",
      codDestinatario: "ANA LUCIA LOPEZ ENRIQUEZ",
      especie: "PORCINO",
      totalAnimales: 1,
    },
    {
      id: 27282,
      nroIngreso: "27282",
      codigo: "118",
      fechaIngreso: "2025-11-10 19:01:42",
      codDestinatario: "LENIN ERMINZUL GUARANGUAY BELTRAN",
      especie: "PORCINO",
      totalAnimales: 2,
    },
  ];

  const filteredOrders = orders.filter((order) =>
    Object.values(order).some((value) =>
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Calcular paginación
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedOrders = filteredOrders.slice(startIndex, endIndex);

  const handleSelectOrder = (order: OrderEntry) => {
    setSelectedOrder(order);
    // Datos de ejemplo para productos
    setProducts([
      {
        id: 1,
        especie: "PORCINO",
        codigoAnimal: "[11]-[02P-023] - CERDO LEVANTE",
        subproducto: "Vísceras",
        nroIngreso: order.nroIngreso,
      },
    ]);
  };

  const handleClearSelection = () => {
    setSelectedOrder(null);
    setProducts([]);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleRemoveProduct = (productId: number) => {
    setProducts(products.filter((p) => p.id !== productId));
  };

  const handleSave = () => {
    console.log("Guardando productos:", products);
    // Aquí iría la lógica para guardar
  };

  const handleCheckOrder = (orderId: number, checked: boolean) => {
    const newChecked = new Set(checkedOrders);
    if (checked) {
      newChecked.add(orderId);
    } else {
      newChecked.delete(orderId);
    }
    setCheckedOrders(newChecked);
  };

  const handleSelectIntroductor = (name: string) => {
    setSelectedIntroductor(name);
    setIntroductorSearch("");
  };

  const handleNext = () => {
    const selectedOrdersList = orders.filter((order) =>
      checkedOrders.has(order.id)
    );
    // Tomar la primera orden seleccionada como referencia
    if (selectedOrdersList.length > 0) {
      setSelectedOrder(selectedOrdersList[0]);
      // Generar productos de ejemplo para cada orden seleccionada
      const generatedProducts = selectedOrdersList.map((order, index) => ({
        id: index + 1,
        especie: order.especie,
        codigoAnimal: `[${order.codigo}]-[02P-023] - CERDO LEVANTE`,
        subproducto: "Vísceras",
        nroIngreso: order.nroIngreso,
      }));
      setProducts(generatedProducts);
    }
  };

  // Datos de ejemplo de introductores
  const introductores = [
    "JUAN PEREZ GOMEZ",
    "MARIA RODRIGUEZ LOPEZ",
    "CARLOS SANCHEZ MARTINEZ",
  ];

  const filteredIntroductores = introductores.filter((intro) =>
    intro.toLowerCase().includes(introductorSearch.toLowerCase())
  );

  // Opciones de productos y subproductos
  const productosOptions = ["Canal", "Media Canal", "Cuarta de Canal"];
  const subproductosOptions = [
"BAZO",
"CABEZA",
"CORAZÓN",
"HIGADO",
"INTESTINOS",
"LENGUA",
"LIBRILLO",
"PATAS A",
"PATAS B",
"PATAS C",
"PATAS D",
"PULMONE A",
"PULMONE B",
"RIÑONES",
"RUMEN",
"TESTÍCULOS",
"UBRE",
"PIELES",
  ];

  const currentOptions = productType === "producto" ? productosOptions : subproductosOptions;

  const handleOpenProductModal = () => {
    // Abrir con el primer animal seleccionado
    const firstOrderId = Array.from(checkedOrders)[0];
    if (firstOrderId) {
      setCurrentAnimalId(firstOrderId);
      setIsProductModalOpen(true);
    }
  };

  const handleSaveProductsForAnimal = () => {
    if (!currentAnimalId) return;
    
    const order = orders.find((o) => o.id === currentAnimalId);
    if (!order) return;
    
    // Crear productos solo para el animal actual
    const newProducts: ProductSubproduct[] = [];
    let productId = products.length + 1;

    selectedProducts.forEach((productName) => {
      newProducts.push({
        id: productId++,
        especie: order.especie,
        codigoAnimal: `[${order.codigo}]-[02P-023] - CERDO LEVANTE`,
        subproducto: productName,
        nroIngreso: order.nroIngreso,
      });
    });

    setProducts([...products, ...newProducts]);
    setSelectedProducts(new Set());
    
    // Pasar al siguiente animal o cerrar
    const ordersArray = Array.from(checkedOrders);
    const currentIndex = ordersArray.indexOf(currentAnimalId);
    
    if (currentIndex < ordersArray.length - 1) {
      // Hay más animales, pasar al siguiente
      setCurrentAnimalId(ordersArray[currentIndex + 1]);
    } else {
      // Era el último animal, cerrar modal
      setIsProductModalOpen(false);
      setCurrentAnimalId(null);
    }
  };

  const handleToggleProduct = (productName: string) => {
    const newSelected = new Set(selectedProducts);
    if (newSelected.has(productName)) {
      newSelected.delete(productName);
    } else {
      newSelected.add(productName);
    }
    setSelectedProducts(newSelected);
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-gray-800">AGREGAR INGRESO</h1>
      </div>

      {/* Card de Distribución - Solo se muestra cuando hay una orden seleccionada */}
      {selectedOrder && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-teal-600 text-white p-3 rounded">
                <Edit className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-semibold text-gray-700">
                Distribución de Productos y Subproductos
              </h2>
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearSelection}
                className="ml-auto"
              >
                Cambiar Selección
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div className="space-y-3">
                <div>
                  <span className="text-gray-600">Introductor: </span>
                  <span className="font-medium">{selectedIntroductor || "-"}</span>
                </div>
                <div>
                  <span className="text-gray-600">N° de Ingresos seleccionados: </span>
                  <span className="font-medium">{checkedOrders.size}</span>
                </div>
                <div>
                  <span className="text-gray-600">Fecha de ingreso: </span>
                  <span className="font-medium">
                    {format(new Date(selectedOrder.fechaIngreso), "dd/MM/yyyy HH:mm", {
                      locale: es,
                    })}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <span className="text-gray-600">Especie: </span>
                  <span className="font-medium">{selectedOrder.especie}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">Total: Restantes: </span>
                  <Badge className="bg-orange-500 hover:bg-orange-600">
                    {Array.from(checkedOrders).reduce((total, orderId) => {
                      const order = orders.find((o) => o.id === orderId);
                      return total + (order?.totalAnimales || 0);
                    }, 0)}
                  </Badge>
                </div>
                <div>
                  <span className="text-gray-600">Fecha de faenamiento: </span>
                  <span className="font-medium">
                    {format(fechaFaenamiento, "dd/MM/yyyy", { locale: es })}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Card de Productos y Subproductos - Solo se muestra cuando hay una orden seleccionada */}
      {selectedOrder && (
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-700">
                2.- Agregar productos y subproductos
              </h2>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="text-purple-600 border-purple-600 hover:bg-purple-50"
                  onClick={handleOpenProductModal}
                >
                  <ShoppingBag className="h-4 w-4 mr-2" />
                  PRODUCTOS O SUBPRODUCTOS
                </Button>
                {products.length > 0 && (
                  <Button
                    className="bg-teal-600 hover:bg-teal-700"
                    onClick={handleSave}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    GUARDAR
                  </Button>
                )}
              </div>
            </div>

            {/* Tabla de Productos */}
            <div className="relative overflow-auto border-2 rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow className="bg-teal-600 hover:bg-teal-600">
                    <TableHead className="text-center border font-bold text-white py-3">
                      <div className="flex flex-col items-center gap-1">
                        <PiggyBank className="w-4 h-4" />
                        <span className="text-xs">ESPECIE</span>
                      </div>
                    </TableHead>
                    <TableHead className="text-center border font-bold text-white py-3">
                      <div className="flex flex-col items-center gap-1">
                        <Package className="w-4 h-4" />
                        <span className="text-xs">SUBPRODUCTO</span>
                      </div>
                    </TableHead>
                    <TableHead className="text-center border font-bold text-white py-3">
                      <div className="flex flex-col items-center gap-1">
                        <Hash className="w-4 h-4" />
                        <span className="text-xs">N° DE INGRESO</span>
                      </div>
                    </TableHead>
                    <TableHead className="text-center border font-bold text-white py-3">
                      <div className="flex flex-col items-center gap-1">
                        <Trash2 className="w-4 h-4" />
                        <span className="text-xs">OPCIÓN</span>
                      </div>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                        No hay productos agregados
                      </TableCell>
                    </TableRow>
                  ) : (
                    products.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell className="text-sm text-center border">
                          <div className="flex flex-col">
                            <span className="font-medium">{product.especie}</span>
                            <span className="text-xs text-muted-foreground">
                              {product.codigoAnimal}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-center border">
                          {product.subproducto}
                        </TableCell>
                        <TableCell className="text-sm font-medium text-center border">
                          {product.nroIngreso}
                        </TableCell>
                        <TableCell className="text-center border">
                          <div className="flex justify-center">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleRemoveProduct(product.id)}
                            >
                              <Trash2 className="h-5 w-5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Card de Filtros - Solo se muestra cuando NO hay orden seleccionada */}
      {!selectedOrder && (
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              {/* Fecha de Faenamiento */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Fecha de faenamiento:
                </label>
                <DatePicker
                  inputClassName="bg-secondary"
                  selected={fechaFaenamiento}
                  onChange={(newDate) => newDate && setFechaFaenamiento(newDate)}
                />
              </div>

              {/* Introductor */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Destinario:
                </label>
                <div className="relative">
                  <Input
                    placeholder="Buscar introductor..."
                    value={introductorSearch}
                    onChange={(e) => setIntroductorSearch(e.target.value)}
                    className="bg-secondary"
                  />
                  {introductorSearch && filteredIntroductores.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-48 overflow-auto">
                      {filteredIntroductores.map((intro, index) => (
                        <div
                          key={index}
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                          onClick={() => handleSelectIntroductor(intro)}
                        >
                          {intro}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Especie */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Especie:
                </label>
                <div className="flex gap-2">
                  <Button
                    variant={selectedEspecie === "Bovino" ? "default" : "outline"}
                    onClick={() => setSelectedEspecie("Bovino")}
                    className={
                      selectedEspecie === "Bovino"
                        ? "bg-teal-600 hover:bg-teal-700"
                        : ""
                    }
                  >
                    Bovino
                  </Button>
                  <Button
                    variant={selectedEspecie === "Porcino" ? "default" : "outline"}
                    onClick={() => setSelectedEspecie("Porcino")}
                    className={
                      selectedEspecie === "Porcino"
                        ? "bg-teal-600 hover:bg-teal-700"
                        : ""
                    }
                  >
                    Porcino
                  </Button>
                  <Button
                    variant={
                      selectedEspecie === "Ovino-Caprino" ? "default" : "outline"
                    }
                    onClick={() => setSelectedEspecie("Ovino-Caprino")}
                    className={
                      selectedEspecie === "Ovino-Caprino"
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
      )}

      {/* Tabla - Solo se muestra cuando NO hay orden seleccionada */}
      {!selectedOrder && (
        <Card>
          <CardContent className="pt-6 space-y-4">
            {/* Mostrar introductor seleccionado */}
            {selectedIntroductor && (
              <div className="bg-teal-50 border border-teal-200 rounded-lg p-3">
                <p className="text-sm">
                  <span className="font-semibold text-gray-700">Destinatario seleccionado: </span>
                  <span className="text-teal-700 font-medium">{selectedIntroductor}</span>
                </p>
              </div>
            )}

            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="text-sm text-gray-600">
                {filteredOrders.length} registros
              </div>

              <div className="flex gap-2 items-center flex-1 max-w-md">
                <div className="relative flex-1">
                  <span className="text-sm text-gray-600 mr-2">Buscar:</span>
                  <Input
                    placeholder=""
                    value={searchTerm}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="inline-flex"
                  />
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  className="text-teal-600 border-teal-600 hover:bg-teal-50"
                >
                  <Search className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="text-red-600 border-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
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
                        <span className="text-xs">Código del animal </span>
                      </div>
                    </TableHead>
                    <TableHead className="text-center border font-bold text-white py-3">
                      <div className="flex flex-col items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span className="text-xs">Fecha de Ingreso</span>
                      </div>
                    </TableHead>
                    <TableHead className="text-center border font-bold text-white py-3">
                      <div className="flex flex-col items-center gap-1">
                        <User className="w-4 h-4" />
                        <span className="text-xs">Introductor</span>
                      </div>
                    </TableHead>
                    <TableHead className="text-center border font-bold text-white py-3">
                      <div className="flex flex-col items-center gap-1">
                        <Tag className="w-4 h-4" />
                        <span className="text-xs">Marca</span>
                      </div>
                    </TableHead>
                    <TableHead className="text-center border font-bold text-white py-3">
                      <div className="flex flex-col items-center gap-1">
                        <CheckSquare className="w-4 h-4" />
                        <span className="text-xs">Opción</span>
                      </div>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedOrders.map((order) => {
                    const [fecha, hora] = order.fechaIngreso.split(" ");

                    return (
                      <TableRow key={order.id}>
                        <TableCell className="text-center border">
                          {order.codigo}
                        </TableCell>
                        <TableCell className="text-xs text-center border py-2">
                          <div className="flex flex-col">
                            <span className="font-medium">{fecha}</span>
                            <span className="text-muted-foreground">{hora}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-center border">
                          {order.codDestinatario}
                        </TableCell>
                        <TableCell className="text-center border">
                          <div className="flex flex-col items-center gap-1">
                            <span className="text-sm font-medium">
                              {order.especie}:
                            </span>
                            <Badge className="bg-orange-500 hover:bg-orange-600">
                              de {order.totalAnimales}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="text-center border">
                          <div className="flex justify-center">
                            <Checkbox
                              checked={checkedOrders.has(order.id)}
                              onCheckedChange={(checked) =>
                                handleCheckOrder(order.id, checked as boolean)
                              }
                            />
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {/* Paginación */}
            {filteredOrders.length > 0 && (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4">
                <div className="flex items-center gap-3">
                  <div className="text-sm text-muted-foreground">
                    Mostrando {startIndex + 1} a{" "}
                    {Math.min(endIndex, filteredOrders.length)} de{" "}
                    {filteredOrders.length} registros
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

            {/* Botón Siguiente */}
            <div className="flex justify-center pt-4">
              <Button
                className="bg-teal-600 hover:bg-teal-700 px-8"
                disabled={checkedOrders.size === 0}
                onClick={handleNext}
              >
                Siguiente
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modal de Productos y Subproductos */}
      <Dialog open={isProductModalOpen} onOpenChange={setIsProductModalOpen}>
        <DialogContent className="!max-w-none w-[95vw] h-[90vh] max-h-[90vh] p-0 overflow-hidden flex flex-col">
          <DialogHeader className="px-6 pt-5 pb-3 border-b">
            <DialogTitle>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-base font-semibold">
                    Seleccionar Productos y Subproductos
                  </span>
                  <Badge variant="outline" className="bg-blue-500 text-white border-blue-500">
                    {checkedOrders.size} {checkedOrders.size === 1 ? "animal" : "animales"}
                  </Badge>
                </div>
              </div>
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-1 overflow-hidden">
            {/* Animal actual - Lado izquierdo */}
            <div className="w-64 border-r overflow-y-auto p-3 bg-muted/20">
              <div className="text-neutral-950 mb-2 font-semibold">
                Animal actual
              </div>
              <div className="text-xs text-muted-foreground mb-3">
                {Array.from(checkedOrders).indexOf(currentAnimalId!) + 1} de {checkedOrders.size}
              </div>
              {currentAnimalId && (() => {
                const order = orders.find((o) => o.id === currentAnimalId);
                if (!order) return null;
                return (
                  <div className="p-4 rounded-lg border-2 bg-white border-teal-500">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-bold text-blue-600 text-lg">
                        {order.codigo}
                      </span>
                      <Badge className="bg-orange-500">
                        {order.totalAnimales}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-700 font-medium mb-2">
                      {order.codDestinatario}
                    </div>
                    <div className="text-sm text-gray-600">
                      {order.especie}
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                      N° Ingreso: {order.nroIngreso}
                    </div>
                  </div>
                );
              })()}
              
              {/* Lista de todos los animales */}
              <div className="mt-4">
                <div className="text-xs font-semibold text-gray-600 mb-2">
                  Todos los animales:
                </div>
                <div className="space-y-1">
                  {Array.from(checkedOrders).map((orderId) => {
                    if (orderId === currentAnimalId) return null;
                    const order = orders.find((o) => o.id === orderId);
                    if (!order) return null;
                    
                    // Verificar si este animal ya tiene productos guardados
                    const hasProducts = products.some(p => p.nroIngreso === order.nroIngreso);
                    
                    return (
                      <div
                        key={orderId}
                        onClick={() => setCurrentAnimalId(orderId)}
                        className="p-2 rounded bg-gray-100 hover:bg-teal-100 text-xs cursor-pointer transition-colors border-2 border-transparent hover:border-teal-500"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-bold text-blue-600">
                              {order.codigo}
                            </span>
                            <span className="text-gray-500 ml-1">
                              - {order.especie}
                            </span>
                          </div>
                          {hasProducts && (
                            <Badge className="bg-green-500 text-xs">
                              ✓
                            </Badge>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Opciones de productos/subproductos - Lado derecho */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="max-w-5xl mx-auto space-y-6">
                {/* Filtro de Producto/Subproducto */}
                <div className="flex gap-2 justify-center">
                  <Button
                    variant={productType === "producto" ? "default" : "outline"}
                    onClick={() => setProductType("producto")}
                    className={
                      productType === "producto"
                        ? "bg-teal-600 hover:bg-teal-700"
                        : ""
                    }
                  >
                    Producto
                  </Button>
                  <Button
                    variant={productType === "subproducto" ? "default" : "outline"}
                    onClick={() => setProductType("subproducto")}
                    className={
                      productType === "subproducto"
                        ? "bg-teal-600 hover:bg-teal-700"
                        : ""
                    }
                  >
                    Subproducto
                  </Button>
                </div>

                {/* Lista de opciones con checkboxes */}
                <div className="border-2 rounded-lg p-6 bg-white">
                  <h3 className="font-semibold text-gray-700 mb-4 text-lg">
                    Seleccione {productType === "producto" ? "productos" : "subproductos"}:
                  </h3>
                  <div className="grid grid-cols-3 gap-3">
                    {currentOptions.map((option) => (
                      <div
                        key={option}
                        className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg border transition-colors"
                      >
                        <Checkbox
                          id={option}
                          checked={selectedProducts.has(option)}
                          onCheckedChange={() => handleToggleProduct(option)}
                          className="h-5 w-5"
                        />
                        <label
                          htmlFor={option}
                          className="text-base font-medium leading-none cursor-pointer flex-1"
                        >
                          {option}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Información adicional */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <strong>Nota:</strong> Seleccione los productos/subproductos para este animal. Después de guardar, pasará automáticamente al siguiente animal.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer con botones */}
          <div className="border-t px-6 py-4 bg-muted/20">
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsProductModalOpen(false);
                  setSelectedProducts(new Set());
                }}
              >
                Cancelar
              </Button>
              <Button
                className="bg-teal-600 hover:bg-teal-700"
                onClick={handleSaveProductsForAnimal}
                disabled={selectedProducts.size === 0}
              >
                <Save className="h-4 w-4 mr-2" />
                {Array.from(checkedOrders).indexOf(currentAnimalId!) < checkedOrders.size - 1
                  ? `Guardar y Siguiente (${selectedProducts.size})`
                  : `Guardar y Finalizar (${selectedProducts.size})`}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
