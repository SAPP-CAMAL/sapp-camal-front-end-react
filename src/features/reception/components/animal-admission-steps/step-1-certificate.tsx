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
  ShipperModal,
} from "@/features/shipping/components";
import { BasicAnimalAdmissionAccordionHeader } from "../basic-animal-admission-accordion-header";
import { CreateUpdateCertificateModal } from "@/features/certificate/components/create-update-certificate-modal";
import { useState, useMemo } from "react";

export const Step1Certificate = () => {
  const {
    shippers,
    certificates,
    selectedShipper,
    selectedCertificate,
    searchParams,
    step1Accordion,
    isLoadingShippers,
    certificatesQuery,
    successMsg,
    isFromQR,
    selectedSpecie,
    canEditDetailsRegisterVehicle,

    // actions - state
    handleRemoveSelectedCertificate,
    handleSetSelectedCertificate,
    handleSetSelectedShipper,
    handleRemoveSelectedShipper,
    handleChangeStep1,
    handleSetSelectedSpecie,
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
        <div className="space-y-3 sm:space-y-4 px-3 sm:px-4 pt-3 sm:pt-4">
          {/* Select certificate number */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <Label className="text-sm">
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
                  <Button size="sm" className="h-8 sm:h-9 text-xs sm:text-sm">
                    <Plus className="h-4 w-4" />
                    <span className="hidden xs:inline ml-1">Crear Nuevo</span>
                    <span className="xs:hidden ml-1">Nuevo</span>
                  </Button>
                }
              />

              {/* Qr modal */}
              <QrCertificateModal
                renderSuccessButton={({ qrData, closeModal }) => (
                  <Button
                    size="sm"
                    className="hover:bg-primary hover:text-white h-8 sm:h-9 text-xs sm:text-sm"
                    onClick={() => handleSuccessButton(qrData, closeModal)}
                  >
                    <CircleCheckBig className="h-4 w-4" />
                    <span className="ml-1">Finalizar</span>
                  </Button>
                )}
              />
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              className="placeholder:text-muted-foreground pl-10 h-9 sm:h-10 text-sm"
              placeholder="Buscar certificado por número..."
              value={certificateNumber.value}
              onChange={(e) =>
                debounceFields("certificateNumber", e.target.value)
              }
            />
          </div>

          {/* Results */}
          {certificateNumber.state === "loading" ||
          certificatesQuery.isFetching ? (
            <Label className="opacity-50 text-xs sm:text-sm">
              Buscando certificados...
            </Label>
          ) : (
            <>
              {certificateNumber.value.length > 0 &&
                certificates.length === 0 &&
                !selectedCertificate && (
                  <Label className="opacity-50 text-xs sm:text-sm">
                    Certificados encontrados: 0
                  </Label>
                )}
              {certificateNumber.value.length > 0 &&
                certificates.length > 0 &&
                !selectedCertificate && (
                  <Label className="opacity-50 text-xs sm:text-sm">
                    Certificados encontrados: {certificates.length}
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
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 text-xs sm:text-sm"
                        >
                          <Edit className="h-4 w-4" />
                          <span className="hidden sm:inline ml-1">Editar</span>
                        </Button>
                      }
                    />
                  )
                }
                onRemove={handleRemoveSelectedCertificate}
                isSelected
              />
            ) : (
              <>
                {certificates.map((cert) => (
                  <BasicResultsCard
                    key={cert.id}
                    title={cert.code}
                    paragraph={`${cert.quantity} ${
                      cert.quantity > 1 ? "animales" : "animal"
                    } ${
                      cert.plateVehicle && `• ${cert.plateVehicle}`
                    } • ${cert.placeOrigin}`}
                    editButton={
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs sm:text-sm"
                      >
                        <Edit className="h-4 w-4" />
                        <span className="ml-1">Seleccionar</span>
                      </Button>
                    }
                    onSelect={() => handleSetSelectedCertificate(cert)}
                  />
                ))}
              </>
            )}
            {certificateNumber.value.length > 0 &&
              !selectedCertificate &&
              certificates.length === 0 && (
                <BasicResultsCard
                  title="No se encontraron certificados"
                  paragraph="Intente con otro número de certificado"
                />
              )}
          </div>

          {/* Select animal shipper */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Label className="text-sm">
                Seleccionar Transportista
                <span className="text-red-500">*</span>
              </Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="w-4 h-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent side="right" align="center">
                  Se muestran los transportistas registrados el día de hoy.
                </TooltipContent>
              </Tooltip>
            </div>
          </div>

          {/* Selected shipper card */}
          {selectedShipper ? (
            <BasicResultsCard
              title={selectedShipper.fullName}
              paragraph={`${selectedShipper.identification} • ${
                selectedShipper.plate
              } • ${toCapitalize(selectedShipper.vehicleType)}${
                selectedSpecie?.name
                  ? ` • ${toCapitalize(selectedSpecie.name)}`
                  : ""
              }${
                selectedShipper?.entryTime
                  ? ` • Ingreso: ${selectedShipper.entryTime}`
                  : ""
              }`}
              onRemove={
                canEditDetailsRegisterVehicle
                  ? handleRemoveSelectedShipper
                  : undefined
              }
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
                          entryTime: registerVehicle.timeStar || "",
                          idDetailsRegisterVehicles: registerVehicle.id,
                        });
                      }
                    }}
                    triggerButton={
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 text-xs sm:text-sm"
                      >
                        <Edit className="h-4 w-4" />
                        <span className="hidden sm:inline ml-1">Editar</span>
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
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 text-xs sm:text-sm"
                      >
                        <Edit className="h-4 w-4" />
                        <span className="hidden sm:inline ml-1">Editar</span>
                      </Button>
                    }
                  />
                )
              }
              isSelected
            />
          ) : !selectedCertificate ? (
            <div className="text-center py-6 sm:py-8 border rounded-lg bg-gray-50">
              <Label className="opacity-50 text-xs sm:text-sm">
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
                    className="placeholder:text-muted-foreground pl-10 h-9 sm:h-10 text-sm"
                    placeholder="Buscar por nombre, cédula o placa..."
                    value={shipperSearch}
                    onChange={(e) => setShipperSearch(e.target.value)}
                  />
                </div>
              )}

              {/* List of today's shippers */}
              {isLoadingShippers ? (
                <div className="text-center py-6 sm:py-8">
                  <Label className="opacity-50 text-xs sm:text-sm">
                    Cargando transportistas...
                  </Label>
                </div>
              ) : filteredShippers.length > 0 ? (
                <>
                  <div className="flex items-center justify-between">
                    <Label className="opacity-50 text-xs sm:text-sm">
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
                        Limpiar
                      </Button>
                    )}
                  </div>
                  <div className="grid gap-2 max-h-64 sm:max-h-96 overflow-y-auto border rounded-lg p-2 bg-gray-50">
                    {filteredShippers.map((shipper, index) => (
                      <BasicResultsCard
                        key={`${shipper.id}-${index}`}
                        title={shipper.person.fullName}
                        paragraph={`${shipper.person.identification} • ${
                          shipper.vehicle.plate
                        } • ${toCapitalize(
                          shipper.vehicle.vehicleDetail.vehicleType.name
                        )} • ${toCapitalize(shipper.specie.name)}${
                          shipper.entryTime
                            ? ` • Ingreso: ${shipper.entryTime}`
                            : ""
                        }`}
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
                            entryTime: shipper.entryTime || "",
                            idDetailsRegisterVehicles:
                              shipper.idDetailsRegisterVehicles,
                          });
                          setShipperSearch("");
                        }}
                      />
                    ))}
                  </div>
                </>
              ) : shippers.length > 0 ? (
                <div className="text-center py-6 sm:py-8 border rounded-lg bg-gray-50">
                  <Label className="opacity-50 text-xs sm:text-sm">
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
              size="sm"
              className={cn("h-9 sm:h-10 text-sm hover:bg-primary hover:text-white", {
                "opacity-50 pointer-events-none":
                  !selectedCertificate || !selectedShipper,
              })}
              disabled={!selectedCertificate || !selectedShipper}
              onClick={handleSaveAndContinue}
            >
              <Save className="h-4 w-4" />
              <span className="ml-1">Continuar</span>
            </Button>
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};
