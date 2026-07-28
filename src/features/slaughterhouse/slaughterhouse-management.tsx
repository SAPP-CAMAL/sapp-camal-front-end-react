"use client";

import { Factory, RotateCcw, Trash2 } from "lucide-react";
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

import { NewSlaughterhouse } from "./components/new-slaughterhouse";
import { UpdateSlaughterhouse } from "./components/update-slaughterhouse";
import {
  deleteSlaughterhouseService,
  getAllSlaughterhouseService,
  updateSlaughterhouseService,
} from "./server/db/slaughterhouse.service";

export function SlaughterhouseManagement() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["slaughterhouse"],
    queryFn: getAllSlaughterhouseService,
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["slaughterhouse"] });

  const handleDeactivate = async (id: number) => {
    try {
      await deleteSlaughterhouseService(id);
      toast.success("Configuración desactivada exitosamente");
      invalidate();
    } catch (error: any) {
      const { data } = await error.response.json();
      toast.error(data);
    }
  };

  const handleReactivate = async (id: number) => {
    try {
      await updateSlaughterhouseService(id, { status: true });
      toast.success("Configuración reactivada exitosamente");
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
            <Factory />
            Configuración General del Camal
          </h1>
          <p className="text-gray-600 text-sm mt-1">
            Datos institucionales base del camal (código, nombre, código
            habilitante).
          </p>
        </div>
        <div className="flex gap-x-2">
          <NewSlaughterhouse />
        </div>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Configuraciones registradas</CardTitle>
          <CardDescription>
            Normalmente existe un único registro activo, referenciado por el
            control de ingreso/salida de vehículos.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="hidden lg:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Código habilitante</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-center">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {query.isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center animate-pulse">
                      Cargando datos...
                    </TableCell>
                  </TableRow>
                ) : items.length ? (
                  items.map((slaughterhouse) => (
                    <TableRow key={slaughterhouse.id}>
                      <TableCell>{slaughterhouse.code}</TableCell>
                      <TableCell>{slaughterhouse.name}</TableCell>
                      <TableCell>{slaughterhouse.enablingCode}</TableCell>
                      <TableCell className="max-w-[300px] truncate">
                        {slaughterhouse.description}
                      </TableCell>
                      <TableCell>
                        <Badge variant={slaughterhouse.status ? "default" : "secondary"}>
                          {slaughterhouse.status ? "Activo" : "Inactivo"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-center gap-2">
                          <UpdateSlaughterhouse slaughterhouse={slaughterhouse} />
                          {slaughterhouse.status ? (
                            <ConfirmationDialog
                              title="¿Desactivar esta configuración?"
                              description="El registro dejará de estar activo. Podrás reactivarlo luego si lo necesitas."
                              onConfirm={() => handleDeactivate(slaughterhouse.id)}
                              triggerBtn={
                                <Button variant="outline" size="icon">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              }
                              cancelBtn={<Button variant="outline">Cancelar</Button>}
                              confirmBtn={<Button variant="destructive">Desactivar</Button>}
                            />
                          ) : (
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleReactivate(slaughterhouse.id)}
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
                    <TableCell colSpan={6} className="h-32 text-center text-gray-500">
                      No se ha registrado ninguna configuración del camal
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
                {items.map((slaughterhouse) => (
                  <Card key={slaughterhouse.id} className="overflow-hidden border-gray-200">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                            Código
                          </span>
                          <div className="text-sm">{slaughterhouse.code}</div>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                            Nombre
                          </span>
                          <div className="text-sm">{slaughterhouse.name}</div>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                            Código habilitante
                          </span>
                          <div className="text-sm">{slaughterhouse.enablingCode}</div>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                            Descripción
                          </span>
                          <div className="text-sm">{slaughterhouse.description}</div>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                            Estado
                          </span>
                          <div>
                            <Badge variant={slaughterhouse.status ? "default" : "secondary"}>
                              {slaughterhouse.status ? "Activo" : "Inactivo"}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex justify-center gap-2 pt-2">
                          <UpdateSlaughterhouse slaughterhouse={slaughterhouse} />
                          {slaughterhouse.status ? (
                            <ConfirmationDialog
                              title="¿Desactivar esta configuración?"
                              description="El registro dejará de estar activo. Podrás reactivarlo luego si lo necesitas."
                              onConfirm={() => handleDeactivate(slaughterhouse.id)}
                              triggerBtn={
                                <Button variant="outline" size="icon">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              }
                              cancelBtn={<Button variant="outline">Cancelar</Button>}
                              confirmBtn={<Button variant="destructive">Desactivar</Button>}
                            />
                          ) : (
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleReactivate(slaughterhouse.id)}
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
                <p>No se ha registrado ninguna configuración del camal</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
