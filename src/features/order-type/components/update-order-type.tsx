"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { SquarePenIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { RequiredMark } from "@/components/ui/required-mark";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { updateOrderTypeService } from "../server/db/order-type.service";
import { getAllRolesService } from "@/features/roles/server/db/roles.service";
import { ORDER_TYPES_TAG } from "../constants/order-type.constants";
import { OrderType } from "../domain/order-type.domain";

type UpdateOrderTypeForm = {
  idRol: string;
  status: string;
};

export function UpdateOrderType({
  orderType,
  existingOrderTypes,
}: {
  orderType: OrderType;
  existingOrderTypes: OrderType[];
}) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const rolesQuery = useQuery({
    queryKey: ["all-roles"],
    queryFn: getAllRolesService,
  });

  const form = useForm<UpdateOrderTypeForm>();

  useEffect(() => {
    if (open) {
      form.reset({
        idRol: String(orderType.idRol),
        status: String(orderType.status),
      });
    }
  }, [open, form, orderType]);

  const existingIds = new Set(
    existingOrderTypes
      .filter((o) => o.id !== orderType.id)
      .map((o) => o.idRol)
  );
  const availableRoles = (rolesQuery.data?.data ?? []).filter(
    (role) => !existingIds.has(role.id) || role.id === orderType.idRol
  );

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      await updateOrderTypeService(orderType.id, {
        ...(form.formState.dirtyFields.idRol && {
          idRol: Number(data.idRol),
        }),
        ...(form.formState.dirtyFields.status && {
          status: data.status === "true",
        }),
      });

      form.reset(form.formState.defaultValues);

      await queryClient.invalidateQueries({
        queryKey: [ORDER_TYPES_TAG],
      });

      toast.success("Rol para pedidos actualizado exitosamente");
      setOpen(false);
    } catch (error: any) {
      const { data } = await error.response.json();
      toast.error(data);
    }
  });

  return (
    <Dialog open={open} onOpenChange={(open) => setOpen(open)}>
      <Tooltip>
        <TooltipTrigger asChild>
          <DialogTrigger asChild>
            <Button variant="outline">
              <SquarePenIcon />
            </Button>
          </DialogTrigger>
        </TooltipTrigger>
        <TooltipContent side="top" align="center" sideOffset={5} avoidCollisions>
          Editar Rol para Pedidos
        </TooltipContent>
      </Tooltip>
      <DialogContent className="max-h-screen overflow-y-auto w-[95vw] sm:max-w-[50vw]">
        <DialogHeader>
          <DialogTitle>Editar Rol para Pedidos</DialogTitle>
          <DialogDescription>
            Modifica el rol habilitado para generar pedidos de distribución.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={onSubmit} className="space-y-8 grid grid-cols-1 gap-2">
            <FormField
              control={form.control}
              name="idRol"
              rules={{ required: { value: true, message: "El rol es requerido" } }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rol <RequiredMark /></FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Seleccione un rol" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableRoles.length === 0 ? (
                        <div className="px-2 py-1.5 text-sm text-gray-500">
                          No hay roles disponibles
                        </div>
                      ) : (
                        availableRoles.map((role) => (
                          <SelectItem key={role.id} value={String(role.id)}>
                            {role.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              rules={{ required: { value: true, message: "El estado es requerido" } }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estado <RequiredMark /></FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Seleccione un estado" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="true">Activo</SelectItem>
                      <SelectItem value="false">Inactivo</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-x-2">
              <Button
                type="button"
                variant={"outline"}
                disabled={form.formState.isSubmitting}
                onClick={() => setOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={
                  form.formState.isSubmitting || availableRoles.length === 0
                }
              >
                {form.formState.isSubmitting ? "Actualizando..." : "Actualizar"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
