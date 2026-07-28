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
import { NewMenuFields } from "./menu-form-fields";
import { createMenuService } from "../server/db/menus.service";
import { useEffect, useState } from "react";

export type NewMenuForm = {
  moduleId: number;
  parentId: number | null;
  menuName: string;
  icon: string;
  url: string;
  sequence: number;
  status: string;
};

const baseDefaultValues: NewMenuForm = {
  moduleId: 0,
  parentId: null,
  menuName: "",
  icon: "",
  url: "",
  sequence: 1,
  status: "true",
};

export function NewMenu({ fixedModuleId }: { fixedModuleId?: number } = {}) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const defaultValues: NewMenuForm = {
    ...baseDefaultValues,
    ...(fixedModuleId && { moduleId: fixedModuleId }),
  };

  const form = useForm<NewMenuForm>({ defaultValues });

  useEffect(() => {
    if (open) {
      form.reset(defaultValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, form]);

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      await createMenuService({
        moduleId: data.moduleId,
        parentId: data.parentId,
        menuName: data.menuName,
        icon: data.icon || undefined,
        url: data.url || undefined,
        sequence: data.sequence,
      });

      form.reset(defaultValues);

      await queryClient.invalidateQueries({
        queryKey: ["menus-admin"],
      });

      toast.success("Menú creado exitosamente");
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
          Crear menú
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-screen overflow-y-auto w-[95vw] sm:max-w-[60vw]">
        <DialogHeader>
          <DialogTitle>Nuevo Menú</DialogTitle>
          <DialogDescription>
            Define un nuevo ítem del árbol de navegación.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={onSubmit}
            className="space-y-8 grid grid-cols-1 gap-2"
          >
            <NewMenuFields fixedModuleId={fixedModuleId} />
            <div className="flex justify-end col-span-2 gap-x-2">
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
                  form.formState.isSubmitting || form.formState.isLoading
                }
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
