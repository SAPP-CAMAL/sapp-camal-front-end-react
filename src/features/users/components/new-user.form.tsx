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
import { NewUserFields } from "./user-form-fields";
import { createUserAction } from "../server/db/actions.users";

export function NewUser() {
  const queryClient = useQueryClient();

  const defaultValues = {
    open: false,
    personId: "",
    name: "",
    identification: "",
    email: "",
    userName: "",
    password: "",
    passwordConfirm: "",
    roles: [],
    code: "",
  };

  const form = useForm({ defaultValues });

  const onSubmit = async (data: any) => {
    try {
      await createUserAction({
        personId: Number(data.personId),
        email: data.email,
        userName: data.userName,
        password: data.password,
        roles: data.roles.map(Number),
        ...(data.code && { code: data.code } )
      });

      form.reset(defaultValues);

      await queryClient.invalidateQueries({
        queryKey: ["users"],
      });

      toast.success("Usuario creado exitosamente");
    } catch (error: any) {
      const resp = await error.response.json();
      toast.error(`Error: ${JSON.stringify(resp?.errors ?? resp.message)}`);
    }
  };

  return (
    <Dialog
      open={form.watch("open")}
      onOpenChange={(open) => form.setValue("open", open)}
    >
      <DialogTrigger asChild>
        <Button>
          <PlusIcon className="h-4 w-4" />
          Nuevo Usuario
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[95vh] overflow-hidden flex flex-col max-w-3xl">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Nuevo Usuario</DialogTitle>
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
                <NewUserFields />
              </div>
            </div>
            <div className="flex justify-end pt-4 border-t mt-4 flex-shrink-0">
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
