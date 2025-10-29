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
import { NewCompanyFields } from "./company-form-fields";
import { createVisitorCompanyService } from "../server/db/visitor-log.service";

export function NewCompany() {
  const queryClient = useQueryClient();

  const defaultValues = {
    open: false,
    type: "",
    identification: "",
    name: "",
    phone: "",
    email: "",
    address: "",
    status: "true",
  };

  const form = useForm({ defaultValues });

  const onSubmit = async (data: any) => {
    await createVisitorCompanyService({
      idCompanyType: Number(data.type),
      ruc: data.identification,
      name: data.name,
      phone: data.phone,
      email: data.email,
      address: data.address,
      status: data.status === "true",
    });

    await queryClient.refetchQueries({
      queryKey: ["visitor-company"],
    });

    form.reset(defaultValues);

    toast.success("Empresa creada exitosamente");
  };

  return (
    <Dialog
      open={form.watch("open")}
      onOpenChange={(open) => form.setValue("open", open)}
    >
      <DialogTrigger asChild>
        <Button
          type="button"
        >
          <PlusIcon />
          Nueva Empresa
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-screen overflow-y-auto min-w-[45vw]">
        <DialogHeader>
          <DialogTitle>Nueva Empresa</DialogTitle>
          <DialogDescription>
            Complete la información de la empresa. Los campos marcados con (*)
            son obligatorios.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-8 grid grid-cols-2 gap-2"
          >
            <NewCompanyFields />
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
