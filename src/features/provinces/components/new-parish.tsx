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
import { NewParishFields } from "./parish-form-fields";
import { createParishService } from "../server/db/locations-admin.service";
import { useEffect, useState } from "react";

export type NewParishForm = {
  cantonId: number;
  code: string;
  name: string;
};

const baseDefaultValues: NewParishForm = {
  cantonId: 0,
  code: "",
  name: "",
};

export function NewParish({ fixedCantonId }: { fixedCantonId?: number } = {}) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const defaultValues: NewParishForm = {
    ...baseDefaultValues,
    ...(fixedCantonId && { cantonId: fixedCantonId }),
  };

  const form = useForm<NewParishForm>({ defaultValues });

  useEffect(() => {
    if (open) {
      form.reset(defaultValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, form]);

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      await createParishService({
        cantonId: data.cantonId,
        code: data.code,
        name: data.name,
        status: true,
      });

      form.reset(defaultValues);

      await queryClient.invalidateQueries({ queryKey: ["parishes-admin"] });

      toast.success("Parroquia creada exitosamente");
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
          Crear parroquia
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-screen overflow-y-auto w-[95vw] sm:max-w-[60vw]">
        <DialogHeader>
          <DialogTitle>Nueva Parroquia</DialogTitle>
          <DialogDescription>Define una nueva parroquia.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={onSubmit} className="space-y-8 grid grid-cols-1 gap-2">
            <NewParishFields fixedCantonId={fixedCantonId} />
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
