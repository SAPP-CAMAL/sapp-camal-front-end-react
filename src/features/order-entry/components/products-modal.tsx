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
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAllSpecies } from "@/features/specie/hooks/use-all-species";
import { Specie } from "@/features/specie/domain";
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
      <DialogContent className="max-w-none! w-[95vw] h-[90vh] max-h-[90vh] p-0 overflow-hidden flex flex-col">
        <DialogHeader className="px-6 pt-5 pb-3 border-b">
          <DialogTitle>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="text-base font-semibold">
                  {readOnly ? 'Ver' : 'Seleccionar'} Productos y Subproductos - Orden #{orderId}
                </span>
                <Badge variant="outline" className="bg-blue-500 text-white border-blue-500">
                  {animalIdsInOrder.length} {animalIdsInOrder.length === 1 ? "animal" : "animales"}
                </Badge>
                {currentAnimalId && (
                  <Badge variant="outline" className="bg-teal-600 text-white border-teal-600">
                    Animal #{currentAnimalId}
                  </Badge>
                )}
              </div>
              {stockQuery.isLoading && (
                <span className="text-xs text-gray-500">Cargando animales disponibles...</span>
              )}
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-1 overflow-hidden">
          <div className="w-64 border-r overflow-y-auto p-3 bg-muted/20">
            <div className="text-neutral-950 mb-2 font-semibold">
              Animal actual
            </div>
            <div className="text-xs text-muted-foreground mb-3">
              {currentAnimalId ? animalIdsInOrder.indexOf(currentAnimalId) + 1 : 0} de {animalIdsInOrder.length}
            </div>
            {currentAnimalId &&
              (() => {
                const animal = animalStock.find((a) => a.id === currentAnimalId);
                if (!animal) return null;
                const selectedSpecieName = species.find((s) => s.id === specieId)?.name || "";
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

            <div className="mt-4">
              <div className="text-xs font-semibold text-gray-600 mb-2">
                Todos los animales:
              </div>
              <div className="space-y-1">
                {animalIdsInOrder.map((animalId) => {
                  if (animalId === currentAnimalId) return null;
                  const animal = animalStock.find((a) => a.id === animalId);
                  if (!animal) return null;

                  const selectedSpecieName = species.find((s) => s.id === specieId)?.name || "";

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
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-5xl mx-auto space-y-6">
              <div className="flex gap-2 justify-center">
                <Button
                  variant={productType === "producto" ? "default" : "outline"}
                  onClick={() => onProductTypeChange("producto")}
                  className={productType === "producto" ? "bg-teal-600 hover:bg-teal-700" : ""}
                >
                  Producto
                </Button>
                <Button
                  variant={productType === "subproducto" ? "default" : "outline"}
                  onClick={() => onProductTypeChange("subproducto")}
                  className={productType === "subproducto" ? "bg-teal-600 hover:bg-teal-700" : ""}
                >
                  Subproducto
                </Button>
              </div>

              <div className="border-2 rounded-lg p-6 bg-white">
                <h3 className="font-semibold text-gray-700 mb-4 text-lg">
                  Seleccione {productType === "producto" ? "productos" : "subproductos"}:
                </h3>
                
                {/* Información de depuración para el usuario */}
                {currentAnimalId && (
                  <div className="mb-4 text-xs text-gray-500 space-y-1">
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
                  <div className="grid grid-cols-3 gap-3">
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
                          className={`flex items-center space-x-3 p-3 rounded-lg border-2 transition-colors ${
                            isAvailable 
                              ? isInOrder 
                                ? "border-teal-500 bg-teal-50 hover:bg-teal-100" 
                                : "border-gray-200 hover:bg-gray-50"
                              : "bg-gray-100 opacity-60 cursor-not-allowed border-gray-200"
                          }`}
                        >
                          <Checkbox
                            id={`prod-${configProduct.id}-${currentAnimalId}`}
                            checked={isAvailable && productStockId ? selectedProducts.has(productStockId) : false}
                            onCheckedChange={() => {
                              if (isAvailable && productStockId && !readOnly) {
                                handleToggleProduct(productStockId);
                              }
                            }}
                            disabled={!isAvailable || readOnly}
                          />
                          <label
                            htmlFor={`prod-${configProduct.id}-${currentAnimalId}`}
                            className={`text-sm font-medium leading-none flex-1 ${
                              isAvailable ? "cursor-pointer" : "cursor-not-allowed text-gray-500"
                            }`}
                          >
                            <div className="flex flex-col gap-1">
                              <span>{configProduct.productName}</span>
                              <span className="text-xs text-gray-500">{configProduct.productCode}</span>
                            </div>
                          </label>
                          {isInOrder && (
                            <Badge variant="outline" className="bg-teal-600 text-white text-xs">
                              Asignado
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
        </div>

        <div className="border-t px-6 py-4 bg-muted/20">
          <div className="flex justify-between items-center">
            <div>
              {hasChanges && orderStatus === 'PENDIENTE' && (
                <span className="text-sm text-amber-600 font-medium">
                  ⚠️ Hay cambios sin guardar
                </span>
              )}
            </div>
            <div className="flex gap-2">
              {orderStatus === 'PENDIENTE' && hasChanges && (
                <Button 
                  onClick={handleUpdateOrder}
                  disabled={updateOrderMutation.isPending}
                  className="bg-teal-600 hover:bg-teal-700"
                >
                  {updateOrderMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Actualizando...
                    </>
                  ) : (
                    'Actualizar'
                  )}
                </Button>
              )}
              <Button variant="outline" onClick={handleClose}>
                Cerrar
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
