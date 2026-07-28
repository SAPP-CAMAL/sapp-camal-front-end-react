"use client";

import { MapPin, RotateCcw, Trash2 } from "lucide-react";
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

import { NewOrigin } from "./components/new-origin";
import { UpdateOrigin } from "./components/update-origin";
import { useAllOrigins } from "./hooks/use-all-origin";
import { ORIGIN_LIST_TAG } from "./constants";
import { deleteOriginPermanentlyService, updateOriginService } from "./server/db/origin.service";

export function OriginManagement() {
  const queryClient = useQueryClient();
  const query = useAllOrigins();

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: [ORIGIN_LIST_TAG] });

  const handleDelete = async (id: number) => {
    try {
      await deleteOriginPermanentlyService(id);
      toast.success("Registro eliminado permanentemente");
      invalidate();
    } catch (error: any) {
      const { data } = await error.response.json();
      toast.error(data);
    }
  };

  const handleReactivate = async (id: number) => {
    try {
      await updateOriginService(id, { status: true });
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
            <MapPin />
            Origen
          </h1>
          <p className="text-gray-600 text-sm mt-1">
            Catálogo de procedencia de animales o productos, usado en
            certificados y despacho de distribución.
          </p>
        </div>
        <div className="flex gap-x-2">
          <NewOrigin />
        </div>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Orígenes registrados</CardTitle>
          <CardDescription>
            Listado de procedencias disponibles.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="hidden lg:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-center">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {query.isLoading ? (
                  <TableRow>
                    <TableCell colSpan={3} className="h-32 text-center animate-pulse">
                      Cargando datos...
                    </TableCell>
                  </TableRow>
                ) : items.length ? (
                  items.map((origin) => (
                    <TableRow key={origin.id}>
                      <TableCell>{origin.description}</TableCell>
                      <TableCell>
                        <Badge variant={origin.status ? "default" : "secondary"}>
                          {origin.status ? "Activo" : "Inactivo"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-center gap-2">
                          <UpdateOrigin origin={origin} />
                          {origin.status ? (
                            <ConfirmationDialog
                              title="¿Eliminar este registro?"
                              description="Esta acción no se puede deshacer. El registro se eliminará permanentemente de la base de datos."
                              onConfirm={() => handleDelete(origin.id)}
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
                              onClick={() => handleReactivate(origin.id)}
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
                    <TableCell colSpan={3} className="h-32 text-center text-gray-500">
                      No se ha registrado ningún origen
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
                {items.map((origin) => (
                  <Card key={origin.id} className="overflow-hidden border-gray-200">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                            Descripción
                          </span>
                          <div className="text-sm">{origin.description}</div>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                            Estado
                          </span>
                          <div>
                            <Badge variant={origin.status ? "default" : "secondary"}>
                              {origin.status ? "Activo" : "Inactivo"}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex justify-center gap-2 pt-2">
                          <UpdateOrigin origin={origin} />
                          {origin.status ? (
                            <ConfirmationDialog
                              title="¿Eliminar este registro?"
                              description="Esta acción no se puede deshacer. El registro se eliminará permanentemente de la base de datos."
                              onConfirm={() => handleDelete(origin.id)}
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
                              onClick={() => handleReactivate(origin.id)}
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
                <p>No se ha registrado ningún origen</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
