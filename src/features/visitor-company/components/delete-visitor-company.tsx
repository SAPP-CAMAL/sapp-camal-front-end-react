"use client";

import { Trash2Icon } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/confirmation-dialog";
import { deleteVisitorCompanyPermanentlyService } from "../server/db/visitor-company.service";
import { VisitorCompany } from "../domain/visitor-company.domain";
import { VISITOR_COMPANY_TAG } from "../constants/visitor-company.constants";

export function DeleteVisitorCompany({ visitorCompany }: { visitorCompany: VisitorCompany }) {
  const queryClient = useQueryClient();

  const handleDelete = async () => {
    try {
      await deleteVisitorCompanyPermanentlyService(visitorCompany.id);

      await queryClient.invalidateQueries({
        queryKey: [VISITOR_COMPANY_TAG],
      });

      toast.success("Empresa visitante eliminada exitosamente");
    } catch (error: any) {
      const { data } = await error.response.json();
      toast.error(data);
    }
  };

  return (
    <ConfirmationDialog
      title="¿Estás seguro de que deseas eliminar esta empresa visitante?"
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
