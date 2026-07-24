"use client";

import { Trash2Icon } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/confirmation-dialog";
import { deleteClinicalSignService } from "../server/db/clinical-signs.service";
import { ClinicalSign } from "../domain/clinical-signs.domain";
import { CLINICAL_SIGNS_TAG } from "../constants/clinical-signs.constants";

export function DeleteClinicalSigns({
  clinicalSign,
}: {
  clinicalSign: ClinicalSign;
}) {
  const queryClient = useQueryClient();

  const handleDelete = async () => {
    try {
      await deleteClinicalSignService(clinicalSign.id);

      await queryClient.invalidateQueries({
        queryKey: [CLINICAL_SIGNS_TAG],
      });

      toast.success("Signo clínico eliminado exitosamente");
    } catch (error: any) {
      const { data } = await error.response.json();
      toast.error(data);
    }
  };

  return (
    <ConfirmationDialog
      title="¿Estás seguro de que deseas eliminar este signo clínico?"
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
