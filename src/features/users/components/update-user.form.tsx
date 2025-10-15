"use client";

import { Button } from "@/components/ui/button";
import { Edit2Icon } from "lucide-react";
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
      <DialogTrigger asChild>
        <Button>
          <Edit2Icon />
        </Button>
      </DialogTrigger>
      <DialogContent 
      className="max-h-screen overflow-y-auto min-w-[60vw]"
      >
        <DialogHeader>
          <DialogTitle>Actualizar Usuario</DialogTitle>
          <DialogDescription>
            Complete la información del usuario. Los campos marcados con (*) son
            obligatorios.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-8 grid grid-cols-2 gap-2"
          >
            <NewUserFields isUpdate />
            <div className="flex justify-end col-span-2">
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
