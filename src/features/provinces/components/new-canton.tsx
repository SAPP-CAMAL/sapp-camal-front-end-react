"use client";

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
import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { NewCantonFields } from "./canton-form-fields";
import { createCantonService } from "../server/db/locations-admin.service";
import { useEffect, useState } from "react";

export type NewCantonForm = {
  provinceId: number;
  code: string;
  name: string;
  status: string;
};

const baseDefaultValues: NewCantonForm = {
  provinceId: 0,
  code: "",
  name: "",
  status: "true",
};

export function NewCanton({ fixedProvinceId }: { fixedProvinceId?: number } = {}) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const defaultValues: NewCantonForm = {
    ...baseDefaultValues,
    ...(fixedProvinceId && { provinceId: fixedProvinceId }),
  };

  const form = useForm<NewCantonForm>({ defaultValues });

  useEffect(() => {
    if (open) {
      form.reset(defaultValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, form]);

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      await createCantonService({
        provinceId: data.provinceId,
        code: data.code,
        name: data.name,
        status: true,
      });

      form.reset(defaultValues);

      await queryClient.invalidateQueries({ queryKey: ["cantons-admin"] });

      toast.success("Cantón creado exitosamente");
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
          Crear cantón
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-screen overflow-y-auto w-[95vw] sm:max-w-[60vw]">
        <DialogHeader>
          <DialogTitle>Nuevo Cantón</DialogTitle>
          <DialogDescription>Define un nuevo cantón.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={onSubmit} className="space-y-8 grid grid-cols-1 gap-2">
            <NewCantonFields fixedProvinceId={fixedProvinceId} />
            <div className="flex justify-end col-span-2 gap-x-2">
              <Button
                type="button"
                variant={"outline"}
                disabled={form.formState.isSubmitting}
                onClick={() => setOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting || form.formState.isLoading}>
                {form.formState.isSubmitting ? "Guardando..." : "Guardar"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
