"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
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
  DialogDescription,
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
  Search,
  Trash2,
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
  Loader2,
  Weight,
  Info,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";
import type {
  OrderEntry,
  ProductSubproduct,
  AnimalStock,
  AnimalStockItem,
  StockByIdsRequest,
  ProductStockItem,
  SpecieProductConfig,
  OrderByIdAndDetailResponse,
} from "../domain/order-entry.types";
import { Step2AddresseeSelection } from "./step-2-addressee-selection";
import { AddresseeSummaryCard } from "./addressee-summary-card";
import { Step3CarrierSelection } from "./step-3-carrier-selection";
import { CarrierSummaryCard } from "./carrier-summary-card";
import { Addressees } from "@/features/addressees/domain";
import { Carrier } from "@/features/carriers/domain";
import { useAllSpecies } from "@/features/specie/hooks/use-all-species";
import { Specie } from "@/features/specie/domain";
import { useStockBySpecie, useStockByIds, useSaveOrder, useSpecieProductsByCode, useOrderByIdAndDetail, useRemoveOrderDetail } from "../hooks";

export function OrderEntryManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<OrderEntry | null>(null);
  const [products, setProducts] = useState<ProductSubproduct[]>([]);
  const [fechaFaenamiento, setFechaFaenamiento] = useState<Date>(new Date());
  const [selectedEspecieId, setSelectedEspecieId] = useState<number | null>(null);
  const [selectedIntroductor, setSelectedIntroductor] = useState<string>("");
  const [introductorSearch, setIntroductorSearch] = useState("");
  const [checkedOrders, setCheckedOrders] = useState<Set<number>>(new Set());
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [productType, setProductType] = useState<"producto" | "subproducto">(
    "producto"
  );
  const [selectedProducts, setSelectedProducts] = useState<Set<number>>(
    new Set()
  );
  const [currentAnimalId, setCurrentAnimalId] = useState<number | null>(null);
  const [step, setStep] = useState(1);
  const [selectedAddressee, setSelectedAddressee] = useState<Addressees | null>(
    null
  );
  const [selectedCarrier, setSelectedCarrier] = useState<Carrier | null>(null);
  const [savedOrderId, setSavedOrderId] = useState<number | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    productId: number | null;
    idAnimalProduct: number | null;
    productName: string;
  }>({
    isOpen: false,
    productId: null,
    idAnimalProduct: null,
    productName: "",
  });
  const [showFinalizeModal, setShowFinalizeModal] = useState(false);
  
  // Cache en memoria de las selecciones de productos por animal (no se guarda en BD)
  // Estructura: Map<animalId, Set<productStockId>>
  const [productSelectionsCache, setProductSelectionsCache] = useState<Map<number, Set<number>>>(new Map());

  const searchParams = useSearchParams();
  const urlOrderId = searchParams.get("id");
  // Usar el ID de la URL si existe, o el ID guardado después de crear la orden
  const orderId = urlOrderId ? Number(urlOrderId) : savedOrderId;

  // Hooks de API
  const saveOrderMutation = useSaveOrder();
  const removeOrderDetailMutation = useRemoveOrderDetail();
  
  // Consumir API de especies
  const speciesQuery = useAllSpecies();
  const species: Specie[] = (speciesQuery.data?.data as Specie[]) || [];

  const stockByIdsRequest: StockByIdsRequest | null = useMemo(() => {
    if (!isProductModalOpen || checkedOrders.size === 0) return null;
    
    return {
      productTypeCode: productType === "producto" ? "PRO" : "SUB",
      idDetailsSpeciesCertificate: Array.from(checkedOrders),
    };
  }, [isProductModalOpen, checkedOrders, productType]);

  // Consumir API de productos/subproductos por IDs
  const productsQuery = useStockByIds(stockByIdsRequest);
  const availableProducts = (productsQuery.data?.data || []) as unknown as ProductStockItem[];

  // Consumir API de stock por especie
  const stockQuery = useStockBySpecie(selectedEspecieId);
  const stockData = (stockQuery.data?.data || []) as unknown as AnimalStock[];

  // Consumir API de todos los productos configurados para la especie
  const allProductsQuery = useSpecieProductsByCode(
    selectedEspecieId, 
    productType === "producto" ? "PRO" : "SUB"
  );
  const allConfiguredProducts = (allProductsQuery.data?.data || []) as SpecieProductConfig[];

  // Consumir API de orden existente para obtener productos ya asignados a este animal
  // Solo se llama si hay un orderId (editando orden existente) y un animal seleccionado
  const existingOrderQuery = useOrderByIdAndDetail(orderId, currentAnimalId);
  const existingOrderData = existingOrderQuery.data?.data as OrderByIdAndDetailResponse | undefined;

  // Crear un Set de productCodes que están en la orden para este animal
  const assignedProductCodes = useMemo(() => {
    const codes = new Set<string>();
    if (existingOrderData?.orderDetails) {
      existingOrderData.orderDetails.forEach((detail) => {
        if (detail.animalProduct?.speciesProduct?.productCode) {
          codes.add(detail.animalProduct.speciesProduct.productCode);
        }
      });
    }
    return codes;
  }, [existingOrderData]);

  // Efecto para pre-seleccionar productos cuando cambia el animal
  useEffect(() => {
    if (!currentAnimalId) return;
    
    // Primero verificar si hay selecciones en cache para este animal
    const cachedSelections = productSelectionsCache.get(currentAnimalId);
    
    if (cachedSelections && cachedSelections.size > 0) {
      setSelectedProducts(new Set(cachedSelections));
      return;
    }
    
    // Si no hay cache, verificar si hay datos de la orden existente
    if (existingOrderData?.orderDetails) {
      const productIds = new Set<number>();
      existingOrderData.orderDetails.forEach((detail) => {
        // Buscar el producto en availableProducts que coincida con el productCode
        if (detail.animalProduct?.speciesProduct?.productCode) {
          const matchingProduct = availableProducts.find(
            (p) => p.speciesProduct.productCode === detail.animalProduct?.speciesProduct?.productCode
          );
          if (matchingProduct) {
            productIds.add(matchingProduct.id);
          }
        }
      });
      setSelectedProducts(productIds);
    } else if (!existingOrderQuery.isLoading) {
        // Si no hay datos (y no está cargando), limpiamos la selección
        setSelectedProducts(new Set());
    }
  }, [existingOrderData, existingOrderQuery.isLoading, currentAnimalId, availableProducts, productSelectionsCache]);

  // Aplanar el array de animales (cada elemento tiene un array animal[])
  const animalStock: AnimalStockItem[] = stockData.flatMap((item) => item.animal || []);

  // Filtrar animales por búsqueda y por introductor seleccionado
  const filteredOrders = animalStock.filter((animal) => {
    // Filtro por introductor seleccionado
    if (selectedIntroductor && animal.introducer !== selectedIntroductor) {
      return false;
    }
    
    // Filtro por término de búsqueda
    if (searchTerm) {
      return Object.values(animal).some((value) =>
        value.toString().toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return true;
  });

  // Calcular paginación
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedOrders = filteredOrders.slice(startIndex, endIndex);

  const handleSelectOrder = (order: OrderEntry) => {
    setSelectedOrder(order);
    // Los productos se agregarán desde el modal
    setProducts([]);
  };

  const handleClearSelection = () => {
    setSelectedOrder(null);
    setProducts([]);
    setStep(1);
    setSelectedAddressee(null);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleRemoveProductClick = (productId: number, idAnimalProduct: number) => {
    // Encontrar el producto para mostrar su nombre en el modal
    const product = products.find((p) => p.id === productId);
    
    setDeleteConfirmation({
      isOpen: true,
      productId,
      idAnimalProduct,
      productName: product?.subproducto || "este producto",
    });
  };

  const handleConfirmRemoveProduct = async () => {
    const { productId, idAnimalProduct } = deleteConfirmation;
    
    if (!productId || !idAnimalProduct) return;
    
    console.log("ID Animal Product:", idAnimalProduct);
    
    // Llamar a la API para eliminar el producto
    try {
      await removeOrderDetailMutation.mutateAsync(idAnimalProduct);
      
      // Encontrar el producto que se va a eliminar para obtener su nroIngreso (animalId)
      const productToRemove = products.find((p) => p.id === productId);
      
      if (productToRemove) {
        const animalId = parseInt(productToRemove.nroIngreso);
        
        // Actualizar el cache de selecciones para este animal
        const newCache = new Map(productSelectionsCache);
        const animalSelections = newCache.get(animalId);
        
        if (animalSelections) {
          // Remover el producto del cache
          animalSelections.delete(productId);
          
          // Si no quedan productos seleccionados, eliminar la entrada del cache
          if (animalSelections.size === 0) {
            newCache.delete(animalId);
          } else {
            newCache.set(animalId, animalSelections);
          }
          
          setProductSelectionsCache(newCache);
        }
      }
      
      // Remover el producto de la lista
      setProducts(products.filter((p) => p.id !== productId));
      
      // Cerrar el modal
      setDeleteConfirmation({
        isOpen: false,
        productId: null,
        idAnimalProduct: null,
        productName: "",
      });
    } catch (error) {
      // El error ya se maneja en el hook
    }
  };

  const handleSave = () => {
    if (!selectedAddressee || !selectedCarrier || products.length === 0) {
      toast.error("Faltan datos requeridos para guardar la orden");
      return;
    }

    const orderData = {
      idAddressee: selectedAddressee.id,
      idShipping: selectedCarrier.id,
      status: true,
      orderDetails: products.map((product) => ({
        idAnimalProduct: product.id,
      })),
    };

    saveOrderMutation.mutate(orderData, {
      onSuccess: () => {
        // Limpiar formulario después de guardar y cerrar modal
        setProducts([]);
        setSelectedOrder(null);
        setStep(1);
        setSelectedAddressee(null);
        setSelectedCarrier(null);
        setCheckedOrders(new Set());
        setIsProductModalOpen(false);
      },
    });
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
    const selectedAnimalsList = animalStock.filter((animal) =>
      checkedOrders.has(animal.id)
    );
    // Tomar el primer animal seleccionado como referencia
    if (selectedAnimalsList.length > 0) {
      const firstAnimal = selectedAnimalsList[0];
      const selectedSpecieName = species.find((s) => s.id === selectedEspecieId)?.name || "";
      
      // Crear un OrderEntry temporal para mantener compatibilidad
      setSelectedOrder({
        id: 0, // ID 0 indica que es una nueva orden (no persistida). Evita enviar el ID del animal como ID de orden.
        nroIngreso: firstAnimal.id.toString(),
        codigo: firstAnimal.code,
        fechaIngreso: firstAnimal.createAt,
        codDestinatario: firstAnimal.introducer,
        especie: selectedSpecieName,
        totalAnimales: selectedAnimalsList.length,
      });
      
      // Si no hay introductor seleccionado, usar el introductor del primer animal
      if (!selectedIntroductor && firstAnimal.introducer) {
        setSelectedIntroductor(firstAnimal.introducer);
      }
      
      setStep(2); // Move to Step 2 (Addressee Selection)
    }
  };

  const handleAddresseeSelect = (addressee: Addressees) => {
    setSelectedAddressee(addressee);
    setStep(3); // Move to Step 3 (Carrier Selection)
  };

  const handleBackToStep2 = () => {
    setStep(2);
    setSelectedAddressee(null);
  };

  const handleCarrierSelect = (carrier: Carrier) => {
    setSelectedCarrier(carrier);
    setStep(4); // Move to Step 4 (Product Distribution)
  };

  const handleBackToStep3 = () => {
    setStep(3);
    setSelectedCarrier(null);
  };

  // Obtener lista única de introductores de los animales cargados
  const introductores = useMemo(() => {
    const uniqueIntroducers = new Set<string>();
    animalStock.forEach((animal) => {
      if (animal.introducer) {
        uniqueIntroducers.add(animal.introducer);
      }
    });
    return Array.from(uniqueIntroducers).sort();
  }, [animalStock]);

  const filteredIntroductores = useMemo(() => {
    if (!introductorSearch) return [];
    return introductores.filter((intro) =>
      intro.toLowerCase().includes(introductorSearch.toLowerCase())
    );
  }, [introductores, introductorSearch]);

  // Agrupar productos por animal y ordenar por displayOrder
  const groupedProducts = useMemo(() => {
    const grouped = new Map<number, ProductStockItem[]>();
    
    availableProducts.forEach((product) => {
      const animalId = product.idDetailsSpeciesCertificate;
      if (!grouped.has(animalId)) {
        grouped.set(animalId, []);
      }
      grouped.get(animalId)!.push(product);
    });
    
    // Ordenar productos dentro de cada grupo por displayOrder
    grouped.forEach((products) => {
      products.sort((a, b) => a.speciesProduct.displayOrder - b.speciesProduct.displayOrder);
    });
    
    return grouped;
  }, [availableProducts]);

  // Obtener productos del animal actual
  const currentAnimalProducts = useMemo(() => {
    if (!currentAnimalId) return [];
    return groupedProducts.get(currentAnimalId) || [];
  }, [currentAnimalId, groupedProducts]);

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

    const animal = animalStock.find((a) => a.id === currentAnimalId);
    if (!animal) return;

    if (selectedProducts.size === 0) {
      toast.error("Debe seleccionar al menos un producto");
      return;
    }

    const selectedSpecieName = species.find((s) => s.id === selectedEspecieId)?.name || "";

    // Crear productos solo para el animal actual usando los datos de la API
    const newProducts: ProductSubproduct[] = [];

    selectedProducts.forEach((productStockId) => {
      const productStock = availableProducts.find((p) => p.id === productStockId);
      if (productStock) {
        newProducts.push({
          id: productStock.id, // Usar el id real del producto de la API
          idAnimalProduct: productStock.id, // ID del producto animal
          especie: selectedSpecieName,
          codigoAnimal: `[${animal.code}] - ${animal.brandName}`,
          subproducto: productStock.speciesProduct.productName,
          nroIngreso: animal.id.toString(),
        });
      }
    });

    // Agregar productos a la lista para mostrar en la tabla
    const updatedProducts = [...products, ...newProducts];
    setProducts(updatedProducts);

    // Guardar la selección en cache (para mantener los checks)
    const newCache = new Map(productSelectionsCache);
    newCache.set(currentAnimalId, new Set(selectedProducts));
    setProductSelectionsCache(newCache);

    // Preparar datos para guardar en BD
    if (!selectedAddressee || !selectedCarrier) {
      toast.error("Faltan datos requeridos para guardar");
      return;
    }

    const orderData = {
      idAddressee: selectedAddressee.id,
      idShipping: selectedCarrier.id,
      status: true,
      orderDetails: updatedProducts.map((product) => ({
        idAnimalProduct: product.id,
      })),
    };

    // Guardar en BD
    saveOrderMutation.mutate(orderData, {
      onSuccess: (response) => {
        // Guardar el orderId de la respuesta para usarlo en las siguientes llamadas
        if (response && typeof response === 'object' && 'data' in response) {
          const data = response.data as any;
          if (data?.id && !savedOrderId) {
            setSavedOrderId(data.id);
          }
        }
        
        // Limpiar selección actual (pero mantener en cache)
        setSelectedProducts(new Set());
        
        // Pasar al siguiente animal si hay más
        const animalsArray = Array.from(checkedOrders);
        const currentIndex = animalsArray.indexOf(currentAnimalId);

        if (currentIndex < animalsArray.length - 1) {
          // Hay más animales, pasar al siguiente
          setCurrentAnimalId(animalsArray[currentIndex + 1]);
        } else {
          // Era el último animal, cerrar modal
          setIsProductModalOpen(false);
          setCurrentAnimalId(null);
        }
      },
      onError: () => {
        // En caso de error, no limpiar la selección para que el usuario pueda reintentar
        toast.error("Error al guardar los productos");
      },
    });
  };

  const handleToggleProduct = (productId: number) => {
    const newSelected = new Set(selectedProducts);
    if (newSelected.has(productId)) {
      newSelected.delete(productId);
    } else {
      newSelected.add(productId);
    }
    setSelectedProducts(newSelected);
    
    // Guardar en cache para este animal
    if (currentAnimalId) {
      const newCache = new Map(productSelectionsCache);
      newCache.set(currentAnimalId, newSelected);
      setProductSelectionsCache(newCache);
    }
  };

  // Función para abrir el modal de finalización
  const handleFinalizeClick = () => {
    if (savedOrderId) {
      setShowFinalizeModal(true);
    } else {
      toast.error("No hay orden guardada para finalizar");
    }
  };

  // Función para confirmar la finalización del pedido
  const handleConfirmFinalize = () => {
    toast.success("Pedido completado exitosamente");
    
    // Limpiar todo y volver al paso 1
    setProducts([]);
    setSelectedOrder(null);
    setStep(1);
    setSelectedAddressee(null);
    setSelectedCarrier(null);
    setCheckedOrders(new Set());
    setIsProductModalOpen(false);
    setCurrentAnimalId(null);
    setSavedOrderId(null);
    setProductSelectionsCache(new Map());
    setSelectedProducts(new Set());
    setSelectedEspecieId(null);
    setSelectedIntroductor("");
    setIntroductorSearch("");
    setShowFinalizeModal(false);
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-gray-800">AGREGAR INGRESO</h1>
      </div>

      {/* Card de Distribución (Resumen Paso 1) - Se muestra en pasos 2 y 3 */}
      {step >= 2 && selectedOrder && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-teal-600 text-white p-3 rounded">
                <Edit className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-semibold text-gray-700">
                Resumen de Ingreso
              </h2>
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearSelection}
                className="ml-auto text-teal-600 hover:text-teal-700 hover:bg-teal-100"
              >
                <Edit className="h-4 w-4 mr-2" />
                Cambiar
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div className="space-y-3">
                <div>
                  <span className="text-gray-600">
                    N° de Ingresos seleccionados:{" "}
                  </span>
                  <span className="font-medium">{checkedOrders.size}</span>
                </div>
                <div>
                  <span className="text-gray-600">Peso Total: </span>
                  <span className="font-medium">
                    {animalStock
                      .filter((animal) => checkedOrders.has(animal.id))
                      .reduce((total, animal) => total + (animal.netWeight || 0), 0)
                      .toFixed(2)} kg
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <span className="text-gray-600">Especie: </span>
                  <span className="font-medium">
                    {species.find((s) => s.id === selectedEspecieId)?.name || selectedOrder.especie}
                  </span>
                </div>
                {/* <div>
                  <span className="text-gray-600">Fecha de faenamiento: </span>
                  <span className="font-medium">
                    {format(fechaFaenamiento, "dd/MM/yyyy", { locale: es })}
                  </span>
                </div> */}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Paso 2: Selección de Destinatario */}
      {step === 2 && (
        <Step2AddresseeSelection
          onSelect={handleAddresseeSelect}
          onBack={() => setStep(1)}
        />
      )}

      {/* Resumen Paso 2: Destinatario Seleccionado - Se muestra en pasos 3 y 4 */}
      {step >= 3 && selectedAddressee && (
        <AddresseeSummaryCard
          addressee={selectedAddressee}
          onEdit={handleBackToStep2}
        />
      )}

      {/* Paso 3: Selección de Transportista */}
      {step === 3 && (
        <Step3CarrierSelection
          onSelect={handleCarrierSelect}
          onBack={() => setStep(2)}
          filterByStatus={true}
        />
      )}

      {/* Resumen Paso 3: Transportista Seleccionado - Se muestra en paso 4 */}
      {step >= 4 && selectedCarrier && (
        <CarrierSummaryCard
          carrier={selectedCarrier}
          onEdit={handleBackToStep3}
        />
      )}

      {/* Paso 4: Productos y Subproductos */}
      {step === 4 && selectedOrder && (
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-700">
                4.- Agregar productos y subproductos
              </h2>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="text-purple-600 border-purple-600 hover:bg-purple-50"
                  onClick={handleOpenProductModal}
                  disabled={checkedOrders.size === 0}
                >
                  <ShoppingBag className="h-4 w-4 mr-2" />
                  PRODUCTOS O SUBPRODUCTOS
                </Button>
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
                      <TableCell colSpan={4} className="text-center py-16">
                        <div className="flex flex-col items-center justify-center">
                          <ShoppingBag className="h-16 w-16 text-gray-400 mb-4" />
                          <h3 className="text-lg font-semibold text-gray-700 mb-2">
                            No hay productos agregados
                          </h3>
                          <p className="text-sm text-gray-500 text-center max-w-md">
                            Haga clic en el botón "PRODUCTOS O SUBPRODUCTOS" para agregar productos a esta orden
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    products.map((product, index) => (
                      <TableRow key={`${product.id}-${product.nroIngreso}-${index}`} className="hover:bg-gray-50/50 transition-colors">
                        <TableCell className="text-sm text-center border">
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {product.especie}
                            </span>
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
                              onClick={() => handleRemoveProductClick(product.id, product.idAnimalProduct)}
                              disabled={removeOrderDetailMutation.isPending && deleteConfirmation.productId === product.id}
                            >
                              {removeOrderDetailMutation.isPending && deleteConfirmation.productId === product.id ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                              ) : (
                                <Trash2 className="h-5 w-5" />
                              )}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Botón Finalizar - Solo se muestra si hay productos */}
            {products.length > 0 && (
              <div className="flex justify-center pt-6">
                <Button
                  className="bg-primary hover:bg-primary-700 px-12 py-6 text-lg"
                  onClick={handleFinalizeClick}
                  disabled={saveOrderMutation.isPending}
                >
                  {saveOrderMutation.isPending ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      FINALIZANDO...
                    </>
                  ) : (
                    <>
                      <CheckSquare className="h-5 w-5 mr-2" />
                      FINALIZAR PEDIDO
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Card de Filtros - Solo se muestra en el Paso 1 */}
      {step === 1 && (
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
              {/* Fecha de Faenamiento */}
              {/* <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Fecha de faenamiento:
                </label>
                <DatePicker
                  inputClassName="bg-secondary"
                  selected={fechaFaenamiento}
                  onChange={(newDate) =>
                    newDate && setFechaFaenamiento(newDate)
                  }
                />
              </div> */}

              {/* Introductor */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Introductor:
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
                <Select
                  value={selectedEspecieId?.toString() || ""}
                  onValueChange={(value) => setSelectedEspecieId(Number(value))}
                >
                  <SelectTrigger className="bg-secondary">
                    <SelectValue placeholder="Seleccione una especie" />
                  </SelectTrigger>
                  <SelectContent>
                    {species.map((specie) => (
                      <SelectItem key={specie.id} value={specie.id.toString()}>
                        {specie.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabla - Solo se muestra en el Paso 1 */}
      {step === 1 && (
        <Card>
          <CardContent className="pt-6 space-y-4">
            {/* Mostrar introductor seleccionado */}
            {selectedIntroductor && (
              <div className="bg-teal-50 border border-teal-200 rounded-lg p-3">
                <p className="text-sm">
                  <span className="font-semibold text-gray-700">
                    Destinatario seleccionado:{" "}
                  </span>
                  <span className="text-teal-700 font-medium">
                    {selectedIntroductor}
                  </span>
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
                        <span className="text-xs">Código del animal</span>
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
                        <Weight className="w-4 h-4" />
                        <span className="text-xs">Peso</span>
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
                  {stockQuery.isLoading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-16">
                        <div className="flex flex-col items-center justify-center gap-3">
                          <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
                          <span className="text-sm text-gray-500">Cargando animales...</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : paginatedOrders.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center py-8 text-gray-500"
                      >
                        {selectedEspecieId 
                          ? "No hay animales disponibles para esta especie"
                          : "Seleccione una especie para ver los animales disponibles"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedOrders.map((animal) => {
                      const fecha = format(new Date(animal.createAt), "dd/MM/yyyy", { locale: es });
                      const hora = format(new Date(animal.createAt), "HH:mm:ss", { locale: es });

                      return (
                        <TableRow 
                          key={animal.id} 
                          className="cursor-pointer hover:bg-teal-50/30 transition-colors"
                          onClick={() => handleCheckOrder(animal.id, !checkedOrders.has(animal.id))}
                        >
                          <TableCell className="text-center border">
                            <div className="flex flex-col">
                              <span className="font-medium">{animal.code}</span>
                              <span className="text-xs text-muted-foreground">
                                {animal.brandName}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-xs text-center border py-2">
                            <div className="flex flex-col">
                              <span className="font-medium">{fecha}</span>
                              <span className="text-muted-foreground">
                                {hora}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-center border">
                            {animal.introducer}
                          </TableCell>
                          <TableCell className="text-center border">
                            <Badge className="bg-blue-500 hover:bg-blue-600">
                              {animal.netWeight.toFixed(2)} kg
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center border">
                            <div className="flex justify-center">
                              <Checkbox
                                checked={checkedOrders.has(animal.id)}
                                onCheckedChange={(checked) =>
                                  handleCheckOrder(animal.id, checked as boolean)
                                }
                              />
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
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
                    <span className="text-sm text-muted-foreground">
                      Mostrar:
                    </span>
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
                    {Array.from(
                      { length: Math.min(totalPages, 10) },
                      (_, i) => {
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
                      }
                    )}
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
                  <Badge
                    variant="outline"
                    className="bg-blue-500 text-white border-blue-500"
                  >
                    {checkedOrders.size}{" "}
                    {checkedOrders.size === 1 ? "animal" : "animales"}
                  </Badge>
                </div>
              </div>
            </DialogTitle>
            <DialogDescription className="sr-only">
              Seleccione los productos y subproductos para los animales seleccionados
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-1 overflow-hidden">
            {/* Animal actual - Lado izquierdo */}
            <div className="w-64 border-r overflow-y-auto p-3 bg-muted/20">
              <div className="text-neutral-950 mb-2 font-semibold">
                Animal actual
              </div>
              <div className="text-xs text-muted-foreground mb-3">
                {Array.from(checkedOrders).indexOf(currentAnimalId!) + 1} de{" "}
                {checkedOrders.size}
              </div>
              {currentAnimalId &&
                (() => {
                  const animal = animalStock.find((a) => a.id === currentAnimalId);
                  if (!animal) return null;
                  const selectedSpecieName = species.find((s) => s.id === selectedEspecieId)?.name || "";
                  return (
                    <div className="p-4 rounded-lg border-2 bg-white border-teal-500">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-bold text-blue-600 text-lg">
                          {animal.code}
                        </span>
                        <Badge className="bg-blue-500">
                          {animal.netWeight.toFixed(2)} kg
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-700 font-medium mb-2">
                        {animal.introducer}
                      </div>
                      <div className="text-sm text-gray-600">
                        {selectedSpecieName}
                      </div>
                      <div className="text-xs text-gray-500 mt-2">
                        Marca: {animal.brandName}
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
                  {Array.from(checkedOrders).map((animalId) => {
                    if (animalId === currentAnimalId) return null;
                    const animal = animalStock.find((a) => a.id === animalId);
                    if (!animal) return null;

                    // Verificar si este animal ya tiene productos guardados
                    const hasProducts = products.some(
                      (p) => p.nroIngreso === animal.id.toString()
                    );

                    const selectedSpecieName = species.find((s) => s.id === selectedEspecieId)?.name || "";

                    return (
                      <div
                        key={animalId}
                        onClick={() => setCurrentAnimalId(animalId)}
                        className="p-2 rounded bg-gray-100 hover:bg-teal-100 text-xs cursor-pointer transition-colors border-2 border-transparent hover:border-teal-500"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-bold text-blue-600">
                              {animal.code}
                            </span>
                            <span className="text-gray-500 ml-1">
                              - {selectedSpecieName}
                            </span>
                          </div>
                          {hasProducts && (
                            <Badge className="bg-green-500 text-xs">✓</Badge>
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
                    variant={
                      productType === "subproducto" ? "default" : "outline"
                    }
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
                    Seleccione{" "}
                    {productType === "producto" ? "productos" : "subproductos"}:
                  </h3>
                  {allProductsQuery.isLoading ? (
                    <div className="flex flex-col items-center justify-center py-12 gap-3">
                      <Loader2 className="h-10 w-10 animate-spin text-teal-600" />
                      <span className="text-sm text-gray-500">Cargando {productType === "producto" ? "productos" : "subproductos"}...</span>
                    </div>
                  ) : allConfiguredProducts.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No hay {productType === "producto" ? "productos" : "subproductos"} configurados para esta especie
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-3">
                      {allConfiguredProducts.map((configProduct) => {
                        // 1. Buscar si hay stock disponible de este producto
                        const stockProduct = currentAnimalProducts.find(
                          (p) => p.speciesProduct.id === configProduct.id
                        );
                        
                        // 2. Buscar si este producto está en la orden existente (para obtener su ID)
                        const orderProduct = existingOrderData?.orderDetails?.find(
                          (d) => d.animalProduct?.speciesProduct?.productCode === configProduct.productCode
                        );
                        
                        // 3. Verificar si este producto está en la orden (por productCode)
                        const isInOrder = orderId && assignedProductCodes.has(configProduct.productCode);
                        
                        // Lógica de disponibilidad:
                        // - Si hay stock → Disponible (sin importar si está en la orden)
                        // - Si NO hay stock pero está en la orden → Disponible (ya lo guardaste en este pedido)
                        // - Si NO hay stock y NO está en la orden → Bloqueado
                        const isAvailable = !!stockProduct || isInOrder;
                        
                        // El ID del producto: usar el del stock si existe, sino el de la orden
                        const productStockId = stockProduct?.id || orderProduct?.animalProduct?.id;
                        
                        return (
                          <div
                            key={configProduct.id}
                            className={`flex items-center space-x-3 p-3 rounded-lg border transition-colors ${
                              isAvailable ? "hover:bg-gray-50" : "bg-gray-100 opacity-60 cursor-not-allowed"
                            }`}
                          >
                            <Checkbox
                              id={`prod-${configProduct.id}`}
                              checked={isAvailable && productStockId ? selectedProducts.has(productStockId) : false}
                              onCheckedChange={() => isAvailable && productStockId && handleToggleProduct(productStockId)}
                              disabled={!isAvailable}
                            />
                            <label
                              htmlFor={`prod-${configProduct.id}`}
                              className={`text-sm font-medium leading-none ${
                                isAvailable ? "cursor-pointer" : "cursor-not-allowed text-gray-500"
                              }`}
                            >
                              {configProduct.productName} - {configProduct.productCode}
                            </label>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Información adicional */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <strong>Nota:</strong> Seleccione los productos/subproductos
                    para este animal. Después de guardar, pasará automáticamente
                    al siguiente animal.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer con botones */}
          <div className="border-t px-6 py-4 bg-muted/20">
            <div className="flex justify-between gap-2">
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
                onClick={handleSaveProductsForAnimal}
                disabled={selectedProducts.size === 0 || saveOrderMutation.isPending}
              >
                {saveOrderMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    GUARDANDO...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {(() => {
                      const hasProducts = products.some(
                        (p) => p.nroIngreso === currentAnimalId?.toString()
                      );
                      const animalsArray = Array.from(checkedOrders);
                      const isLastAnimal = animalsArray.indexOf(currentAnimalId!) === animalsArray.length - 1;
                      
                      if (hasProducts) {
                        return isLastAnimal ? `Actualizar y Finalizar (${selectedProducts.size})` : `Actualizar y Siguiente (${selectedProducts.size})`;
                      }
                      return isLastAnimal ? `Guardar y Finalizar (${selectedProducts.size})` : `Guardar y Siguiente (${selectedProducts.size})`;
                    })()}
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Confirmación de Eliminación */}
      <AlertDialog open={deleteConfirmation.isOpen} onOpenChange={(open) => {
        if (!open) {
          setDeleteConfirmation({
            isOpen: false,
            productId: null,
            idAnimalProduct: null,
            productName: "",
          });
        }
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Está seguro de eliminar este producto?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará <span className="font-semibold text-gray-900">{deleteConfirmation.productName}</span> de la orden.
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmRemoveProduct}
              className="bg-red-600 hover:bg-red-700"
              disabled={removeOrderDetailMutation.isPending}
            >
              {removeOrderDetailMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Eliminando...
                </>
              ) : (
                "Eliminar"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Modal de Confirmación de Finalización */}
      <AlertDialog open={showFinalizeModal} onOpenChange={setShowFinalizeModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Info className="h-5 w-5 text-blue-600" />
              Finalizar Pedido
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                <p>
                  Una vez finalizado el pedido, <span className="font-semibold text-gray-900">no podrá modificar los productos desde aquí</span>.
                </p>
                <div className="flex items-center gap-2 text-sm bg-blue-50 p-3 rounded-md border border-blue-200">
                  <Info className="h-4 w-4 text-blue-600 flex-shrink-0" />
                  <span>
                    Si necesita actualizar el pedido, diríjase a:{" "}
                    <span className="font-semibold text-blue-700">Distribución → Mis pedidos</span>
                  </span>
                </div>
                <p className="text-sm">
                  ¿Está seguro de que desea finalizar este pedido?
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmFinalize}
              className="bg-primary hover:bg-green-700"
            >
              <CheckSquare className="h-4 w-4 mr-2" />
              Sí, Finalizar Pedido
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
