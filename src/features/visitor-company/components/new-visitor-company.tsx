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
import { VisitorCompanyFormFields } from "./visitor-company-form-fields";
import { createVisitorCompanyService } from "../server/db/visitor-company.service";
import { useEffect, useState } from "react";
import { VISITOR_COMPANY_TAG } from "../constants/visitor-company.constants";

export type NewVisitorCompanyForm = {
  name: string;
  ruc: string;
  idCompanyType: string;
  phone: string;
  email: string;
  address: string;
};

const defaultValues: NewVisitorCompanyForm = {
  name: "",
  ruc: "",
  idCompanyType: "",
  phone: "",
  email: "",
  address: "",
};

export function NewVisitorCompany() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const form = useForm<NewVisitorCompanyForm>({ defaultValues });

  useEffect(() => {
    if (open) {
      form.reset(defaultValues);
    }
  }, [open, form]);

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      await createVisitorCompanyService({
        name: data.name,
        ruc: data.ruc,
        idCompanyType: Number(data.idCompanyType),
        phone: data.phone || undefined,
        email: data.email || undefined,
        address: data.address || undefined,
      });

      form.reset(defaultValues);

      await queryClient.invalidateQueries({
        queryKey: [VISITOR_COMPANY_TAG],
      });

      toast.success("Empresa visitante creada exitosamente");
      setOpen(false);
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
          Crear empresa visitante
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-screen overflow-y-auto overflow-x-hidden w-[95vw] sm:max-w-[70vw]">
        <DialogHeader>
          <DialogTitle>Nueva Empresa Visitante</DialogTitle>
          <DialogDescription>
            Registra una nueva empresa para el ingreso de visitantes.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={onSubmit}
            className="space-y-8 grid grid-cols-1 gap-2"
          >
            <VisitorCompanyFormFields />
            <div className="flex justify-end gap-x-2">
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
