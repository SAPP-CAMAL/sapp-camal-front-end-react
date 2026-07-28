"use client";

import { useState } from "react";
import {
  KeyRound,
  RotateCcw,
  Trash2,
  XIcon,
  Check,
  EyeIcon,
  EyeOffIcon,
} from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ConfirmationDialog } from "@/components/confirmation-dialog";

import { NewEnvironmentVariable } from "./components/new-environment-variable";
import { UpdateEnvironmentVariable } from "./components/update-environment-variable";
import { ENVIRONMENT_VARIABLES_LIST_TAG } from "./constants";
import {
  deleteEnvironmentVariableService,
  getAllEnvironmentVariablesService,
  updateEnvironmentVariableService,
} from "./server/db/environment-variables.service";

const LONG_VALUE_THRESHOLD = 60;

function MaskedToken({ value }: { value: string }) {
  const [visible, setVisible] = useState(false);
  const [open, setOpen] = useState(false);
  const isLong = value.length > LONG_VALUE_THRESHOLD;

  const displayValue = visible
    ? isLong
      ? `${value.slice(0, LONG_VALUE_THRESHOLD)}…`
      : value
    : "•".repeat(Math.min(value.length, 16) || 8);

  return (
    <div className="flex items-center gap-2 max-w-[260px]">
      <span className="font-mono text-sm truncate">{displayValue}</span>
      <button
        type="button"
        className="text-gray-500 shrink-0"
        onClick={() => setVisible((prev) => !prev)}
      >
        {visible ? (
          <EyeOffIcon className="h-4 w-4" />
        ) : (
          <EyeIcon className="h-4 w-4" />
        )}
      </button>
      {visible && isLong && (
        <>
          <button
            type="button"
            className="text-gray-500 shrink-0 text-xs underline whitespace-nowrap"
            onClick={() => setOpen(true)}
          >
            Ver completo
          </button>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="max-h-[80vh] overflow-y-auto max-w-2xl">
              <DialogHeader>
                <DialogTitle>Valor completo</DialogTitle>
              </DialogHeader>
              <pre className="whitespace-pre-wrap break-all text-sm font-mono bg-gray-50 p-3 rounded-md">
                {value}
              </pre>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
}

export function EnvironmentVariablesManagement() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: [ENVIRONMENT_VARIABLES_LIST_TAG],
    queryFn: getAllEnvironmentVariablesService,
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: [ENVIRONMENT_VARIABLES_LIST_TAG] });

  const handleDeactivate = async (id: number) => {
    try {
      await deleteEnvironmentVariableService(id);
      toast.success("Variable desactivada exitosamente");
      invalidate();
    } catch (error: any) {
      const { data } = await error.response.json();
      toast.error(data);
    }
  };

  const handleReactivate = async (id: number) => {
    try {
      await updateEnvironmentVariableService(id, { status: true });
      toast.success("Variable reactivada exitosamente");
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
            <KeyRound />
            Variables de Entorno del Sistema
          </h1>
          <p className="text-gray-600 text-sm mt-1">
            Configuración técnica sensible (API keys, tokens de integraciones
            externas). Acceso restringido a Administrador.
          </p>
        </div>
        <div className="flex gap-x-2">
          <NewEnvironmentVariable />
        </div>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Variables registradas</CardTitle>
          <CardDescription>
            Los valores están ocultos por defecto — usa el ícono para
            revelarlos.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="hidden lg:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Tipo</TableHead>
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
                  items.map((environmentVariable) => (
                    <TableRow key={environmentVariable.id}>
                      <TableCell>{environmentVariable.name}</TableCell>
                      <TableCell>
                        <MaskedToken value={environmentVariable.token} />
                      </TableCell>
                      <TableCell>{environmentVariable.typeData}</TableCell>
                      <TableCell>
                        <Badge variant={environmentVariable.status ? "default" : "secondary"}>
                          {environmentVariable.status ? "Activo" : "Inactivo"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-center gap-2">
                          <UpdateEnvironmentVariable
                            environmentVariable={environmentVariable}
                          />
                          {environmentVariable.status ? (
                            <ConfirmationDialog
                              title="¿Desactivar esta variable?"
                              description="El registro dejará de estar activo. Podrás reactivarlo luego si lo necesitas."
                              onConfirm={() => handleDeactivate(environmentVariable.id)}
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
                              onClick={() => handleReactivate(environmentVariable.id)}
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
                      No se ha registrado ninguna variable de entorno
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
                {items.map((environmentVariable) => (
                  <Card key={environmentVariable.id} className="overflow-hidden border-gray-200">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                            Nombre
                          </span>
                          <div className="text-sm">{environmentVariable.name}</div>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                            Valor
                          </span>
                          <div className="text-sm">
                            <MaskedToken value={environmentVariable.token} />
                          </div>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                            Tipo
                          </span>
                          <div className="text-sm">{environmentVariable.typeData}</div>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                            Estado
                          </span>
                          <div>
                            <Badge variant={environmentVariable.status ? "default" : "secondary"}>
                              {environmentVariable.status ? "Activo" : "Inactivo"}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex justify-center gap-2 pt-2">
                          <UpdateEnvironmentVariable
                            environmentVariable={environmentVariable}
                          />
                          {environmentVariable.status ? (
                            <ConfirmationDialog
                              title="¿Desactivar esta variable?"
                              description="El registro dejará de estar activo. Podrás reactivarlo luego si lo necesitas."
                              onConfirm={() => handleDeactivate(environmentVariable.id)}
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
                              onClick={() => handleReactivate(environmentVariable.id)}
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
                <p>No se ha registrado ninguna variable de entorno</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
