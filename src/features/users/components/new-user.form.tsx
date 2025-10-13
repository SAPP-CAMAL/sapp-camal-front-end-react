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
    email: "",
    userName: "",
    password: "",
    roles: [],
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
      });

      form.reset(defaultValues);

      await queryClient.invalidateQueries({
        queryKey: ["users"],
      });

      toast.success("Persona creada exitosamente");
    } catch (error: any) {
      const { data } = await error.response.json();
      toast.error(data);
    }
  };

  return (
    <Dialog
      open={form.watch("open")}
      onOpenChange={(open) => form.setValue("open", open)}
    >
      <DialogTrigger asChild>
        <Button>
          <PlusIcon />
          Nuevo Usuario
        </Button>
      </DialogTrigger>
      <DialogContent className="min-w-4xl">
        <DialogHeader>
          <DialogTitle>Nuevo Usuario</DialogTitle>
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
            <NewUserFields />
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
