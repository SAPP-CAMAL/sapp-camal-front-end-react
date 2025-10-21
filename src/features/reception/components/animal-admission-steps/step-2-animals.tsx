import { AlertTriangle, ArrowBigRightDash, Info, Plus } from "lucide-react";
import { AccordionContent, AccordionItem } from "@/components/ui/accordion";
import { BasicAnimalAdmissionAccordionHeader } from "../basic-animal-admission-accordion-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ACCORDION_NAMES } from "../../constants";
import { CreateUpdateAnimalAdmissionForm } from "../create-update-animal-admission-form";
import { BasicAnimalAdmissionInfoCard } from "../basic-animal-admission-info-card";
import { useStep2Animals } from "../../hooks/use-step-2-animals";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import { toCapitalize } from "@/lib/toCapitalize";
import { useAllSpecies } from "@/features/specie/hooks/use-all-species";
import { Specie } from "@/features/specie/domain";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Step2Animals = () => {
  const {
    step2Accordion,
    selectedCertificate,
    animalAdmissionList,
    totalAnimals,
    isCompleted,
    selectedSpecie,

    handleChangeStep2,
    handleAddNewAnimalAdmission,
    handleUpdateAnimalAdmission,
    removeAnimalAdmission,
    handleNextStep3,
    handleSetSelectedSpecie,
    handleRemoveSelectedSpecie,
  } = useStep2Animals();

  const speciesQuery = useAllSpecies();
  const species: Specie[] = (speciesQuery.data?.data as Specie[]) || [];

  const [showExitDialog, setShowExitDialog] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<
    (() => void) | null
  >(null);

  // Detectar cambios sin guardar (solo formularios abiertos)
  useEffect(() => {
    const hasOpenForms = animalAdmissionList.some(
      (admission) => admission.isOpen
    );
    setHasUnsavedChanges(hasOpenForms);
  }, [animalAdmissionList]);

  // Proteger contra salida de la página sin guardar
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges && step2Accordion.isOpen) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges, step2Accordion.isOpen]);

  const handleNavigationAttempt = (navigationFn: () => void) => {
    if (hasUnsavedChanges) {
      setPendingNavigation(() => navigationFn);
      setShowExitDialog(true);
    } else {
      navigationFn();
    }
  };

  const handleConfirmExit = () => {
    if (pendingNavigation) {
      pendingNavigation();
    }
    setShowExitDialog(false);
    setPendingNavigation(null);
  };

  const handleCancelExit = () => {
    setShowExitDialog(false);
    setPendingNavigation(null);
  };

  const handleNextStep3WithValidation = () => {
    if (totalAnimals === 0) {
      return; // El botón estará deshabilitado si no hay animales
    }
    handleNextStep3();
  };

  // console.log({selectedSpecie})
  return (
    <AccordionItem value={ACCORDION_NAMES.STEP_2} className="border rounded-lg">
      {/*  Accordion header*/}
      <BasicAnimalAdmissionAccordionHeader
        stepNumber={2}
        title="Ingreso de animales del certificado"
        isDisabled={step2Accordion.state === "disabled"}
        isDisabledMessage="Debe completar el paso 1 para continuar"
        variant={step2Accordion.state === "completed" ? "success" : "default"}
        subTitle={`Animales registrados ${totalAnimals} de ${
          selectedCertificate?.quantity || 0
        }`}
        onClick={() => {
          if (step2Accordion.isOpen) {
            handleNavigationAttempt(handleChangeStep2);
          } else {
            handleChangeStep2();
          }
        }}
      />

      <AccordionContent className="p-4 space-y-4">
        {/* Select specie */}
        <div className="bg-gray-50 p-4 rounded-lg border">
          <Label className="flex items-center gap-2 mb-2">
            Especie
            <span className="text-red-500">*</span>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="w-4 h-4" />
              </TooltipTrigger>
              <TooltipContent side="top" align="center">
                {selectedSpecie
                  ? "Especie registrada desde el certificado."
                  : "Seleccione la especie de los animales a ingresar."}
              </TooltipContent>
            </Tooltip>
          </Label>

          {selectedSpecie ? (
            <div className="flex items-center justify-between">
              <span className="text-gray-600 font-medium">
                {toCapitalize(selectedSpecie.name)}
              </span>
              {animalAdmissionList.length === 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRemoveSelectedSpecie}
                  className="text-primary"
                >
                  Cambiar especie
                </Button>
              )}
            </div>
          ) : (
            <Select
              value={""}
              onValueChange={(value) => {
                const specie = species.find(
                  (s: Specie) => s.id.toString() === value
                );
                if (specie) handleSetSelectedSpecie(specie);
              }}
            >
              <SelectTrigger className="w-full bg-white">
                <SelectValue placeholder="Seleccione una especie" />
              </SelectTrigger>
              <SelectContent>
                {species.map((specie: Specie) => (
                  <SelectItem key={specie.id} value={specie.id.toString()}>
                    {toCapitalize(specie.name)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        <div className="flex justify-between items-center">
          <span />

          <Tooltip>
            <TooltipTrigger asChild>
              <span>
                <Button
                  onClick={handleAddNewAnimalAdmission}
                  disabled={isCompleted || !selectedSpecie || hasUnsavedChanges}
                >
                  <Plus />
                  Crear Nuevo
                </Button>
              </span>
            </TooltipTrigger>
            {hasUnsavedChanges && (
              <TooltipContent side="top" align="end">
                Debe guardar o cancelar el ingreso actual antes de crear uno
                nuevo
              </TooltipContent>
            )}
          </Tooltip>
        </div>

        {/* {speciesQuery.isFetching && !selectedSpecie && (
					<BasicResultsCard leftBlockClass='flex items-center justify-start gap-2' title='Cargando especies...' />
				)} */}

        {animalAdmissionList.length < 1 && (
          <div className="text-center py-8 text-muted-foreground">
            No hay ingresos registrados.{" "}
            {!selectedSpecie
              ? "Seleccione una especie para comenzar."
              : 'Haga clic en "Crear Nuevo" para agregar un ingreso.'}
          </div>
        )}

        {/* Form cards */}
        {animalAdmissionList.map((admission) => (
          <div
            key={admission.randomId + admission.animalAdmission.id}
            className="space-y-2"
          >
            {!admission.isOpen ? (
              <BasicAnimalAdmissionInfoCard animalAdmissionItem={admission} />
            ) : (
              <CreateUpdateAnimalAdmissionForm
                animalAdmissionData={admission.animalAdmission}
                onSave={(data) => {
                  const admissionData = {
                    randomId: admission.randomId,
                    animalAdmission: { ...admission.animalAdmission, ...data },
                    state: "updated" as const,
                    isOpen: false,
                    isRetrieveFormData: false,
                  };

                  handleUpdateAnimalAdmission(admissionData);
                }}
                onRemove={() => {
                  if (admission.animalAdmission.id)
                    handleUpdateAnimalAdmission({
                      ...admission,
                      isOpen: false,
                    });
                  else removeAnimalAdmission(admission.randomId);
                }}
              />
            )}
          </div>
        ))}

        <Card className="py-4">
          <CardContent className="flex items-center justify-between">
            {selectedCertificate?.quantity && (
              <>
                {isCompleted
                  ? `✅ Total correcto (${selectedCertificate.quantity} animales)`
                  : `⚠️ El total debe coincidir con el certificado (${selectedCertificate.quantity} animales)`}
              </>
            )}
            <Button variant="outline">
              {+totalAnimals}/{selectedCertificate?.quantity ?? 0}
            </Button>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <span>
                <Button
                  variant="ghost"
                  onClick={handleNextStep3WithValidation}
                  disabled={!isCompleted || hasUnsavedChanges}
                  className={
                    !isCompleted || hasUnsavedChanges
                      ? " hover:bg-primary hover:text-white text-primary cursor-not-allowed opacity-50"
                      : " hover:bg-primary hover:text-white text-primary"
                  }
                >
                  <ArrowBigRightDash />
                  Continuar con transporte
                </Button>
              </span>
            </TooltipTrigger>
            {!isCompleted && totalAnimals > 0 && (
              <TooltipContent side="top" align="end">
                Debe completar el registro de todos los animales ({totalAnimals} de {selectedCertificate?.quantity || 0})
              </TooltipContent>
            )}
            {totalAnimals === 0 && (
              <TooltipContent side="top" align="end">
                Debe registrar al menos un animal para continuar
              </TooltipContent>
            )}
            {hasUnsavedChanges && (
              <TooltipContent side="top" align="end">
                Debe guardar o cancelar los ingresos abiertos antes de continuar
              </TooltipContent>
            )}
          </Tooltip>
          {/* <ConfirmationDialog
						title={`¿Esta seguro que desea finalizar el ingreso de animales?`}
						description={`Esta acción completará el ingreso de los animales y se reiniciará el formulario para un nuevo ingreso.`}
						onConfirm={() => handleResetPage()}
						triggerBtn={
							<Button
								variant='ghost'
								className='bg-emerald-600 hover:bg-emerald-600 hover:text-white text-white'
								type='button'
								disabled={!isCompleted}
							>
								<Save />
								Finalizar ingreso de animales
							</Button>
						}
						cancelBtn={
							<Button variant='outline' size='lg'>
								<XIcon />
								Continuar editando
							</Button>
						}
						confirmBtn={
							<Button variant='ghost' className='bg-emerald-600 hover:bg-emerald-600 hover:text-white text-white' size='lg'>
								<Check />
								Si
							</Button>
						}
					/> */}
        </div>
      </AccordionContent>

      {/* Dialog de confirmación al salir sin guardar */}
      <Dialog open={showExitDialog} onOpenChange={setShowExitDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
              ¿Salir sin guardar?
            </DialogTitle>
            <DialogDescription>
              Tienes cambios sin guardar en el ingreso de animales. Si sales
              ahora, perderás todos los cambios realizados.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={handleCancelExit}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleConfirmExit}>
              Salir sin guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AccordionItem>
  );
};
