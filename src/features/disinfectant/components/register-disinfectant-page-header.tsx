import { toast } from "sonner";
import { CircleCheckBig, FileX, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Certificate } from "@/features/certificate/domain";
import { QrCertificateModal } from "@/features/certificate/components";
import { useDailyDisinfectionRegisterContext } from "../hooks";
import {
  getDetailRegisterVehicleByIdShippingAndCertificateCodeService,
  getShippersByIdService,
} from "@/features/shipping/server/db/shipping.service";
import { DailyRegisterFormData } from "../domain";

export const RegisterDisinfectantPageHeader = () => {
  const {
    selectedCertificate,
    handleSetSelectedCertificate,
    handleRemoveSelectedCertificate,
    handleSetSelectedFormData,
  } = useDailyDisinfectionRegisterContext();

  const handleSuccessButton = async (
    qrData: Certificate | null,
    closeModal: () => void
  ) => {
    if (qrData) handleSetSelectedCertificate(qrData);

    if (!qrData?.shippingsId) return closeModal?.();
    try {
      const shipperResponse = (await getShippersByIdService(qrData.shippingsId))
        .data;
      const registerVehicle = (
        await getDetailRegisterVehicleByIdShippingAndCertificateCodeService(
          shipperResponse.id,
          qrData.code
        )
      ).data;

      const registerVehicleData = {
        id: registerVehicle.id,
        dosage: registerVehicle.dosage,
        disinfectant: registerVehicle.disinfectant.id.toString(),
        admissionApplicationTime: registerVehicle.timeStar,
        departureApplicationTime: registerVehicle.timeEnd ?? "",
        observations: registerVehicle.commentary,
        transportedSpecie: registerVehicle.species.id,
        shipper: {
          personId: shipperResponse.person?.id,
          id: shipperResponse.id,
          firstName: shipperResponse.person?.firstName ?? "",
          lastName: shipperResponse.person?.lastName ?? "",
          identification: shipperResponse.person?.identification ?? "",
          identificationTypeId:
            shipperResponse.person?.identificationTypeId?.toString() ?? "",
          plate: shipperResponse.vehicle?.plate ?? "",
          transportType:
            shipperResponse.vehicle?.vehicleDetail?.transportType?.name ?? "",
          transportTypeId:
            shipperResponse.vehicle?.vehicleDetail?.transportType?.id?.toString() ??
            "",
          vehicleId:
            shipperResponse.vehicle?.vehicleDetail?.id?.toString() ?? "",
          vehicleType:
            shipperResponse.vehicle?.vehicleDetail?.vehicleType?.name ?? "",
          vehicleTypeId:
            shipperResponse.vehicle?.vehicleDetail?.vehicleType?.id?.toString() ??
            "",
        },
        fullName: "",
        identification: "",
        plate: "",
      } as DailyRegisterFormData;

      handleSetSelectedFormData(registerVehicleData);
    } catch (error) {
      toast.error(
        "Error al obtener los datos del transportista y el vehículo"
      );
    } finally {
      closeModal?.();
    }
  };

  return (
    <section className="mb-3 sm:mb-4 flex flex-col gap-3 sm:gap-2 sm:flex-row sm:justify-between sm:items-start">
      {/* Title */}
      <div className="flex-1">
        <h1 className="text-sm sm:text-base font-bold leading-tight">
          Registro Diario Ingreso Vehículos y Producto Utilizado en el Arco de
          Desinfección
        </h1>
      </div>

      {/* Actions */}
      <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-2 sm:flex-shrink-0">
        {/* Remove certificate button */}
        {selectedCertificate && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleRemoveSelectedCertificate()}
            className="text-xs sm:text-sm justify-start xs:justify-center"
          >
            <FileX className="h-4 w-4 mr-1.5" />
            <span className="sm:hidden">Quitar</span>
            <span className="hidden sm:inline">Quitar Certificado</span>
          </Button>
        )}

        {/* QR Certificate Modal */}
        <QrCertificateModal
          renderSuccessButton={({ qrData, closeModal }) => (
            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={() => handleSuccessButton(qrData, closeModal)}
            >
              <CircleCheckBig className="h-4 w-4 mr-1.5" />
              Finalizar
            </Button>
          )}
        />
      </div>
    </section>
  );
};
