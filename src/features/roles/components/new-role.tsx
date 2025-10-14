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
import { NewRoleFields } from "./role-form-fields";
import { createRoleService } from "../server/db/roles.service";
import { getModulesWithMenusService } from "@/features/modules/server/db/modules.queries";
import { ResponseModuleWithMenus } from "@/features/modules/domain/module.domain";
import { useEffect, useState } from "react";

export type NewRoleForm = {
  name: string;
  description: string;
  modules?: ResponseModuleWithMenus;
};

const defaultValues: NewRoleForm = {
  name: "",
  description: "",
  modules: [],
};

export function NewRol() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const form = useForm<NewRoleForm>({ defaultValues });

  useEffect(() => {
    if (open) {
      (async () => {
        const modules = await getModulesWithMenusService();
        form.reset({
          ...defaultValues,
          modules,
        });
      })();
    }
  }, [open, form]);

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      await createRoleService({
        name: data.name,
        description: data.description,
      });

      form.reset(defaultValues);

      await queryClient.invalidateQueries({
        queryKey: ["roles"],
      });

      toast.success("Rol creado exitosamente");
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
          Crear rol
        </Button>
      </DialogTrigger>
      <DialogContent className="min-w-5xl">
        <DialogHeader>
          <DialogTitle>Nuevo Rol</DialogTitle>
          <DialogDescription>
            Define un nuevo rol con sus respectivos permisos y accesos a los
            módulos del sistema.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={onSubmit}
            className="space-y-8 grid grid-cols-1 gap-2"
          >
            <NewRoleFields />
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
