"use client";

import { PackageSearch, RotateCcw, Trash2 } from "lucide-react";
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
import { useAllSpecies } from "@/features/specie/hooks";
import { getAllAnimalSex } from "@/features/animal-sex/server/db/animal-sex.service";

import { NewSpeciesProduct } from "./components/new-species-product";
import { UpdateSpeciesProduct } from "./components/update-species-product";
import { SPECIES_PRODUCT_LIST_TAG } from "./constants";
import {
  deleteSpeciesProductPermanentlyService,
  getAllSpeciesProductsService,
  updateSpeciesProductService,
} from "./server/db/species-product.service";

export function SpeciesProductManagement() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: [SPECIES_PRODUCT_LIST_TAG],
    queryFn: getAllSpeciesProductsService,
  });

  const speciesQuery = useAllSpecies();
  const animalSexQuery = useQuery({
    queryKey: ["animal-sex-list-for-select"],
    queryFn: getAllAnimalSex,
  });

  const speciesById = new Map(
    (speciesQuery.data?.data ?? []).map((s) => [s.id, s.name]),
  );
  const animalSexById = new Map(
    (animalSexQuery.data?.data ?? []).map((a) => [a.id, a.name]),
  );

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: [SPECIES_PRODUCT_LIST_TAG] });

  const handleDelete = async (id: number) => {
    try {
      await deleteSpeciesProductPermanentlyService(id);
      toast.success("Registro eliminado permanentemente");
      invalidate();
    } catch (error: any) {
      const { data } = await error.response.json();
      toast.error(data);
    }
  };

  const handleReactivate = async (id: number) => {
    try {
      await updateSpeciesProductService(id, { status: true });
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
            <PackageSearch />
            Productos por Especie
          </h1>
          <p className="text-gray-600 text-sm mt-1">
            Define qué productos existen por especie y sexo de animal, con
            orden de visualización.
          </p>
        </div>
        <div className="flex gap-x-2">
          <NewSpeciesProduct />
        </div>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Productos registrados</CardTitle>
          <CardDescription>Listado de productos por especie.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="hidden lg:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Especie</TableHead>
                  <TableHead>Tipo de producto</TableHead>
                  <TableHead>Sexo</TableHead>
                  <TableHead>Código</TableHead>
                  <TableHead>Producto</TableHead>
                  <TableHead>Orden</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-center">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {query.isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-32 text-center animate-pulse">
                      Cargando datos...
                    </TableCell>
                  </TableRow>
                ) : items.length ? (
                  items.map((speciesProduct) => (
                    <TableRow key={speciesProduct.id}>
                      <TableCell>
                        {speciesById.get(speciesProduct.idSpecies) ?? "-"}
                      </TableCell>
                      <TableCell>
                        {speciesProduct.productType?.typeName ?? "-"}
                      </TableCell>
                      <TableCell>
                        {speciesProduct.idAnimalSex
                          ? animalSexById.get(speciesProduct.idAnimalSex) ?? "-"
                          : "Todos"}
                      </TableCell>
                      <TableCell>{speciesProduct.productCode}</TableCell>
                      <TableCell>{speciesProduct.productName}</TableCell>
                      <TableCell>{speciesProduct.displayOrder}</TableCell>
                      <TableCell>
                        <Badge variant={speciesProduct.status ? "default" : "secondary"}>
                          {speciesProduct.status ? "Activo" : "Inactivo"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-center gap-2">
                          <UpdateSpeciesProduct speciesProduct={speciesProduct} />
                          {speciesProduct.status ? (
                            <ConfirmationDialog
                              title="¿Eliminar este registro?"
                              description="Esta acción no se puede deshacer. El registro se eliminará permanentemente de la base de datos."
                              onConfirm={() => handleDelete(speciesProduct.id)}
                              triggerBtn={
                                <Button variant="outline" size="icon">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              }
                              cancelBtn={<Button variant="outline">Cancelar</Button>}
                              confirmBtn={<Button variant="destructive">Eliminar</Button>}
                            />
                          ) : (
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleReactivate(speciesProduct.id)}
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
                    <TableCell colSpan={8} className="h-32 text-center text-gray-500">
                      No se ha registrado ningún producto por especie
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
                {items.map((speciesProduct) => (
                  <Card key={speciesProduct.id} className="overflow-hidden border-gray-200">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                            Especie
                          </span>
                          <div className="text-sm">
                            {speciesById.get(speciesProduct.idSpecies) ?? "-"}
                          </div>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                            Tipo de producto
                          </span>
                          <div className="text-sm">
                            {speciesProduct.productType?.typeName ?? "-"}
                          </div>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                            Sexo
                          </span>
                          <div className="text-sm">
                            {speciesProduct.idAnimalSex
                              ? animalSexById.get(speciesProduct.idAnimalSex) ?? "-"
                              : "Todos"}
                          </div>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                            Código
                          </span>
                          <div className="text-sm">{speciesProduct.productCode}</div>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                            Producto
                          </span>
                          <div className="text-sm">{speciesProduct.productName}</div>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                            Orden
                          </span>
                          <div className="text-sm">{speciesProduct.displayOrder}</div>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                            Estado
                          </span>
                          <div>
                            <Badge variant={speciesProduct.status ? "default" : "secondary"}>
                              {speciesProduct.status ? "Activo" : "Inactivo"}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex justify-center gap-2 pt-2">
                          <UpdateSpeciesProduct speciesProduct={speciesProduct} />
                          {speciesProduct.status ? (
                            <ConfirmationDialog
                              title="¿Eliminar este registro?"
                              description="Esta acción no se puede deshacer. El registro se eliminará permanentemente de la base de datos."
                              onConfirm={() => handleDelete(speciesProduct.id)}
                              triggerBtn={
                                <Button variant="outline" size="icon">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              }
                              cancelBtn={<Button variant="outline">Cancelar</Button>}
                              confirmBtn={<Button variant="destructive">Eliminar</Button>}
                            />
                          ) : (
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleReactivate(speciesProduct.id)}
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
                <p>No se ha registrado ningún producto por especie</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
