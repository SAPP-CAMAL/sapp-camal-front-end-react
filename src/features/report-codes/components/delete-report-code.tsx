"use client";

import { Trash2Icon } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/confirmation-dialog";
import { deleteReportCodePermanentlyService } from "../server/db/report-codes.service";
import { ReportCode } from "../domain/report-codes.domain";
import { REPORT_CODES_TAG } from "../constants/report-codes.constants";

export function DeleteReportCode({ reportCode }: { reportCode: ReportCode }) {
  const queryClient = useQueryClient();

  const handleDelete = async () => {
    try {
      await deleteReportCodePermanentlyService(reportCode.id);

      await queryClient.invalidateQueries({
        queryKey: [REPORT_CODES_TAG],
      });

      toast.success("Código de reporte eliminado exitosamente");
    } catch (error: any) {
      const { data } = await error.response.json();
      toast.error(data);
    }
  };

  return (
    <ConfirmationDialog
      title="¿Estás seguro de que deseas eliminar este código de reporte?"
      description="Esta acción no se puede deshacer. Esto eliminará permanentemente el registro."
      onConfirm={handleDelete}
      triggerBtn={
        <Button variant="outline">
          <Trash2Icon />
        </Button>
      }
      cancelBtn={<Button variant="outline">Cancelar</Button>}
      confirmBtn={<Button variant="destructive">Eliminar</Button>}
    />
  );
}
