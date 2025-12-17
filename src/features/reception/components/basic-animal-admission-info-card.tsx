import { Check, Edit, FileText, Trash2, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnimalAdmissionItem } from "../context/reception-provider";
import { useStep2Animals } from "../hooks/use-step-2-animals";
import { ConfirmationDialog } from "@/components/confirmation-dialog";
import { corralTypesCode } from "@/features/corral/constants/corral-types-code";
import { toCapitalize } from "@/lib/toCapitalize";

interface Props {
  animalAdmissionItem: AnimalAdmissionItem;
}

export const BasicAnimalAdmissionInfoCard = ({
  animalAdmissionItem,
}: Props) => {
  const {
    selectedSpecie,
    handleRemoveAnimalAdmission,
    handleReconstructAnimalAdmissionData,
    handleDownloadTicketById,
  } = useStep2Animals();

  const isEmergency = animalAdmissionItem?.animalAdmission?.corralType?.description
    ?.toLowerCase()
    ?.startsWith(corralTypesCode.EMERGENCIA.toLowerCase());

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0 p-3 sm:p-4 pb-2">
        <CardTitle className="text-sm font-medium">
          Registro #{animalAdmissionItem.animalAdmission.id}
        </CardTitle>
        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs sm:text-sm"
            onClick={() =>
              handleReconstructAnimalAdmissionData(animalAdmissionItem)
            }
            disabled={isEmergency || animalAdmissionItem.isRetrieveFormData}
          >
            <Edit className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="ml-1">
              {animalAdmissionItem.isRetrieveFormData ? "..." : "Editar"}
            </span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs sm:text-sm bg-primary hover:bg-primary hover:text-white text-white"
            onClick={() =>
              handleDownloadTicketById(animalAdmissionItem?.animalAdmission?.id!)
            }
          >
            <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="ml-1">Ticket</span>
          </Button>

          <ConfirmationDialog
            title="¿Estás seguro de que deseas eliminar este ingreso?"
            description="Esta acción no se puede deshacer. Esto eliminará permanentemente el ingreso de animales."
            onConfirm={() =>
              handleRemoveAnimalAdmission(animalAdmissionItem.randomId)
            }
            triggerBtn={
              <Button
                variant="destructive"
                size="sm"
                className="h-8 text-xs sm:text-sm"
                disabled={
                  isEmergency || animalAdmissionItem.state === "deleting"
                }
              >
                <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="ml-1 hidden xs:inline">
                  {animalAdmissionItem.state === "deleting" ? "..." : "Eliminar"}
                </span>
              </Button>
            }
            cancelBtn={
              <Button variant="outline" size="lg">
                <XIcon />
                No
              </Button>
            }
            confirmBtn={
              <Button
                variant="ghost"
                className="hover:bg-primary hover:text-white"
                size="lg"
              >
                <Check />
                Si
              </Button>
            }
          />
        </div>
      </CardHeader>
      <CardContent className="p-3 sm:p-4 pt-0 sm:pt-0">
        <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
          <div className="grid grid-cols-2 gap-2 sm:gap-4">
            <div className="flex flex-col">
              <span className="font-medium text-muted-foreground">
                Introductor:
              </span>
              <span className="truncate">
                {animalAdmissionItem?.animalAdmission?.brand?.introducer?.name}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="font-medium text-muted-foreground">
                Especie:
              </span>
              <span>{toCapitalize(selectedSpecie?.name ?? "")}</span>
            </div>
            <div className="flex flex-col">
              <span className="font-medium text-muted-foreground">
                Cantidades:
              </span>
              <span>
                H: {animalAdmissionItem?.animalAdmission?.females || 0}, M:{" "}
                {animalAdmissionItem?.animalAdmission?.males || 0}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="font-medium text-muted-foreground">
                Fecha Faen.:
              </span>
              <span>
                {animalAdmissionItem?.animalAdmission?.date?.split("T")[0] ||
                  "N/A"}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="font-medium text-muted-foreground">
                Tipo Corral:
              </span>
              <span className="truncate">
                {animalAdmissionItem?.animalAdmission?.corralType?.description}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="font-medium text-muted-foreground">
                Corral:
              </span>
              <span>
                {animalAdmissionItem?.animalAdmission?.corral?.name ||
                  animalAdmissionItem.retrievedFromApi?.statusCorrals.corral
                    .name ||
                  ""}
              </span>
            </div>
            <div className="flex flex-col col-span-2">
              <span className="font-medium text-muted-foreground">
                Observación:
              </span>
              <span className="truncate">
                {animalAdmissionItem?.animalAdmission?.observations || "N/A"}
              </span>
            </div>
            {animalAdmissionItem?.animalAdmission?.finishType?.name && (
              <div className="flex flex-col">
                <span className="font-medium text-muted-foreground">
                  Tipo acabado:
                </span>
                <span>
                  {toCapitalize(
                    animalAdmissionItem?.animalAdmission?.finishType?.name ||
                      animalAdmissionItem?.animalAdmission?.corralGroup?.name ||
                      ""
                  )}
                </span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
