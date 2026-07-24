"use client";

import { Beef, RotateCcw, Trash2, XIcon, Check } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ConfirmationDialog } from "@/components/confirmation-dialog";

import { NewProductType } from "./components/new-product-type";
import { UpdateProductType } from "./components/update-product-type";
import { PRODUCT_TYPE_LIST_TAG } from "./constants";
import {
  deleteProductTypeService,
  getAllProductTypesService,
  updateProductTypeService,
} from "./server/db/product-type.service";

export function ProductTypeManagement() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: [PRODUCT_TYPE_LIST_TAG],
    queryFn: getAllProductTypesService,
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: [PRODUCT_TYPE_LIST_TAG] });

  const handleDeactivate = async (id: number) => {
    try {
      await deleteProductTypeService(id);
      toast.success("Registro desactivado exitosamente");
      invalidate();
    } catch (error: any) {
      const { data } = await error.response.json();
      toast.error(data);
    }
  };

  const handleReactivate = async (id: number) => {
    try {
      await updateProductTypeService(id, { status: true });
      toast.success("Registro reactivado exitosamente");
      invalidate();
    } catch (error: any) {
      const { data } = await error.response.json();
      toast.error(data);
    }
  };

  const items = query.data?.data ?? [];

  return (
    <div>
      <section className="mb-4 flex justify-between">
        <div>
          <h1 className="flex items-center gap-x-2 font-semibold text-xl">
            <Beef />
            Tipos de Producto
          </h1>
          <p className="text-gray-600 text-sm mt-1">
            Catálogo de tipos de producto/subproducto cárnico, padre de la
            configuración de productos por especie.
          </p>
        </div>
        <div className="flex gap-x-2">
          <NewProductType />
        </div>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Tipos registrados</CardTitle>
          <CardDescription>Listado de tipos de producto.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="hidden lg:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-center">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {query.isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center animate-pulse">
                      Cargando datos...
                    </TableCell>
                  </TableRow>
                ) : items.length ? (
                  items.map((productType) => (
                    <TableRow key={productType.id}>
                      <TableCell>{productType.code}</TableCell>
                      <TableCell>{productType.typeName}</TableCell>
                      <TableCell className="max-w-[300px] truncate">
                        {productType.description || "-"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={productType.status ? "default" : "secondary"}>
                          {productType.status ? "Activo" : "Inactivo"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-center gap-2">
                          <UpdateProductType productType={productType} />
                          {productType.status ? (
                            <ConfirmationDialog
                              title="¿Desactivar este registro?"
                              description="El registro dejará de estar activo. Podrás reactivarlo luego si lo necesitas."
                              onConfirm={() => handleDeactivate(productType.id)}
                              triggerBtn={
                                <Button variant="outline" size="icon">
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
                          ) : (
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleReactivate(productType.id)}
                            >
                              <RotateCcw className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center text-gray-500">
                      No se ha registrado ningún tipo de producto
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="lg:hidden p-4">
            {query.isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="animate-pulse h-24" />
                ))}
              </div>
            ) : items.length ? (
              <div className="grid grid-cols-1 gap-4">
                {items.map((productType) => (
                  <Card key={productType.id} className="overflow-hidden border-gray-200">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                            Código
                          </span>
                          <div className="text-sm">{productType.code}</div>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                            Nombre
                          </span>
                          <div className="text-sm">{productType.typeName}</div>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                            Descripción
                          </span>
                          <div className="text-sm">{productType.description || "-"}</div>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                            Estado
                          </span>
                          <div>
                            <Badge variant={productType.status ? "default" : "secondary"}>
                              {productType.status ? "Activo" : "Inactivo"}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex justify-center gap-2 pt-2">
                          <UpdateProductType productType={productType} />
                          {productType.status ? (
                            <ConfirmationDialog
                              title="¿Desactivar este registro?"
                              description="El registro dejará de estar activo. Podrás reactivarlo luego si lo necesitas."
                              onConfirm={() => handleDeactivate(productType.id)}
                              triggerBtn={
                                <Button variant="outline" size="icon">
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
                          ) : (
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleReactivate(productType.id)}
                            >
                              <RotateCcw className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed">
                <p>No se ha registrado ningún tipo de producto</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
