"use client";

import { Button } from "@/components/ui/button";
import { EditIcon } from "lucide-react";
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
import { NewUserFields } from "./user-form-fields";
import { getUserByIdService } from "@/features/security/server/db/security.queries";
import { useEffect, useState } from "react";
import { updateUserAction } from "../server/db/actions.users";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function UpdateUserForm({ userId }: { userId: number }) {
  const queryClient = useQueryClient();

  const [isOpen, setIsOpen] = useState(false);

  const form = useForm();

  useEffect(() => {
    if (isOpen && userId) {
      getUserByIdService(userId).then((resp) => {
        const defaultValues = {
          personId: "",
          email: resp.data.email,
          userName: resp.data.userName,
          roles: resp.data.userRoles
            .map((userRole) => userRole.role?.id?.toString())
            .filter(Boolean), // 👈 Devuelve ["1", "2", "3"]
        };
        // console.log({ defaultValues });
        form.reset(defaultValues);
      });
    }
  }, [isOpen, userId, form]);

  const onSubmit = async (data: any) => {
    try {
      const defaultRoles = form.formState.defaultValues?.roles;
      const allRoles = data.roles;
      const newRoles = allRoles
        .filter((r: string) => !defaultRoles.includes(r))
        .map((r: any) => ({ id: Number(r), status: true }));

      const oldRoles = defaultRoles
        .filter((r: string) => !allRoles.includes(r))
        .map((role: any) => ({ id: Number(role), status: false }));

      await updateUserAction(userId, {
        ...(form.formState.dirtyFields.email && {
          email: data.email,
        }),
        ...(form.formState.dirtyFields.userName && {
          userName: data.userName,
        }),
        ...(form.formState.dirtyFields.roles && {
          roles: [...newRoles, ...oldRoles],
        }),
      });

      await queryClient.invalidateQueries({
        queryKey: ["users"],
      });

      form.reset({});
      setIsOpen(false);

      toast.success("Usuario creado exitosamente");
    } catch (error: any) {
      const resp = await error.response.json();
      toast.error(`Error: ${JSON.stringify(resp?.errors ?? resp.message)}`);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => setIsOpen(open)}>
      <Tooltip>
        <TooltipTrigger asChild>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline" className="p-0">
              <EditIcon className="h-4 w-4" />
              <span className="sr-only">Editar usuario</span>
              Editar
            </Button>
          </DialogTrigger>
        </TooltipTrigger>
        <TooltipContent
          side="top"
          align="center"
          sideOffset={5}
          avoidCollisions
        >
          Editar Usuario
        </TooltipContent>
      </Tooltip>
      <DialogContent 
      className="max-h-[90vh] overflow-hidden flex flex-col max-w-3xl"
      >
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Actualizar Usuario</DialogTitle>
          <DialogDescription>
            Complete la información del usuario. Los campos marcados con (*) son
            obligatorios.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col flex-1 overflow-hidden"
          >
            <div className="overflow-y-auto flex-1 px-1 -mx-1">
              <div className="space-y-4 grid grid-cols-2 gap-4 pb-4">
                <NewUserFields isUpdate />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t mt-4 flex-shrink-0">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsOpen(false)}
                disabled={form.formState.isSubmitting}
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
