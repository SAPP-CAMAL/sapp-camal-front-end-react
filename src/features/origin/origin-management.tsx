"use client";

import { MapPin, RotateCcw, Trash2, XIcon, Check } from "lucide-react";
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
import { deleteOriginService, updateOriginService } from "./server/db/origin.service";

export function OriginManagement() {
  const queryClient = useQueryClient();
  const query = useAllOrigins();

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: [ORIGIN_LIST_TAG] });

  const handleDeactivate = async (id: number) => {
    try {
      await deleteOriginService(id);
      toast.success("Registro desactivado exitosamente");
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
                            title="¿Desactivar este registro?"
                            description="El registro dejará de estar activo. Podrás reactivarlo luego si lo necesitas."
                            onConfirm={() => handleDeactivate(origin.id)}
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
        </CardContent>
      </Card>
    </div>
  );
}
