"use client";

import { MapPin, RotateCcw, SearchIcon, Trash2 } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { parseAsInteger, parseAsString, useQueryStates } from "nuqs";
import { useDebouncedCallback } from "use-debounce";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { PaginationFooter } from "@/components/ui/pagination-footer";

import { NewOrigin } from "./components/new-origin";
import { UpdateOrigin } from "./components/update-origin";
import { ORIGIN_LIST_TAG } from "./constants";
import {
  deleteOriginPermanentlyService,
  getOriginsPaginatedService,
  updateOriginService,
} from "./server/db/origin.service";

export function OriginManagement() {
  const queryClient = useQueryClient();

  const [searchParams, setSearchParams] = useQueryStates(
    {
      page: parseAsInteger.withDefault(1),
      limit: parseAsInteger.withDefault(10),
      description: parseAsString.withDefault(""),
    },
    { history: "push" }
  );

  const query = useQuery({
    queryKey: [ORIGIN_LIST_TAG, searchParams],
    queryFn: () =>
      getOriginsPaginatedService({
        page: searchParams.page,
        limit: searchParams.limit,
        ...(!!searchParams.description && { description: searchParams.description }),
      }),
  });

  const debounceDescription = useDebouncedCallback(
    (text: string) => setSearchParams({ description: text, page: 1 }),
    500
  );

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

  const items = query.data?.data.items ?? [];
  const meta = query.data?.data.meta;

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

      <Card className="mb-4 py-3 gap-2">
        <CardHeader className="px-4 gap-0.5">
          <CardTitle className="flex gap-2 items-center text-sm">
            Filtros de Búsqueda
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4">
          <div className="flex flex-col w-full sm:max-w-sm">
            <label className="mb-1 text-sm font-medium text-gray-700">
              Buscar por descripción
            </label>
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 z-10 h-5 w-5" />
              <Input
                type="text"
                placeholder="Buscar por descripción..."
                className="pl-10 pr-3 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2"
                defaultValue={searchParams.description}
                onChange={(e) => debounceDescription(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

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

          <PaginationFooter
            meta={{
              ...meta,
              onChangePage: (page) => setSearchParams({ page }),
              setSearchParams,
            }}
            isLoading={query.isLoading}
            hasData={!!items.length}
            onPreviousPage={() => setSearchParams({ page: searchParams.page - 1 })}
            onNextPage={() => setSearchParams({ page: searchParams.page + 1 })}
            disabledPreviousPage={searchParams.page <= 1}
            disabledNextPage={searchParams.page >= (meta?.totalPages ?? 0)}
          />
        </CardContent>
      </Card>
    </div>
  );
}
