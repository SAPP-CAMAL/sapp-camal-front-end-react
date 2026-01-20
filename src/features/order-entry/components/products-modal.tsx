"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAllSpecies } from "@/features/specie/hooks/use-all-species";
import { Specie } from "@/features/specie/domain";
import { useUnitMeasure } from "@/features/animal-weighing/hooks";
import {
  useStockByIds,
  useSpecieProductsByCode,
  useOrderByIdAndDetail,
  useUpdateOrderDetails,
} from "../hooks";
import type {
  StockByIdsRequest,
  ProductStockItem,
  SpecieProductConfig,
  OrderByIdAndDetailResponse,
  AnimalStock,
  AnimalStockItem,
} from "../domain/order-entry.types";
import { useStockBySpecie } from "../hooks/use-stock-by-specie";

interface ProductsModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: number;
  specieId: number;
  productType: "producto" | "subproducto";
  onProductTypeChange: (type: "producto" | "subproducto") => void;
  readOnly?: boolean;
  animalIds: number[]; // IDs de animales que pertenecen a esta orden
  orderStatus?: string; // Estado de la orden (PENDIENTE, APROBADO, RECHAZADO)
}

export function ProductsModal({
  isOpen,
  onClose,
  orderId,
  specieId,
  productType,
  onProductTypeChange,
  readOnly = true,
  animalIds,
  orderStatus = 'PENDIENTE',
}: ProductsModalProps) {
  const [currentAnimalId, setCurrentAnimalId] = useState<number | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<Set<number>>(new Set());
  const [productSelectionsCache, setProductSelectionsCache] = useState<Map<number, Set<number>>>(new Map());
  const [originalProductsState, setOriginalProductsState] = useState<Map<number, Set<number>>>(new Map());
  const [hasChanges, setHasChanges] = useState(false);

  const updateOrderMutation = useUpdateOrderDetails();

  const speciesQuery = useAllSpecies();
  const species: Specie[] = (speciesQuery.data?.data as Specie[]) || [];
  const { data: unitMeasureData } = useUnitMeasure();

  // Usar los IDs de animales que vienen de la orden
  const animalIdsInOrder = useMemo(() => {
    return animalIds;
  }, [animalIds]);

  const stockQuery = useStockBySpecie(specieId);
  const stockData = (stockQuery.data?.data || []) as unknown as AnimalStock[];
  
  // Filtrar solo los animales que están en la orden
  const animalStock: AnimalStockItem[] = stockData
    .flatMap((item) => item.animal || [])
    .filter((animal) => animalIdsInOrder.includes(animal.id));

  const stockByIdsRequest: StockByIdsRequest | null = useMemo(() => {
    if (!isOpen || animalIdsInOrder.length === 0) return null;

    return {
      productTypeCode: productType === "producto" ? "PRO" : "SUB",
      idDetailsSpeciesCertificate: animalIdsInOrder,
    };
  }, [isOpen, animalIdsInOrder, productType]);

  const productsQuery = useStockByIds(stockByIdsRequest);
  const availableProducts = (productsQuery.data?.data || []) as unknown as ProductStockItem[];
  
  // Inicializar currentAnimalId ANTES de hacer cualquier consulta
  useEffect(() => {
    if (isOpen && animalIdsInOrder.length > 0 && !currentAnimalId) {
      setCurrentAnimalId(animalIdsInOrder[0]);
    }
  }, [isOpen, animalIdsInOrder, currentAnimalId]);

  const allProductsQuery = useSpecieProductsByCode(
    specieId,
    productType === "producto" ? "PRO" : "SUB"
  );
  const allConfiguredProducts = (allProductsQuery.data?.data || []) as SpecieProductConfig[];

  // IMPORTANTE: Solo hacer la consulta cuando AMBOS parámetros estén disponibles
  const shouldFetchOrderDetails = !!orderId && !!currentAnimalId;
  
  const existingOrderQuery = useOrderByIdAndDetail(
    shouldFetchOrderDetails ? orderId : null,
    shouldFetchOrderDetails ? currentAnimalId : null
  );
  const existingOrderData = existingOrderQuery.data?.data as OrderByIdAndDetailResponse | undefined;

  const assignedProductCodes = useMemo(() => {
    const codes = new Set<string>();
    if (existingOrderData?.orderDetails && currentAnimalId) {
      existingOrderData.orderDetails.forEach((detail) => {
        // Solo considerar productos del animal actual
        if (
          detail.animalProduct?.speciesProduct?.productCode &&
          detail.animalProduct?.idDetailsSpeciesCertificate === currentAnimalId
        ) {
          codes.add(detail.animalProduct.speciesProduct.productCode);
        }
      });
    }
    return codes;
  }, [existingOrderData, currentAnimalId]);

  const groupedProducts = useMemo(() => {
    const grouped = new Map<number, ProductStockItem[]>();

    availableProducts.forEach((product) => {
      const animalId = product.idDetailsSpeciesCertificate;
      if (!grouped.has(animalId)) {
        grouped.set(animalId, []);
      }
      grouped.get(animalId)!.push(product);
    });

    grouped.forEach((products) => {
      products.sort((a, b) => a.speciesProduct.displayOrder - b.speciesProduct.displayOrder);
    });

    return grouped;
  }, [availableProducts]);

  const currentAnimalProducts = useMemo(() => {
    if (!currentAnimalId) return [];
    return groupedProducts.get(currentAnimalId) || [];
  }, [currentAnimalId, groupedProducts]);

  useEffect(() => {
    if (!currentAnimalId) return;

    // Verificar si ya tenemos selecciones en caché para este animal
    const cachedSelections = productSelectionsCache.get(currentAnimalId);

    if (cachedSelections && cachedSelections.size > 0) {
      setSelectedProducts(new Set(cachedSelections));
      return;
    }

    // Cargar productos asignados desde la orden
    if (existingOrderData?.orderDetails && !existingOrderQuery.isLoading) {
      const productIds = new Set<number>();
      
      existingOrderData.orderDetails.forEach((detail) => {
        // Verificar que el producto pertenece al animal actual
        if (detail.animalProduct?.idDetailsSpeciesCertificate === currentAnimalId) {
          productIds.add(detail.animalProduct.id);
        }
      });
      
      setSelectedProducts(productIds);
      
      // Guardar el estado original solo si no existe aún
      if (!originalProductsState.has(currentAnimalId)) {
        const newOriginalState = new Map(originalProductsState);
        newOriginalState.set(currentAnimalId, new Set(productIds));
        setOriginalProductsState(newOriginalState);
      }
    } else if (!existingOrderQuery.isLoading) {
      setSelectedProducts(new Set());
    }
  }, [existingOrderData, existingOrderQuery.isLoading, currentAnimalId, availableProducts, productSelectionsCache, originalProductsState]);

  // Detectar si hay cambios comparando el estado actual con el original
  useEffect(() => {
    let hasAnyChanges = false;
    
    // Combinar todos los animales (cache + actual)
    const allAnimalIds = new Set([
      ...Array.from(productSelectionsCache.keys()),
      ...(currentAnimalId ? [currentAnimalId] : [])
    ]);
    
    for (const animalId of allAnimalIds) {
      const current = animalId === currentAnimalId 
        ? selectedProducts 
        : (productSelectionsCache.get(animalId) || new Set());
      const original = originalProductsState.get(animalId) || new Set();
      
      // Comparar tamaños
      if (current.size !== original.size) {
        hasAnyChanges = true;
        break;
      }
      
      // Comparar contenidos
      for (const id of current) {
        if (!original.has(id)) {
          hasAnyChanges = true;
          break;
        }
      }
      
      if (hasAnyChanges) break;
    }
    
    setHasChanges(hasAnyChanges);
  }, [selectedProducts, productSelectionsCache, originalProductsState, currentAnimalId]);

  const handleToggleProduct = (productId: number) => {
    const newSelected = new Set(selectedProducts);
    if (newSelected.has(productId)) {
      newSelected.delete(productId);
    } else {
      newSelected.add(productId);
    }
    setSelectedProducts(newSelected);

    if (currentAnimalId) {
      const newCache = new Map(productSelectionsCache);
      newCache.set(currentAnimalId, newSelected);
      setProductSelectionsCache(newCache);
    }
  };

  const handleClose = () => {
    setCurrentAnimalId(null);
    setSelectedProducts(new Set());
    setProductSelectionsCache(new Map());
    setOriginalProductsState(new Map());
    setHasChanges(false);
    onClose();
  };

  const handleUpdateOrder = async () => {
    try {
      // Recopilar todos los productos de todos los animales
      const allProducts = new Map<number, boolean>();
      
      // Primero, marcar todos los productos originales como su estado original
      originalProductsState.forEach((productIds) => {
        productIds.forEach(productId => {
          allProducts.set(productId, true);
        });
      });
      
      // Luego, actualizar con los cambios del cache y el animal actual
      const allAnimalIds = new Set([
        ...Array.from(productSelectionsCache.keys()),
        ...(currentAnimalId ? [currentAnimalId] : [])
      ]);
      
      for (const animalId of allAnimalIds) {
        const current = animalId === currentAnimalId 
          ? selectedProducts 
          : (productSelectionsCache.get(animalId) || new Set());
        const original = originalProductsState.get(animalId) || new Set();
        
        // Productos que estaban en original y siguen en current: status true
        current.forEach(productId => {
          allProducts.set(productId, true);
        });
        
        // Productos que estaban en original pero NO en current: status false
        original.forEach(productId => {
          if (!current.has(productId)) {
            allProducts.set(productId, false);
          }
        });
      }
      
      // Construir el array de orderDetails
      const orderDetails = Array.from(allProducts.entries()).map(([idAnimalProduct, status]) => ({
        idAnimalProduct,
        status
      }));
      
      await updateOrderMutation.mutateAsync({
        orderId,
        data: { orderDetails }
      });
      
      // Mostrar toast de éxito
      toast.success('Pedido actualizado', {
        description: `Se actualizaron ${orderDetails.length} productos correctamente`,
        duration: 3000,
      });
      
      // Actualizar el estado original con el nuevo estado
      setOriginalProductsState(new Map(productSelectionsCache));
      if (currentAnimalId) {
        const newOriginal = new Map(originalProductsState);
        newOriginal.set(currentAnimalId, new Set(selectedProducts));
        setOriginalProductsState(newOriginal);
      }
      
      setHasChanges(false);
      
      // Cerrar el modal después de actualizar
      handleClose();
    } catch (error) {
      console.error('❌ Error al actualizar:', error);
      toast.error('Error al actualizar', {
        description: 'No se pudo actualizar el pedido. Por favor intente nuevamente.',
        duration: 4000,
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-[100vw] w-full sm:w-[95vw] md:w-[90vw] lg:w-[85vw] xl:w-[80vw] h-[96vh] md:h-[90vh] p-0 gap-0 overflow-hidden flex flex-col">
        <DialogHeader className="px-2 sm:px-4 md:px-6 pt-2 sm:pt-3 md:pt-5 pb-2 border-b shrink-0">
          <DialogTitle>
            <div className="flex flex-col gap-1">
              <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                <span className="text-xs sm:text-sm md:text-base font-semibold leading-tight">
                  Productos - Orden #{orderId}
                </span>
                <Badge variant="outline" className="bg-blue-500 text-white border-blue-500 text-[10px] sm:text-xs px-1 sm:px-2">
                  {animalIdsInOrder.length} {animalIdsInOrder.length === 1 ? "animal" : "animales"}
                </Badge>
              </div>
              {stockQuery.isLoading && (
                <span className="text-[10px] sm:text-xs text-gray-500">Cargando...</span>
              )}
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-2 sm:p-3 md:p-6">
          <div className="max-w-5xl mx-auto space-y-2 sm:space-y-3 md:space-y-4">
            {/* Selector de Animal */}
            <div className="space-y-1 sm:space-y-2">
              <label className="text-xs sm:text-sm font-semibold text-gray-700">
                Animal:
              </label>
              <Select
                value={currentAnimalId?.toString() || ""}
                onValueChange={(value) => setCurrentAnimalId(Number(value))}
              >
                <SelectTrigger className="w-full h-9 sm:h-10 text-xs sm:text-sm">
                  <SelectValue placeholder="Seleccione" />
                </SelectTrigger>
                <SelectContent>
                  {animalIdsInOrder.map((animalId) => {
                    const animal = animalStock.find((a) => a.id === animalId);
                    if (!animal) return null;
                    const selectedSpecieName = species.find((s) => s.id === specieId)?.name || "";
                    
                    return (
                      <SelectItem key={animalId} value={animalId.toString()} className="text-xs sm:text-sm">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-blue-600">{animal.code}</span>
                          <span className="text-xs text-gray-500">{selectedSpecieName}</span>
                          <Badge className="bg-blue-500 text-[10px] px-1.5">
                            {animal.netWeight.toFixed(2)} {unitMeasureData?.data?.symbol || 'kg'}
                          </Badge>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>

              {/* Info del animal actual */}
              {currentAnimalId && (() => {
                const animal = animalStock.find((a) => a.id === currentAnimalId);
                if (!animal) return null;
                return (
                  <div className="mt-1 sm:mt-2 p-2 sm:p-3 rounded-lg border bg-teal-50 border-teal-300">
                    <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm">
                      <div>
                        <span className="text-gray-600">Introductor: </span>
                        <span className="font-medium">{animal.introducer}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Marca: </span>
                        <span className="font-medium">{animal.brandName}</span>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Botón de Tipo de Producto */}
            <div className="flex gap-1 sm:gap-2 justify-center">
              <Button
                variant={productType === "producto" ? "default" : "outline"}
                onClick={() => onProductTypeChange("producto")}
                className={`${productType === "producto" ? "bg-teal-600 hover:bg-teal-700" : ""} text-xs sm:text-sm md:text-base px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 h-8 sm:h-9 md:h-10`}
              >
                Producto
              </Button>
              <Button
                variant={productType === "subproducto" ? "default" : "outline"}
                onClick={() => onProductTypeChange("subproducto")}
                className={`${productType === "subproducto" ? "bg-teal-600 hover:bg-teal-700" : ""} text-xs sm:text-sm md:text-base px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 h-8 sm:h-9 md:h-10`}
              >
                Subproducto
              </Button>
            </div>
            {/* Sección de Productos */}
            <div className="border rounded-lg p-2 sm:p-3 md:p-6 bg-white">
              <h3 className="font-semibold text-gray-700 mb-2 sm:mb-3 md:mb-4 text-sm sm:text-base md:text-lg">
                {productType === "producto" ? "Productos" : "Subproductos"}
              </h3>
                
              {/* Información de depuración para el usuario - Solo desktop */}
              {currentAnimalId && (
                <div className="hidden md:block mb-3 md:mb-4 text-xs text-gray-500 space-y-1">
                  <div>Animal actual: {currentAnimalId}</div>
                  <div>Productos disponibles: {currentAnimalProducts.length}</div>
                  <div>Productos configurados: {allConfiguredProducts.length}</div>
                  <div>Productos seleccionados: {selectedProducts.size}</div>
                  {existingOrderQuery.isLoading && (
                    <div className="text-blue-600">Cargando datos de la orden...</div>
                  )}
                </div>
              )}
              {allProductsQuery.isLoading || productsQuery.isLoading ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <Loader2 className="h-10 w-10 animate-spin text-teal-600" />
                  <span className="text-sm text-gray-500">
                    Cargando {productType === "producto" ? "productos" : "subproductos"}...
                  </span>
                </div>
              ) : allConfiguredProducts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No hay {productType === "producto" ? "productos" : "subproductos"} configurados
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-3">
                    {allConfiguredProducts.map((configProduct) => {
                      // Buscar el producto en stock del animal actual
                      const stockProduct = currentAnimalProducts.find(
                        (p) => p.speciesProduct.productCode === configProduct.productCode
                      );

                      // Buscar el producto en los detalles de la orden para el animal actual
                      const orderProduct = existingOrderData?.orderDetails?.find(
                        (d) => 
                          d.animalProduct?.speciesProduct?.productCode === configProduct.productCode &&
                          d.animalProduct?.idDetailsSpeciesCertificate === currentAnimalId
                      );

                      // El producto está en la orden si existe orderProduct
                      const isInOrder = !!orderProduct;
                      
                      // El producto está disponible si está en stock o ya está asignado en la orden
                      const isAvailable = !!stockProduct || isInOrder;
                      
                      // ID del producto: en modo readOnly usar el de la orden, si no el de stock
                      const productStockId = isInOrder ? orderProduct?.animalProduct?.id : stockProduct?.id;

                      return (
                        <div
                          key={configProduct.id}
                          className={`flex items-center justify-between gap-2 p-3 rounded-lg border-2 transition-colors ${
                            isAvailable 
                              ? isInOrder 
                                ? "border-teal-500 bg-teal-50 hover:bg-teal-100" 
                                : "border-gray-200 hover:bg-gray-50"
                              : "bg-gray-100 opacity-60 cursor-not-allowed border-gray-200"
                          }`}
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <Checkbox
                              id={`prod-${configProduct.id}-${currentAnimalId}`}
                              checked={isAvailable && productStockId ? selectedProducts.has(productStockId) : false}
                              onCheckedChange={() => {
                                if (isAvailable && productStockId && !readOnly) {
                                  handleToggleProduct(productStockId);
                                }
                              }}
                              disabled={!isAvailable || readOnly}
                              className="shrink-0"
                            />
                            <label
                              htmlFor={`prod-${configProduct.id}-${currentAnimalId}`}
                              className={`text-sm md:text-base font-medium leading-tight flex-1 min-w-0 ${
                                isAvailable ? "cursor-pointer" : "cursor-not-allowed text-gray-500"
                              }`}
                            >
                              <span className="line-clamp-2">
                                {productType === "subproducto" && configProduct.productName.includes(' - ')
                                  ? configProduct.productName.split(' - ')[0]
                                  : configProduct.productName
                                }
                              </span>
                            </label>
                          </div>
                          {isInOrder && (
                            <Badge variant="outline" className="bg-teal-600 text-white text-xs shrink-0">
                              ✓
                            </Badge>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
          </div>
        </div>

        <div className="border-t px-2 sm:px-3 md:px-6 py-2 md:py-3 bg-muted/20 shrink-0">
          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-2">
            <div className="text-center sm:text-left order-2 sm:order-1">
              {hasChanges && orderStatus === 'PENDIENTE' && (
                <span className="text-[10px] sm:text-xs md:text-sm text-amber-600 font-medium">
                  ⚠️ Cambios sin guardar
                </span>
              )}
            </div>
            <div className="flex gap-2 order-1 sm:order-2">
              {orderStatus === 'PENDIENTE' && hasChanges && (
                <Button 
                  onClick={handleUpdateOrder}
                  disabled={updateOrderMutation.isPending}
                  className="bg-teal-600 hover:bg-teal-700 flex-1 sm:flex-none text-xs sm:text-sm md:text-base h-8 sm:h-9 md:h-10"
                >
                  {updateOrderMutation.isPending ? (
                    <>
                      <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 animate-spin" />
                      <span className="hidden sm:inline">Actualizando...</span>
                      <span className="sm:hidden">...</span>
                    </>
                  ) : (
                    'Actualizar'
                  )}
                </Button>
              )}
              <Button variant="outline" onClick={handleClose} className="flex-1 sm:flex-none text-xs sm:text-sm md:text-base h-8 sm:h-9 md:h-10">
                Cerrar
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
