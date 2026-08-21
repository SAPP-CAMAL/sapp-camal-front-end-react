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
import { ReportCodesFormFields } from "./report-codes-form-fields";
import { updateReportCodeService } from "../server/db/report-codes.service";
import { NewReportCodeForm } from "./new-report-code";
import { ReportCode } from "../domain/report-codes.domain";
import { REPORT_CODES_TAG } from "../constants/report-codes.constants";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function UpdateReportCode({ reportCode }: { reportCode: ReportCode }) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const form = useForm<NewReportCodeForm>();

  useEffect(() => {
    if (open) {
      form.reset({
        code: reportCode.code,
        version: reportCode.version ?? "",
        status: String(reportCode.status),
      });
    }
  }, [open, form, reportCode]);

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      await updateReportCodeService(reportCode.id, {
        ...(form.formState.dirtyFields.code && {
          code: data.code,
        }),
        ...(form.formState.dirtyFields.version && {
          version: data.version || null,
        }),
        ...(form.formState.dirtyFields.status && {
          status: data.status === "true",
        }),
      });

      form.reset(form.formState.defaultValues);

      await queryClient.invalidateQueries({
        queryKey: [REPORT_CODES_TAG],
      });

      toast.success("Código de reporte actualizado exitosamente");
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
          Editar Código de Reporte
        </TooltipContent>
      </Tooltip>
      <DialogContent className="max-h-screen overflow-y-auto w-[95vw] sm:max-w-[60vw]">
        <DialogHeader>
          <DialogTitle>Editar Código de Reporte</DialogTitle>
          <DialogDescription>
            Modifica la información del código de reporte seleccionado.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={onSubmit}
            className="space-y-8 grid grid-cols-1 gap-2"
          >
            <ReportCodesFormFields showStatus />
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
