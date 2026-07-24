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
import { Input } from "@/components/ui/input";
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
import { createDetailDistributionService, getActiveProductsService } from "../server/db/distribution-product.service";
import { DETAIL_DISTRIBUTIONS_TAG, DISTRIBUTION_HEALTH_PRODUCTS_TAG } from "../constants/distribution-product.constants";

type NewDetailDistributionForm = {
  idProduct: string;
  quantity: number;
  adressee: string;
};

const defaultValues: NewDetailDistributionForm = {
  idProduct: "",
  quantity: undefined as unknown as number,
  adressee: "",
};

export function NewDetailDistribution({
  idDistributionProduct,
}: {
  idDistributionProduct: number;
}) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const productsQuery = useQuery({
    queryKey: [DISTRIBUTION_HEALTH_PRODUCTS_TAG],
    queryFn: getActiveProductsService,
  });

  const activeProducts = (productsQuery.data?.data ?? []).filter((p) => p.status);

  const form = useForm<NewDetailDistributionForm>({ defaultValues });

  useEffect(() => {
    if (open) {
      form.reset(defaultValues);
    }
  }, [open, form]);

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      await createDetailDistributionService({
        idDistributionProduct,
        idProduct: Number(data.idProduct),
        quantity: data.quantity,
        adressee: data.adressee || null,
      });

      await queryClient.invalidateQueries({
        queryKey: [DETAIL_DISTRIBUTIONS_TAG, idDistributionProduct],
      });

      toast.success("Producto agregado exitosamente");
      setOpen(false);
    } catch (error: any) {
      const { data } = await error.response.json();
      toast.error(data);
    }
  });

  return (
    <Dialog open={open} onOpenChange={(open) => setOpen(open)}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <PlusIcon className="h-4 w-4" />
          Agregar producto
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-screen overflow-y-auto w-[95vw] sm:max-w-[50vw]">
        <DialogHeader>
          <DialogTitle>Agregar Producto al Despacho</DialogTitle>
          <DialogDescription>
            Selecciona el producto, la cantidad y el destinatario.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={onSubmit} className="space-y-8 grid grid-cols-1 gap-2">
            <FormField
              control={form.control}
              name="idProduct"
              rules={{ required: { value: true, message: "El producto es requerido" } }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Producto *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Seleccione un producto" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {activeProducts.map((product) => (
                        <SelectItem key={product.id} value={String(product.id)}>
                          {product.description}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="quantity"
              rules={{
                required: { value: true, message: "La cantidad es requerida" },
                min: { value: 1, message: "La cantidad debe ser mayor a 0" },
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cantidad *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      min={1}
                      onChange={(e) => field.onChange(e.target.valueAsNumber)}
                      value={Number.isNaN(field.value) ? "" : field.value}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="adressee"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Destinatario</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
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
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Guardando..." : "Guardar"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
