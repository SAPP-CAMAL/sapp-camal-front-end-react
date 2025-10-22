import { CircleCheckBig, Edit, Info, Plus, Save, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toCapitalize } from "@/lib/toCapitalize";
import { ACCORDION_NAMES } from "../../constants";
import { BasicResultsCard } from "../basic-results-card";
import { useStep1Certificate } from "@/features/reception/hooks";
import { QrCertificateModal } from "@/features/certificate/components";
import { AccordionContent, AccordionItem } from "@/components/ui/accordion";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ChangeShipperModal,
  SearchShippersInput,
  ShipperModal,
} from "@/features/shipping/components";
import { BasicAnimalAdmissionAccordionHeader } from "../basic-animal-admission-accordion-header";
import { CreateUpdateCertificateModal } from "@/features/certificate/components/create-update-certificate-modal";
import { useState, useMemo } from "react";

export const Step1Certificate = () => {
  const {
    shippers,
    certificate,
    selectedShipper,
    selectedCertificate,
    searchParams,
    step1Accordion,
    isLoadingShippers,
    certificateQuery,
    successMsg,
    isFromQR,

    // actions - state
    handleRemoveSelectedCertificate,
    handleSetSelectedCertificate,
    handleSetSelectedShipper,
    handleRemoveSelectedShipper,
    handleChangeStep1,
    debounceFields,

    // action to save data
    handleSuccessButton,
    handleSaveAndContinue,
  } = useStep1Certificate();

  const { certificateNumber } = searchParams;
  const [shipperSearch, setShipperSearch] = useState("");

  // Filter shippers based on search
  const filteredShippers = useMemo(() => {
    if (!shipperSearch.trim()) return shippers;

    const searchLower = shipperSearch.toLowerCase();
    return shippers.filter((shipper) => {
      const fullName = shipper.person.fullName.toLowerCase();
      const identification = shipper.person.identification.toLowerCase();
      const plate = shipper.vehicle.plate.toLowerCase();

      return (
        fullName.includes(searchLower) ||
        identification.includes(searchLower) ||
        plate.includes(searchLower)
      );
    });
  }, [shippers, shipperSearch]);

  return (
    <AccordionItem
      value={ACCORDION_NAMES.STEP_1}
      className="border rounded-lg bg-white"
    >
      {/*  Accordion header*/}
      <BasicAnimalAdmissionAccordionHeader
        stepNumber={1}
        title="Ingreso del certificado de movilización"
        paragraphLines={step1Accordion.state === "completed" ? successMsg : []}
        variant={
          step1Accordion.state === "completed" && successMsg.length > 0
            ? "success"
            : "default"
        }
        onClick={handleChangeStep1}
      />

      <AccordionContent>
        <div className="space-y-4 px-4 pt-4">
          {/* Select certificate number */}
          <div className="flex items-center justify-between">
            <Label>
              Seleccionar Nro de certificado
              <span className="text-red-500">*</span>
            </Label>

            <div className="flex items-center gap-2">
              {/* Create new certificate modal */}
              <CreateUpdateCertificateModal
                onSetCertificate={(qrData) =>
                  handleSetSelectedCertificate(qrData!)
                }
                triggerButton={
                  <Button>
                    <Plus />
                    Crear Nuevo
                  </Button>
                }
              />

              {/* Qr modal */}
              <QrCertificateModal
                // extraSuccessInfoCard={<InfoCard />}
                // onSetQrData={qrData => handleSetSelectedCertificate(qrData)}
                renderSuccessButton={({ qrData, closeModal }) => (
                  <Button
                    className=" hover:bg-primary hover:text-white"
                    onClick={() => handleSuccessButton(qrData, closeModal)}
                  >
                    <CircleCheckBig />
                    Finalizar
                  </Button>
                )}
              />
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              className="placeholder:text-muted-foreground pl-10"
              placeholder="Buscar certificado por número..."
              value={certificateNumber.value}
              onChange={(e) =>
                debounceFields("certificateNumber", e.target.value)
              }
            />
          </div>

          {/* Results */}
          {certificateNumber.state === "loading" ||
          certificateQuery.isFetching ? (
            <Label className="opacity-50">Buscando certificado...</Label>
          ) : (
            <>
              {certificateNumber.value.length > 0 &&
                !certificate &&
                !selectedCertificate && (
                  <Label className="opacity-50">
                    Certificados encontrados:
                  </Label>
                )}
            </>
          )}
          <div className="grid gap-2 max-h-48 overflow-y-auto">
            {selectedCertificate ? (
              <BasicResultsCard
                title={selectedCertificate.code}
                paragraph={`${selectedCertificate.quantity} ${
                  selectedCertificate.quantity > 1 ? "animales" : "animal"
                } ${
                  selectedCertificate.plateVehicle &&
                  `• ${selectedCertificate.plateVehicle}`
                } • ${selectedCertificate.placeOrigin}`}
                editButton={
                  !isFromQR && (
                    <CreateUpdateCertificateModal
                      certificate={selectedCertificate}
                      onSetCertificate={(certificate) =>
                        handleSetSelectedCertificate(certificate!)
                      }
                      triggerButton={
                        <Button variant="outline">
                          <Edit />
                          Editar
                        </Button>
                      }
                    />
                  )
                }
                // onRemove={!isFromQR ? handleRemoveSelectedCertificate : undefined}
                onRemove={handleRemoveSelectedCertificate}
                isSelected
              />
            ) : (
              certificate && (
                <BasicResultsCard
                  title={certificate.code}
                  paragraph={`${certificate.quantity} ${
                    certificate.quantity > 1 ? "animales" : "animal"
                  } ${
                    certificate.plateVehicle && `• ${certificate.plateVehicle}`
                  } • ${certificate.placeOrigin}`}
                  editButton={
                    <Button variant="outline">
                      <Edit />
                      Seleccionar
                    </Button>
                  }
                  onSelect={() => handleSetSelectedCertificate(certificate)}
                />
              )
            )}
            {certificateNumber.value.length > 0 &&
              !selectedCertificate &&
              !certificate && (
                <BasicResultsCard
                  title="No se encontraron certificados"
                  paragraph="Intente con otro número de certificado"
                />
              )}
          </div>

          {/* Select  animal shipper */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Label>
                Seleccionar Transportista de animales
                <span className="text-red-500">*</span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="w-4 h-4" />
                  </TooltipTrigger>
                  <TooltipContent side="right" align="center">
                    Se muestran los transportistas registrados el día de hoy.
                  </TooltipContent>
                </Tooltip>
              </Label>
            </div>

            <ShipperModal
              triggerButton={
                <Button>
                  <Plus />
                  Crear Nuevo
                </Button>
              }
            />
          </div>

          {/* Selected shipper card */}
          {selectedShipper ? (
            <BasicResultsCard
              title={selectedShipper.fullName}
              paragraph={`${selectedShipper.identification} • ${
                selectedShipper.plate
              } • ${toCapitalize(selectedShipper.vehicleType)}`}
              onRemove={handleRemoveSelectedShipper}
              editButton={
                selectedCertificate ? (
                  <ChangeShipperModal
                    certificateId={selectedCertificate.id}
                    certificateCode={selectedCertificate.code}
                    onShipperChanged={(registerVehicle) => {
                      const shipping =
                        registerVehicle.registerVehicle?.shipping;
                      if (shipping) {
                        handleSetSelectedShipper({
                          id: shipping.id,
                          personId: shipping.person.id,
                          firstName: shipping.person.firstName ?? "",
                          lastName: shipping.person.lastName ?? "",
                          fullName: shipping.person.fullName ?? "",
                          identification: shipping.person.identification ?? "",
                          identificationTypeId:
                            shipping.person.identificationTypeId?.toString() ??
                            "",
                          plate: shipping.vehicle.plate,
                          vehicleId: shipping.vehicle.id.toString(),
                          vehicleTypeId:
                            shipping.vehicle.vehicleDetail.vehicleType.id.toString(),
                          vehicleType:
                            shipping.vehicle.vehicleDetail.vehicleType.name,
                          transportTypeId:
                            shipping.vehicle.vehicleDetail.transportType.id.toString(),
                          transportType:
                            shipping.vehicle.vehicleDetail.transportType.name,
                        });
                      }
                    }}
                    triggerButton={
                      <Button variant="ghost">
                        <Edit />
                        Editar
                      </Button>
                    }
                  />
                ) : (
                  <ShipperModal
                    shipperData={selectedShipper}
                    onSetShipper={(shipper) =>
                      handleSetSelectedShipper(shipper!)
                    }
                    triggerButton={
                      <Button variant="ghost">
                        <Edit />
                        Editar
                      </Button>
                    }
                  />
                )
              }
              isSelected
            />
          ) : !selectedCertificate ? (
            <div className="text-center py-8 border rounded-lg bg-gray-50">
              <Label className="opacity-50 ml-5">
                Primero debe seleccionar un certificado
              </Label>
            </div>
          ) : (
            <>
              {/* Search input for shippers */}
              {shippers.length > 0 && (
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    className="placeholder:text-muted-foreground pl-10"
                    placeholder="Buscar por nombre, cédula o placa..."
                    value={shipperSearch}
                    onChange={(e) => setShipperSearch(e.target.value)}
                  />
                </div>
              )}

              {/* List of today's shippers */}
              {isLoadingShippers ? (
                <div className="text-center py-8">
                  <Label className="opacity-50">
                    Cargando transportistas...
                  </Label>
                </div>
              ) : filteredShippers.length > 0 ? (
                <>
                  <div className="flex items-center justify-between">
                    <Label className="opacity-50">
                      {shipperSearch
                        ? `${filteredShippers.length} de ${shippers.length} transportistas`
                        : `Transportistas de hoy (${shippers.length})`}
                    </Label>
                    {shipperSearch && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShipperSearch("")}
                        className="text-xs h-7"
                      >
                        Limpiar búsqueda
                      </Button>
                    )}
                  </div>
                  <div className="grid gap-2 max-h-96 overflow-y-auto border rounded-lg p-2 bg-gray-50">
                    {filteredShippers.map((shipper) => (
                      <BasicResultsCard
                        key={shipper.id}
                        title={shipper.person.fullName}
                        paragraph={`${shipper.person.identification} • ${
                          shipper.vehicle.plate
                        } • ${toCapitalize(
                          shipper.vehicle.vehicleDetail.vehicleType.name
                        )}`}
                        onSelect={() => {
                          handleSetSelectedShipper({
                            id: shipper.id,
                            personId: shipper.person.id,
                            firstName: shipper.person.firstName,
                            lastName: shipper.person.lastName,
                            fullName: shipper.person.fullName,
                            identification: shipper.person.identification,
                            identificationTypeId:
                              shipper.person.identificationTypeId.toString(),
                            plate: shipper.vehicle.plate,
                            vehicleId: shipper.vehicle.id.toString(),
                            vehicleTypeId:
                              shipper.vehicle.vehicleDetail.vehicleType.id.toString(),
                            vehicleType:
                              shipper.vehicle.vehicleDetail.vehicleType.name,
                            transportTypeId:
                              shipper.vehicle.vehicleDetail.transportType.id.toString(),
                            transportType:
                              shipper.vehicle.vehicleDetail.transportType.name,
                          });
                          setShipperSearch(""); // Limpiar búsqueda al seleccionar
                        }}
                      />
                    ))}
                  </div>
                </>
              ) : shippers.length > 0 ? (
                <div className="text-center py-8 border rounded-lg bg-gray-50">
                  <Label className="opacity-50">
                    No se encontraron transportistas con "{shipperSearch}"
                  </Label>
                </div>
              ) : (
                <BasicResultsCard
                  title="No hay transportistas registrados hoy"
                  paragraph="Cree un nuevo transportista para continuar"
                />
              )}
            </>
          )}

          <div className="flex justify-end pt-2">
            <Button
              className={cn("hover:bg-primary hover:text-white ", {
                "opacity-50 pointer-events-none":
                  !selectedCertificate || !selectedShipper,
              })}
              disabled={!selectedCertificate || !selectedShipper}
              onClick={handleSaveAndContinue}
            >
              <Save />
              Continuar
            </Button>
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};

const InfoCard = () => (
  <div className="mt-2 p-3 bg-blue-50 border-l-4 border-blue-400 rounded-r-lg">
    <div className="flex items-start">
      <div className="flex-shrink-0">
        <Info className="w-4 h-4 text-blue-700" />
      </div>
      <div className="ml-3">
        <p className="text-sm text-blue-800 font-medium mb-1">
          Lógica del botón "Seleccionar":
        </p>
        <ul className="text-xs text-blue-700 space-y-1">
          <li>
            • Selecciona el <strong>certificado escaneado</strong> y carga los
            datos del transportista asociados a la placa.
          </li>
        </ul>
      </div>
    </div>
  </div>
);
