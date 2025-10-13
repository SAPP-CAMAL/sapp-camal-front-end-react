"use client";

import { useEffect, useState } from "react";
import { SquarePenIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { NewRoleFields } from "./role-form-fields";
import { updateRoleService } from "../server/db/roles.service";
import { getModulesWithMenusService } from "@/features/modules/server/db/modules.queries";
import { NewRoleForm } from "./new-role";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export function UpdateRol({ role }: { role: any }) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const form = useForm<NewRoleForm>();

  useEffect(() => {
    if (open) {
      form.setValue("name", role.name);
      form.setValue("description", role.description);

      (async () => {
        const modules = await getModulesWithMenusService();
        form.reset({
          name: role.name,
          description: role.description,
          modules,
        });
      })();
    }
  }, [open, form, role]);

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      await updateRoleService(role.id, {
        ...(form.formState.dirtyFields.name && {
          name: data.name,
        }),
        ...(form.formState.dirtyFields.description && {
          description: data.description,
        }),
      });

      form.reset(form.formState.defaultValues);

      await queryClient.invalidateQueries({
        queryKey: ["roles"],
      });

      toast.success("Rol actualizado exitosamente");
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
                  <Button variant={"outline"}><SquarePenIcon /></Button>
            </DialogTrigger>
          </TooltipTrigger>
          <TooltipContent side='top' align='center' sideOffset={5} avoidCollisions>
          	Editar Rol
          </TooltipContent>
        </Tooltip>
      <DialogContent className="min-w-5xl">
        <DialogHeader>
          <DialogTitle>Editar Rol del Sistema</DialogTitle>
          <DialogDescription>
            Modifica la información y permisos del rol seleccionado.
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
              <Button
                type="submit"
                disabled={
                  form.formState.isSubmitting || form.formState.isLoading
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
