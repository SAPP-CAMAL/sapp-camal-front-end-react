"use client";

import { Stethoscope, ShieldCheck, ShieldOff } from "lucide-react";
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

import { VETERINARIAN_LIST_TAG } from "./constants";
import {
  getAllVeterinariansService,
  updateVeterinarianAuthorizationService,
} from "./server/db/veterinarian.service";

export function VeterinarianManagement() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: [VETERINARIAN_LIST_TAG],
    queryFn: getAllVeterinariansService,
  });

  const handleToggleAuthorization = async (
    id: number,
    nextValue: boolean,
  ) => {
    try {
      await updateVeterinarianAuthorizationService(id, nextValue);
      toast.success(
        nextValue
          ? "Veterinario autorizado para distribución"
          : "Autorización de distribución revocada",
      );
      queryClient.invalidateQueries({ queryKey: [VETERINARIAN_LIST_TAG] });
    } catch (error: any) {
      const { data } = await error.response.json();
      toast.error(data);
    }
  };

  const items = query.data?.data ?? [];

  return (
    <div>
      <section className="mb-4">
        <h1 className="flex items-center gap-x-2 font-semibold text-xl">
          <Stethoscope />
          Médicos Veterinarios
        </h1>
        <p className="text-gray-600 text-sm mt-1">
          El alta de un veterinario se hace desde la pantalla de Usuarios, al
          asignarle el rol de Veterinario Antemortem o Postmortem. Aquí solo
          se administra el permiso para autorizar distribución.
        </p>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Veterinarios registrados</CardTitle>
          <CardDescription>
            Sin autorización de distribución, un veterinario no puede
            asignarse a certificados o pedidos de distribución.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Autorización de distribución</TableHead>
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
                items.map((veterinarian) => (
                  <TableRow key={veterinarian.id}>
                    <TableCell>{veterinarian.code}</TableCell>
                    <TableCell>{veterinarian.fullName || "-"}</TableCell>
                    <TableCell>
                      <Badge variant={veterinarian.status ? "default" : "secondary"}>
                        {veterinarian.status ? "Activo" : "Inactivo"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          veterinarian.authorizedDistribution
                            ? "default"
                            : "secondary"
                        }
                      >
                        {veterinarian.authorizedDistribution
                          ? "Autorizado"
                          : "No autorizado"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-center">
                        {veterinarian.authorizedDistribution ? (
                          <ConfirmationDialog
                            title="¿Revocar autorización de distribución?"
                            description="El veterinario ya no podrá asignarse a certificados o pedidos de distribución."
                            onConfirm={() =>
                              handleToggleAuthorization(veterinarian.id, false)
                            }
                            triggerBtn={
                              <Button variant="outline" size="sm">
                                <ShieldOff className="h-4 w-4 mr-1" />
                                Revocar
                              </Button>
                            }
                            cancelBtn={<Button variant="outline">No</Button>}
                            confirmBtn={
                              <Button
                                variant="ghost"
                                className="hover:bg-red-600 hover:text-white"
                              >
                                Sí, revocar
                              </Button>
                            }
                          />
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleToggleAuthorization(veterinarian.id, true)
                            }
                          >
                            <ShieldCheck className="h-4 w-4 mr-1" />
                            Autorizar
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-gray-500">
                    No hay veterinarios registrados. Asigna el rol de
                    Veterinario a un usuario desde la pantalla de Usuarios.
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
