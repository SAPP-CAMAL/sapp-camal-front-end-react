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
import { VisitorCompanyFormFields } from "./visitor-company-form-fields";
import { updateVisitorCompanyService } from "../server/db/visitor-company.service";
import { NewVisitorCompanyForm } from "./new-visitor-company";
import { VisitorCompany } from "../domain/visitor-company.domain";
import { VISITOR_COMPANY_TAG } from "../constants/visitor-company.constants";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function UpdateVisitorCompany({ visitorCompany }: { visitorCompany: VisitorCompany }) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const form = useForm<NewVisitorCompanyForm>();

  useEffect(() => {
    if (open) {
      form.reset({
        name: visitorCompany.name,
        ruc: visitorCompany.ruc,
        idCompanyType: String(visitorCompany.idCompanyType),
        phone: visitorCompany.phone ?? "",
        email: visitorCompany.email ?? "",
        address: visitorCompany.address ?? "",
      });
    }
  }, [open, form, visitorCompany]);

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      await updateVisitorCompanyService(visitorCompany.id, {
        ...(form.formState.dirtyFields.name && { name: data.name }),
        ...(form.formState.dirtyFields.ruc && { ruc: data.ruc }),
        ...(form.formState.dirtyFields.idCompanyType && {
          idCompanyType: Number(data.idCompanyType),
        }),
        ...(form.formState.dirtyFields.phone && { phone: data.phone }),
        ...(form.formState.dirtyFields.email && { email: data.email }),
        ...(form.formState.dirtyFields.address && { address: data.address }),
      });

      form.reset(form.formState.defaultValues);

      await queryClient.invalidateQueries({
        queryKey: [VISITOR_COMPANY_TAG],
      });

      toast.success("Empresa visitante actualizada exitosamente");
      setOpen(false);
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
            <Button variant={"outline"}>
              <SquarePenIcon />
            </Button>
          </DialogTrigger>
        </TooltipTrigger>
        <TooltipContent
          side="top"
          align="center"
          sideOffset={5}
          avoidCollisions
        >
          Editar Empresa Visitante
        </TooltipContent>
      </Tooltip>
      <DialogContent className="max-h-screen overflow-y-auto overflow-x-hidden w-[95vw] sm:max-w-[70vw]">
        <DialogHeader>
          <DialogTitle>Editar Empresa Visitante</DialogTitle>
          <DialogDescription>
            Modifica la información de la empresa visitante seleccionada.
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
                {form.formState.isSubmitting ? "Actualizando..." : "Actualizar"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
