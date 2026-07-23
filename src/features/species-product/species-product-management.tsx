"use client";

import { PackageSearch, RotateCcw, Trash2, XIcon, Check } from "lucide-react";
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
  deleteSpeciesProductService,
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

  const handleDeactivate = async (id: number) => {
    try {
      await deleteSpeciesProductService(id);
      toast.success("Registro desactivado exitosamente");
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
                            title="¿Desactivar este registro?"
                            description="El registro dejará de estar activo. Podrás reactivarlo luego si lo necesitas."
                            onConfirm={() => handleDeactivate(speciesProduct.id)}
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
        </CardContent>
      </Card>
    </div>
  );
}
