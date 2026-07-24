"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createOrderTypeService } from "../server/db/order-type.service";
import { getAllRolesService } from "@/features/roles/server/db/roles.service";
import { ORDER_TYPES_TAG } from "../constants/order-type.constants";
import { OrderType } from "../domain/order-type.domain";

type NewOrderTypeForm = {
  idRol: string;
};

export function NewOrderType({
  existingOrderTypes,
}: {
  existingOrderTypes: OrderType[];
}) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const rolesQuery = useQuery({
    queryKey: ["all-roles"],
    queryFn: getAllRolesService,
  });

  const defaultValues: NewOrderTypeForm = { idRol: "" };
  const form = useForm<NewOrderTypeForm>({ defaultValues });

  useEffect(() => {
    if (open) {
      form.reset(defaultValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, form]);

  const existingIds = new Set(existingOrderTypes.map((o) => o.idRol));
  const availableRoles = (rolesQuery.data?.data ?? []).filter(
    (role) => !existingIds.has(role.id)
  );

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      await createOrderTypeService({ idRol: Number(data.idRol) });

      await queryClient.invalidateQueries({
        queryKey: [ORDER_TYPES_TAG],
      });

      toast.success("Rol habilitado para pedidos exitosamente");
      setOpen(false);
    } catch (error: any) {
      const { data } = await error.response.json();
      toast.error(data);
    }
  });

  return (
    <Dialog open={open} onOpenChange={(open) => setOpen(open)}>
      <DialogTrigger asChild>
        <Button>
          <PlusIcon />
          Habilitar rol
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-screen overflow-y-auto w-[95vw] sm:max-w-[50vw]">
        <DialogHeader>
          <DialogTitle>Habilitar Rol para Pedidos</DialogTitle>
          <DialogDescription>
            Selecciona un rol que podrá generar pedidos de distribución.
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
                  <FormLabel>Rol *</FormLabel>
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
                disabled={form.formState.isSubmitting || availableRoles.length === 0}
              >
                {form.formState.isSubmitting ? "Guardando..." : "Guardar"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
