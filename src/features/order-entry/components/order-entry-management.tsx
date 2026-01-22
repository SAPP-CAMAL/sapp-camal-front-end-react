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
  X,
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
import { Step3CarrierSelection } from "./step-3-carrier-selection";
import { CarrierSummaryCard } from "./carrier-summary-card";
import { AddresseeSelectionWeighing } from "@/features/animal-weighing/components/addressee-selection-weighing";
import { AddresseeSummaryCardWeighing } from "@/features/animal-weighing/components/addressee-summary-card-weighing";
import { Addressees } from "@/features/addressees/domain";
import { Carrier } from "@/features/carriers/domain";
import { useAllSpecies } from "@/features/specie/hooks/use-all-species";
import { Specie } from "@/features/specie/domain";
import { useStockBySpecie, useStockByIds, useSaveOrder, useSpecieProductsByCode, useOrderByIdAndDetail, useRemoveOrderDetail, useValidateTimeOrder } from "../hooks";
import { useUnitMeasure } from "@/features/animal-weighing/hooks";
import { toCapitalize } from "@/lib/toCapitalize";

export function OrderEntryManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<OrderEntry | null>(null);
  const [products, setProducts] = useState<ProductSubproduct[]>([]);
  const [fechaFaenamiento, setFechaFaenamiento] = useState<Date>(new Date());
  const [selectedEspecieId, setSelectedEspecieId] = useState<number | null>(null);
  const [selectedIntroductor, setSelectedIntroductor] = useState<string>("");
  const [brandAddressee, setBrandAddressee] = useState<string | undefined>(undefined);
  const [introductorSearch, setIntroductorSearch] = useState("");
  const [checkedOrders, setCheckedOrders] = useState<Set<number>>(new Set());
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [productType, setProductType] = useState<"producto" | "subproducto">(
    "producto"
  );
  const [selectedProducts, setSelectedProducts] = useState<Set<number>>(
    new Set()
  );
  const [selectedSubproducts, setSelectedSubproducts] = useState<Set<number>>(
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
  // Estructura: Map<animalId, {productos: Set<productStockId>, subproductos: Set<productStockId>}>
  const [productSelectionsCache, setProductSelectionsCache] = useState<Map<number, {productos: Set<number>, subproductos: Set<number>}>>(new Map());

  const { data: unitMeasureData } = useUnitMeasure();

  // Cache de todos los productos cargados (productos y subproductos) para poder encontrarlos al finalizar
  const [productStockCache, setProductStockCache] = useState<Map<number, ProductStockItem>>(new Map());

  const searchParams = useSearchParams();
  const urlOrderId = searchParams.get("id");
  // Usar el ID de la URL si existe, o el ID guardado después de crear la orden
  const orderId = urlOrderId ? Number(urlOrderId) : savedOrderId;

  // Hooks de API
  const saveOrderMutation = useSaveOrder();
  const removeOrderDetailMutation = useRemoveOrderDetail();
  const { data: timeValidation, error: timeValidationError } = useValidateTimeOrder();

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

  // Efecto para pre-seleccionar productos cuando cambia el animal o el tipo de producto
  useEffect(() => {
    if (!currentAnimalId) return;

    // Primero verificar si hay selecciones en cache para este animal
    const cachedSelections = productSelectionsCache.get(currentAnimalId);

    if (cachedSelections) {
      // Cargar las selecciones según el tipo actual
      if (productType === "producto") {
        setSelectedProducts(new Set(cachedSelections.productos));
      } else {
        setSelectedProducts(new Set(cachedSelections.subproductos));
      }
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
  }, [existingOrderData, existingOrderQuery.isLoading, currentAnimalId, availableProducts, productSelectionsCache, productType]);

  // Efecto para cachear todos los productos cargados (productos y subproductos)
  useEffect(() => {
    if (availableProducts.length > 0) {
      const newCache = new Map(productStockCache);
      availableProducts.forEach((product) => {
        newCache.set(product.id, product);
      });
      setProductStockCache(newCache);
    }
  }, [availableProducts]);

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

  const [isDefaultAddressSelected, setIsDefaultAddressSelected] = useState(false);

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
    setIsDefaultAddressSelected(false);
    setBrandAddressee(undefined); // Limpiar el filtro de marca
    setCheckedOrders(new Set()); // Limpiar las selecciones de animales
    setSearchTerm(""); // Limpiar búsqueda
    setSelectedIntroductor(""); // Limpiar filtro de introductor
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

  const handleConfirmRemoveProduct = () => {
    const { productId, idAnimalProduct } = deleteConfirmation;

    if (!productId || !idAnimalProduct) return;

    // Encontrar el producto que se va a eliminar para obtener su nroIngreso (animalId)
    const productToRemove = products.find((p) => p.id === productId);

    if (productToRemove) {
      const animalId = parseInt(productToRemove.nroIngreso);

      // Actualizar el cache de selecciones para este animal
      const newCache = new Map(productSelectionsCache);
      const animalSelections = newCache.get(animalId);

      if (animalSelections) {
        // Remover el producto del cache (puede estar en productos o subproductos)
        animalSelections.productos.delete(productId);
        animalSelections.subproductos.delete(productId);

        // Si no quedan productos ni subproductos seleccionados, eliminar la entrada del cache
        if (animalSelections.productos.size === 0 && animalSelections.subproductos.size === 0) {
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
    // Validar horario antes de continuar
    if (timeValidationError) {
      const errorMessage = timeValidationError.message || "No se puede crear pedidos en este horario";
      toast.error(errorMessage, {
        duration: 5000,
        style: {
          background: '#fee2e2',
          border: '2px solid #ef4444',
          color: '#991b1b',
          fontSize: '14px',
          fontWeight: '600',
        },
      });
      return;
    }

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

    // Obtener las selecciones actuales del cache o crear nuevas
    const cachedSelections = productSelectionsCache.get(currentAnimalId) || {
      productos: new Set<number>(),
      subproductos: new Set<number>()
    };

    // SIEMPRE actualizar las selecciones según el tipo actual (incluso si está vacío)
    if (productType === "producto") {
      cachedSelections.productos = new Set(selectedProducts);
    } else {
      cachedSelections.subproductos = new Set(selectedProducts);
    }

    // Guardar la selección en cache ANTES de procesar
    const newCache = new Map(productSelectionsCache);
    newCache.set(currentAnimalId, cachedSelections);
    setProductSelectionsCache(newCache);

    // Combinar productos y subproductos
    const allSelectedIds = new Set([
      ...cachedSelections.productos,
      ...cachedSelections.subproductos
    ]);

    const selectedSpecieName = species.find((s) => s.id === selectedEspecieId)?.name || "";

    // Primero, eliminar productos existentes de este animal
    const productsWithoutCurrentAnimal = products.filter(p => p.nroIngreso !== animal.id.toString());

    // Si hay selecciones, crear los productos
    if (allSelectedIds.size > 0) {
      const newProducts: ProductSubproduct[] = [];

      allSelectedIds.forEach((productStockId) => {
        // Buscar en el cache de productos en lugar de availableProducts
        const productStock = productStockCache.get(productStockId);
        if (productStock) {
          newProducts.push({
            id: productStock.id,
            idAnimalProduct: productStock.id,
            especie: selectedSpecieName,
            codigoAnimal: `[${animal.code}] - ${animal.brandName}`,
            subproducto: productStock.speciesProduct.productName,
            nroIngreso: animal.id.toString(),
          });
        }
      });

      // Agregar productos a la lista para mostrar en la tabla
      const updatedProducts = [...productsWithoutCurrentAnimal, ...newProducts];
      setProducts(updatedProducts);
    } else {
      // Si no hay selecciones, solo mantener los productos de otros animales
      setProducts(productsWithoutCurrentAnimal);
    }

    // Limpiar selección actual
    setSelectedProducts(new Set());
    setSelectedSubproducts(new Set());

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
      const cachedSelections = productSelectionsCache.get(currentAnimalId) || {
        productos: new Set<number>(),
        subproductos: new Set<number>()
      };

      // Actualizar según el tipo actual
      if (productType === "producto") {
        cachedSelections.productos = newSelected;
      } else {
        cachedSelections.subproductos = newSelected;
      }

      const newCache = new Map(productSelectionsCache);
      newCache.set(currentAnimalId, cachedSelections);
      setProductSelectionsCache(newCache);
    }
  };

  // Función para cambiar el tipo de producto guardando las selecciones actuales
  const handleChangeProductType = (newType: "producto" | "subproducto") => {
    if (newType === productType) return; // No hacer nada si es el mismo tipo

    // Guardar las selecciones actuales en el cache antes de cambiar
    if (currentAnimalId) {
      const cachedSelections = productSelectionsCache.get(currentAnimalId) || {
        productos: new Set<number>(),
        subproductos: new Set<number>()
      };

      // Guardar según el tipo ACTUAL (antes de cambiar)
      if (productType === "producto") {
        cachedSelections.productos = new Set(selectedProducts);
      } else {
        cachedSelections.subproductos = new Set(selectedProducts);
      }

      const newCache = new Map(productSelectionsCache);
      newCache.set(currentAnimalId, cachedSelections);
      setProductSelectionsCache(newCache);

      // Cambiar el tipo
      setProductType(newType);

      // Cargar las selecciones del NUEVO tipo
      if (newType === "producto") {
        setSelectedProducts(new Set(cachedSelections.productos));
      } else {
        setSelectedProducts(new Set(cachedSelections.subproductos));
      }
    } else {
      // Si no hay animal actual, solo cambiar el tipo
      setProductType(newType);
    }
  };

  // Función para abrir el modal de finalización
  const handleFinalizeClick = () => {
    // Validar que haya productos y datos requeridos
    if (products.length === 0) {
      toast.error("Debe agregar al menos un producto");
      return;
    }

    if (!selectedAddressee || !selectedCarrier) {
      toast.error("Faltan datos requeridos para guardar");
      return;
    }

    // Abrir modal de confirmación
    setShowFinalizeModal(true);
  };

  // Función para confirmar la finalización del pedido
  const handleConfirmFinalize = () => {
    // Validar que haya productos y datos requeridos
    if (products.length === 0) {
      toast.error("Debe agregar al menos un producto");
      setShowFinalizeModal(false);
      return;
    }

    if (!selectedAddressee || !selectedCarrier) {
      toast.error("Faltan datos requeridos para guardar");
      setShowFinalizeModal(false);
      return;
    }

    // Obtener todos los idAnimalProduct únicos (sin repetir)
    const uniqueProductIds = Array.from(new Set(products.map(p => p.idAnimalProduct)));

    const orderData = {
      idAddressee: selectedAddressee.id,
      idShipping: selectedCarrier.id,
      status: true,
      orderDetails: uniqueProductIds.map((idAnimalProduct) => ({
        idAnimalProduct,
      })),
    };

    // Guardar en BD
    saveOrderMutation.mutate(orderData, {
      onSuccess: (response) => {
        // Guardar el orderId de la respuesta
        if (response && typeof response === 'object' && 'data' in response) {
          const data = response.data as any;
          if (data?.id) {
            setSavedOrderId(data.id);
          }
        }

        toast.success("Pedido completado exitosamente");

        // Limpiar todo y volver al paso 1
        // setProducts([]);
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
        // setSelectedEspecieId(null);
        setSelectedIntroductor("");
        setIntroductorSearch("");
        setBrandAddressee(undefined); // Limpiar el filtro de marca
        setSearchTerm(""); // Limpiar búsqueda
        setShowFinalizeModal(false);
        setIsDefaultAddressSelected(false);
      },
      onError: () => {
        toast.error("Error al guardar el pedido");
        setShowFinalizeModal(false);
      },
    });
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-4">
                <div className="bg-teal-600 text-white p-3 rounded">
                  <Edit className="h-6 w-6" />
                </div>
                <h2 className="text-xl font-semibold text-gray-700">
                  Resumen de Ingreso
                </h2>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearSelection}
                className="text-teal-600 hover:text-teal-700 hover:bg-teal-100 w-full sm:w-auto"
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
                      .toFixed(2)} {toCapitalize(unitMeasureData?.data?.name?.toLowerCase?.() ?? '')}
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
      {step === 2 && (() => {
        return (
          <AddresseeSelectionWeighing
            initialBrandId={undefined}
            initialBrandName={brandAddressee}
            initialBrandIds={undefined}
            onSelect={handleAddresseeSelect}
            isDefaultAddressSelected={isDefaultAddressSelected}
            setIsDefaultAddressSelected={setIsDefaultAddressSelected}
            onBack={() => {
              setStep(1);
              setBrandAddressee(undefined); // Limpiar el filtro de marca
              setCheckedOrders(new Set()); // Limpiar las selecciones de animales
              setSearchTerm(""); // Limpiar búsqueda
              setSelectedIntroductor(""); // Limpiar filtro de introductor
            }}
          />
        );
      })()}

      {/* Resumen Paso 2: Destinatario Seleccionado - Se muestra en pasos 3 y 4 */}
      {step >= 3 && selectedAddressee && (
        <AddresseeSummaryCardWeighing
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
            <div className="flex flex-col gap-3 mb-4">
              <h2 className="text-base md:text-lg font-semibold text-gray-700">
                4.- Agregar productos y subproductos
              </h2>
              <Button
                variant="outline"
                className="text-purple-600 border-purple-600 hover:bg-purple-50 text-xs md:text-sm w-full md:w-auto md:self-end px-3 py-2"
                onClick={handleOpenProductModal}
                disabled={checkedOrders.size === 0}
              >
                <ShoppingBag className="h-4 w-4 mr-2 shrink-0" />
                <span className="text-[10px] sm:text-xs md:text-sm">PRODUCTOS O SUBPRODUCTOS</span>
              </Button>
            </div>

            {/* Tabla de Productos - Desktop */}
            <div className="hidden md:block relative overflow-auto border-2 rounded-lg">
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
                        <Trash2 className="w-4 h-4" />
                        <span className="text-xs">OPCIÓN</span>
                      </div>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-16">
                        <div className="flex flex-col items-center justify-center">
                          <ShoppingBag className="h-16 w-16 text-gray-400 mb-4" />
                          <h3 className="text-lg font-semibold text-gray-700 mb-2">
                            No hay productos agregados
                          </h3>
                          <p className="text-sm text-gray-500 text-center max-w-md">
                            Haga clic en el botón &quot;PRODUCTOS O SUBPRODUCTOS&quot; para agregar productos a esta orden
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
                        <TableCell className="text-center border">
                          <div className="flex justify-center">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleRemoveProductClick(product.id, product.idAnimalProduct)}
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

            {/* Cards de Productos - Mobile/Tablet */}
            <div className="md:hidden space-y-3">
              {products.length === 0 ? (
                <Card className="p-8">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <ShoppingBag className="h-16 w-16 text-gray-400" />
                    <h3 className="text-lg font-semibold text-gray-700 text-center">
                      No hay productos agregados
                    </h3>
                    <p className="text-sm text-gray-500 text-center">
                      Haga clic en el botón &quot;PRODUCTOS O SUBPRODUCTOS&quot; para agregar productos a esta orden
                    </p>
                  </div>
                </Card>
              ) : (
                products.map((product, index) => (
                  <Card
                    key={`${product.id}-${product.nroIngreso}-${index}`}
                    className="p-4 hover:shadow-lg transition-shadow border-2"
                  >
                    <div className="space-y-3">
                      {/* Especie y Código */}
                      <div className="flex items-start gap-2">
                        <PiggyBank className="h-5 w-5 text-teal-600 mt-1 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold text-gray-500 mb-1 uppercase">Especie</div>
                          <div className="text-base font-medium text-gray-900">
                            {product.especie}
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">
                            {product.codigoAnimal}
                          </div>
                        </div>
                      </div>

                      {/* Subproducto */}
                      <div className="flex items-start gap-2 pt-2 border-t border-gray-100">
                        <Package className="h-5 w-5 text-teal-600 mt-1 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold text-gray-500 mb-1 uppercase">Subproducto</div>
                          <div className="text-base font-medium text-gray-900">
                            {product.subproducto}
                          </div>
                        </div>
                      </div>

                      {/* Botón Eliminar */}
                      <div className="pt-2 border-t border-gray-100">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full text-red-600 border-red-600 hover:bg-red-50 hover:text-red-700"
                          onClick={() => handleRemoveProductClick(product.id, product.idAnimalProduct)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Eliminar Producto
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))
              )}
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
                <span className="text-sm text-gray-600 whitespace-nowrap">Buscar:</span>
                <div className="relative flex-1">
                  <Input
                    placeholder=""
                    value={searchTerm}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="w-full pr-8"
                  />
                  {searchTerm && (
                    <X
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-black cursor-pointer hover:text-gray-700"
                      onClick={() => handleSearchChange("")}
                    />
                  )}
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  className="text-teal-600 border-teal-600 hover:bg-teal-50 shrink-0"
                >
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Table - Desktop */}
            <div className="hidden lg:block relative overflow-auto border-2 rounded-lg">
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
                          onClick={() =>{
                            handleCheckOrder(animal.id, !checkedOrders.has(animal.id))
                            setBrandAddressee(animal?.brandName)
                          }}
                        >
                          <TableCell className="text-center border">
                            <div className="flex flex-col">
                              <span className="text-lg font-bold text-blue-700">{animal.brandName}</span>
                              <span className="text-sm text-muted-foreground">
                                {animal.code}
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
                              {animal.netWeight.toFixed(2)} {unitMeasureData?.data?.symbol || 'kg'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center border">
                            <div className="flex justify-center">
                              <Checkbox
                                checked={checkedOrders.has(animal.id)}
                                onCheckedChange={(checked) => {
                                    handleCheckOrder(animal.id, checked as boolean)
                                    setBrandAddressee(animal?.brandName)
                                  }
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

            {/* Cards - Mobile/Tablet */}
            <div className="lg:hidden space-y-3">
              {stockQuery.isLoading ? (
                <Card className="p-8">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <Loader2 className="h-10 w-10 animate-spin text-teal-600" />
                    <span className="text-sm text-gray-500">Cargando animales...</span>
                  </div>
                </Card>
              ) : paginatedOrders.length === 0 ? (
                <Card className="p-8 text-center">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Search className="h-10 w-10 text-gray-300" />
                    <span className="text-gray-500">
                      {selectedEspecieId
                        ? "No hay animales disponibles para esta especie"
                        : "Seleccione una especie para ver los animales disponibles"}
                    </span>
                  </div>
                </Card>
              ) : (
                paginatedOrders.map((animal) => {
                  const fecha = format(new Date(animal.createAt), "dd/MM/yyyy", { locale: es });
                  const hora = format(new Date(animal.createAt), "HH:mm:ss", { locale: es });

                  return (
                    <Card
                      key={animal.id}
                      className="p-4 cursor-pointer hover:shadow-lg hover:border-teal-300 transition-all border-2"
                      style={{
                        borderColor: checkedOrders.has(animal.id) ? '#0d9488' : undefined,
                        backgroundColor: checkedOrders.has(animal.id) ? '#f0fdfa' : undefined,
                      }}
                      onClick={() => {
                        handleCheckOrder(animal.id, !checkedOrders.has(animal.id));
                        setBrandAddressee(animal?.brandName);
                      }}
                    >
                      <div className="space-y-3">
                        {/* Marca y Código */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-2 flex-1">
                            <Tag className="h-5 w-5 text-teal-600 mt-1 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-semibold text-gray-500 mb-1 uppercase">Marca</div>
                              <div className="text-2xl font-bold text-blue-700 leading-tight">
                                {animal.brandName}
                              </div>
                              <div className="text-base text-muted-foreground mt-1">
                                {animal.code}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center justify-center w-10 h-10">
                            <Checkbox
                              checked={checkedOrders.has(animal.id)}
                              onCheckedChange={(checked) => {
                                handleCheckOrder(animal.id, checked as boolean);
                                setBrandAddressee(animal?.brandName);
                              }}
                              className="w-5 h-5"
                            />
                          </div>
                        </div>

                        {/* Fecha de Ingreso */}
                        <div className="flex items-start gap-2 pt-2 border-t border-gray-100">
                          <Calendar className="h-5 w-5 text-teal-600 mt-1 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold text-gray-500 mb-1 uppercase">Fecha de Ingreso</div>
                            <div className="text-sm font-medium text-gray-700">{fecha}</div>
                            <div className="text-xs text-muted-foreground mt-0.5">{hora}</div>
                          </div>
                        </div>

                        {/* Introductor */}
                        <div className="flex items-start gap-2 pt-2 border-t border-gray-100">
                          <User className="h-5 w-5 text-teal-600 mt-1 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold text-gray-500 mb-1 uppercase">Introductor</div>
                            <div className="text-sm font-medium text-gray-700">{animal.introducer}</div>
                          </div>
                        </div>

                        {/* Peso */}
                        <div className="flex items-start gap-2 pt-2 border-t border-gray-100">
                          <Weight className="h-5 w-5 text-teal-600 mt-1 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold text-gray-500 mb-2 uppercase">Peso</div>
                            <Badge className="bg-blue-500 hover:bg-blue-600 text-base px-3 py-1">
                              {animal.netWeight.toFixed(2)} {unitMeasureData?.data?.symbol || 'kg'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })
              )}
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
        <DialogContent className="max-md:fixed max-md:inset-0 max-md:translate-x-0 max-md:translate-y-0 max-md:w-full max-md:h-[100dvh] max-md:max-w-none max-md:rounded-none max-md:border-none md:max-w-2xl md:w-[95vw] md:h-[90vh] p-0 overflow-hidden flex flex-col bg-white shadow-2xl z-50">
          <DialogHeader className="px-6 py-4 border-b shrink-0 bg-white z-20">
            <DialogTitle>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-base font-semibold leading-none">
                    Seleccionar Productos y Subproductos
                  </span>
                  <Badge
                    variant="outline"
                    className="bg-blue-500 text-white border-blue-500 h-5"
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

          {/* Área Scroleable - Única en móvil, Dividida en Desktop */}
          <div className="flex-1 min-h-0 bg-white flex flex-col overflow-y-auto">
            {/* Panel de Selección / Info */}
            <div className="w-full border-b p-4 bg-gray-50/50 shrink-0">
              <div className="space-y-5">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">
                    Seleccionar Animal
                  </label>
                  <Select
                    value={currentAnimalId?.toString() || ""}
                    onValueChange={(value) => setCurrentAnimalId(Number(value))}
                  >
                    <SelectTrigger className="w-full bg-white h-11 border-teal-200 shadow-sm">
                      <SelectValue placeholder="Seleccione un animal" />
                    </SelectTrigger>
                    <SelectContent className="z-[100]">
                      {Array.from(checkedOrders).map((animalId) => {
                        const animal = animalStock.find((a) => a.id === animalId);
                        if (!animal) return null;
                        const hasProducts = products.some(
                          (p) => p.nroIngreso === animal.id.toString()
                        );
                        return (
                          <SelectItem key={animalId} value={animalId.toString()}>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-blue-600">{animal.code}</span>
                              {hasProducts && <span className="text-green-600">✓</span>}
                              <span className="text-gray-300">|</span>
                              <span className="truncate">{animal.brandName}</span>
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  <p className="mt-2 text-[10px] text-gray-400 font-medium">
                    Animal {Array.from(checkedOrders).indexOf(currentAnimalId!) + 1} de {checkedOrders.size}
                  </p>
                </div>

                {currentAnimalId &&
                  (() => {
                    const animal = animalStock.find((a) => a.id === currentAnimalId);
                    if (!animal) return null;
                    const selectedSpecieName = species.find((s) => s.id === selectedEspecieId)?.name || "";
                    return (
                      <div className="p-4 rounded-xl border-2 bg-white border-teal-500 shadow-sm space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="font-black text-blue-600 text-xl tracking-tight">
                            {animal.code}
                          </span>
                          <Badge className="bg-blue-600 font-bold px-2 py-1">
                            {animal.netWeight.toFixed(2)} {unitMeasureData?.data?.symbol || 'kg'}
                          </Badge>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-bold text-gray-800 leading-tight">
                            {animal.introducer}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span>{selectedSpecieName}</span>
                            <span>•</span>
                            <span className="text-teal-600 font-semibold">{animal.brandName}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
              </div>
            </div>

            {/* Listado de Productos */}
            <div className="flex-1 w-full bg-white">
              <div className="p-4 lg:p-8 max-w-4xl mx-auto space-y-6">
                {/* Selector Producto/Subproducto */}
                <div className="flex bg-gray-100 p-1 rounded-xl w-full max-w-md mx-auto shadow-inner">
                  <button
                    onClick={() => handleChangeProductType("producto")}
                    className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-bold transition-all ${
                      productType === "producto" 
                        ? "bg-white text-teal-700 shadow-md transform scale-[1.02]" 
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    PRODUCTOS
                  </button>
                  <button
                    onClick={() => handleChangeProductType("subproducto")}
                    className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-bold transition-all ${
                      productType === "subproducto" 
                        ? "bg-white text-teal-700 shadow-md transform scale-[1.02]" 
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    SUBPRODUCTOS
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b pb-2">
                    <h3 className="font-black text-gray-800 text-lg flex items-center gap-2">
                      <Package className="w-5 h-5 text-teal-600" />
                      {productType === "producto" ? "Lista de Productos" : "Lista de Subproductos"}
                    </h3>
                  </div>
                  
                  {allProductsQuery.isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                      <Loader2 className="h-12 w-12 animate-spin text-teal-600" />
                      <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Cargando...</span>
                    </div>
                  ) : allConfiguredProducts.length === 0 ? (
                    <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl p-12 text-center">
                      <Package className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                      <p className="text-gray-400 font-bold uppercase text-xs tracking-widest">Sin opciones configuradas</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3">
                      {allConfiguredProducts.map((configProduct) => {
                        const stockProduct = currentAnimalProducts.find(
                          (p) => p.speciesProduct.id === configProduct.id
                        );
                        const orderProduct = existingOrderData?.orderDetails?.find(
                          (d) => d.animalProduct?.speciesProduct?.productCode === configProduct.productCode
                        );
                        const isInOrder = orderId && assignedProductCodes.has(configProduct.productCode);
                        const isAvailable = !!stockProduct || isInOrder;
                        const productStockId = stockProduct?.id || orderProduct?.animalProduct?.id;
                        const isSelected = selectedProducts.has(productStockId!);

                        return (
                          <div
                            key={configProduct.id}
                            onClick={() => isAvailable && productStockId && handleToggleProduct(productStockId)}
                            className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all cursor-pointer select-none active:scale-[0.98] ${
                              isAvailable 
                                ? isSelected 
                                  ? "border-teal-500 bg-teal-50 shadow-sm" 
                                  : "border-gray-100 bg-white hover:border-teal-200"
                                : "bg-gray-50 border-gray-50 opacity-40 grayscale cursor-not-allowed"
                            }`}
                          >
                            <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${
                              isSelected ? "bg-teal-600 border-teal-600" : "border-gray-300 bg-white"
                            }`}>
                              {isSelected && <CheckSquare className="w-4 h-4 text-white" />}
                            </div>
                            <span className={`text-sm font-bold flex-1 leading-tight ${
                              isSelected ? "text-teal-900" : "text-gray-700"
                            }`}>
                              {configProduct.productName}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-5 flex gap-4">
                  <Info className="w-6 h-6 text-blue-400 shrink-0" />
                  <p className="text-xs text-blue-800 leading-relaxed font-bold uppercase tracking-tight">
                    Los cambios se envían automáticamente al pasar al siguiente animal o finalizar.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Fijo */}
          <div className="border-t px-6 py-4 bg-gray-50 shrink-0 z-30 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
            <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between gap-4">
              <Button
                variant="ghost"
                className="w-full sm:w-auto h-12 text-gray-400 hover:text-gray-600 font-black uppercase text-xs tracking-widest"
                onClick={() => {
                  setIsProductModalOpen(false);
                  setSelectedProducts(new Set());
                  setCurrentAnimalId(null);
                }}
              >
                Cerrar sin guardar
              </Button>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  variant="outline"
                  className="w-full sm:w-auto h-12 border-teal-600 text-teal-700 hover:bg-teal-50 font-black px-8 shadow-sm text-xs tracking-widest uppercase"
                  onClick={() => {
                    if (currentAnimalId) {
                      const animal = animalStock.find((a) => a.id === currentAnimalId);
                      if (animal) {
                        const cachedSelections = productSelectionsCache.get(currentAnimalId) || {
                          productos: new Set<number>(),
                          subproductos: new Set<number>()
                        };

                        if (productType === "producto") {
                          cachedSelections.productos = new Set(selectedProducts);
                        } else {
                          cachedSelections.subproductos = new Set(selectedProducts);
                        }

                        const newCache = new Map(productSelectionsCache);
                        newCache.set(currentAnimalId, cachedSelections);
                        setProductSelectionsCache(newCache);

                        const allSelectedIds = new Set([
                          ...cachedSelections.productos,
                          ...cachedSelections.subproductos
                        ]);

                        const selectedSpecieName = species.find((s) => s.id === selectedEspecieId)?.name || "";
                        const productsWithoutCurrentAnimal = products.filter(p => p.nroIngreso !== animal.id.toString());

                        if (allSelectedIds.size > 0) {
                          const newProducts: ProductSubproduct[] = [];
                          allSelectedIds.forEach((productStockId) => {
                            const productStock = productStockCache.get(productStockId);
                            if (productStock) {
                              newProducts.push({
                                id: productStock.id,
                                idAnimalProduct: productStock.id,
                                especie: selectedSpecieName,
                                codigoAnimal: `[${animal.code}] - ${animal.brandName}`,
                                subproducto: productStock.speciesProduct.productName,
                                nroIngreso: animal.id.toString(),
                              });
                            }
                          });
                          setProducts([...productsWithoutCurrentAnimal, ...newProducts]);
                        } else {
                          setProducts(productsWithoutCurrentAnimal);
                        }
                      }
                    }
                    setIsProductModalOpen(false);
                    setSelectedProducts(new Set());
                    setCurrentAnimalId(null);
                  }}
                >
                  <CheckSquare className="w-5 h-5 mr-2" />
                  Finalizar Selección
                </Button>

                <Button
                  className="w-full sm:w-auto h-12 bg-teal-600 hover:bg-teal-700 text-white font-black px-10 shadow-lg shadow-teal-100 text-xs tracking-widest uppercase"
                  onClick={handleSaveProductsForAnimal}
                >
                  <div className="flex items-center">
                    <span>Siguiente</span>
                    {(() => {
                      const cachedSelections = productSelectionsCache.get(currentAnimalId!) || {
                        productos: new Set<number>(),
                        subproductos: new Set<number>()
                      };
                      const currentProductos = productType === "producto" ? selectedProducts : cachedSelections.productos;
                      const currentSubproductos = productType === "subproducto" ? selectedProducts : cachedSelections.subproductos;
                      const totalCount = new Set([...currentProductos, ...currentSubproductos]).size;
                      
                      return totalCount > 0 ? (
                        <div className="ml-3 bg-teal-400 text-teal-900 h-6 min-w-[24px] rounded-md flex items-center justify-center px-1 font-black text-xs">
                          {totalCount}
                        </div>
                      ) : null;
                    })()}
                    <ChevronRight className="w-5 h-5 ml-2" />
                  </div>
                </Button>
              </div>
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
            >
              Eliminar
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
