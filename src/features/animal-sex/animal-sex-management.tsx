"use client";

import { VenusAndMars, RotateCcw, Trash2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
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

import { NewAnimalSex } from "./components/new-animal-sex";
import { UpdateAnimalSex } from "./components/update-animal-sex";
import { useAllAnimalSex } from "./hooks";
import { ANIMAL_SEX_LIST_TAG } from "./constants";
import {
  deleteAnimalSexPermanentlyService,
  updateAnimalSexService,
} from "./server/db/animal-sex.service";

export function AnimalSexManagement() {
  const queryClient = useQueryClient();
  const query = useAllAnimalSex();

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: [ANIMAL_SEX_LIST_TAG] });

  const handleDelete = async (id: number) => {
    try {
      await deleteAnimalSexPermanentlyService(id);
      toast.success("Registro eliminado permanentemente");
      invalidate();
    } catch (error: any) {
      const { data } = await error.response.json();
      toast.error(data);
    }
  };

  const handleReactivate = async (id: number) => {
    try {
      await updateAnimalSexService(id, { status: true });
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
            <VenusAndMars />
            Sexo del Animal
          </h1>
          <p className="text-gray-600 text-sm mt-1">
            Catálogo base transversal (macho/hembra) usado en certificados,
            etapas productivas y productos por especie.
          </p>
        </div>
        <div className="flex gap-x-2">
          <NewAnimalSex />
        </div>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Valores registrados</CardTitle>
          <CardDescription>
            Los códigos existentes (M, H) son usados por otras pantallas del
            sistema — evita cambiarlos salvo que estés seguro.
          </CardDescription>
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
                  items.map((animalSex) => (
                    <TableRow key={animalSex.id}>
                      <TableCell>{animalSex.code}</TableCell>
                      <TableCell>{animalSex.name}</TableCell>
                      <TableCell className="max-w-[300px] truncate">
                        {animalSex.description || "-"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={animalSex.status ? "default" : "secondary"}>
                          {animalSex.status ? "Activo" : "Inactivo"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-center gap-2">
                          <UpdateAnimalSex animalSex={animalSex} />
                          {animalSex.status ? (
                            <ConfirmationDialog
                              title="¿Eliminar este registro?"
                              description="Esta acción no se puede deshacer. El registro se eliminará permanentemente de la base de datos."
                              onConfirm={() => handleDelete(animalSex.id)}
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
                              onClick={() => handleReactivate(animalSex.id)}
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
                      No se ha registrado ningún valor
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
                {items.map((animalSex) => (
                  <Card key={animalSex.id} className="overflow-hidden border-gray-200">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                            Código
                          </span>
                          <div className="text-sm">{animalSex.code}</div>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                            Nombre
                          </span>
                          <div className="text-sm">{animalSex.name}</div>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                            Descripción
                          </span>
                          <div className="text-sm">{animalSex.description || "-"}</div>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                            Estado
                          </span>
                          <div>
                            <Badge variant={animalSex.status ? "default" : "secondary"}>
                              {animalSex.status ? "Activo" : "Inactivo"}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex justify-center gap-2 pt-2">
                          <UpdateAnimalSex animalSex={animalSex} />
                          {animalSex.status ? (
                            <ConfirmationDialog
                              title="¿Eliminar este registro?"
                              description="Esta acción no se puede deshacer. El registro se eliminará permanentemente de la base de datos."
                              onConfirm={() => handleDelete(animalSex.id)}
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
                              onClick={() => handleReactivate(animalSex.id)}
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
                <p>No se ha registrado ningún valor</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
