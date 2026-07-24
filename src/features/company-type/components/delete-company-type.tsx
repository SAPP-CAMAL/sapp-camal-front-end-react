"use client";

import { Trash2Icon } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/confirmation-dialog";
import { deleteCompanyTypeService } from "../server/db/company-type.service";
import { CompanyType } from "../domain/company-type.domain";
import { COMPANY_TYPE_TAG } from "../constants/company-type.constants";

export function DeleteCompanyType({ companyType }: { companyType: CompanyType }) {
  const queryClient = useQueryClient();

  const handleDelete = async () => {
    try {
      await deleteCompanyTypeService(companyType.id);

      await queryClient.invalidateQueries({
        queryKey: [COMPANY_TYPE_TAG],
      });

      toast.success("Tipo de empresa eliminado exitosamente");
    } catch (error: any) {
      const { data } = await error.response.json();
      toast.error(data);
    }
  };

  return (
    <ConfirmationDialog
      title="¿Estás seguro de que deseas eliminar este tipo de empresa?"
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
