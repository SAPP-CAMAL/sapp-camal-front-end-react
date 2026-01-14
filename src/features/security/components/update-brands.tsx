"use client";

import { Button } from "@/components/ui/button";
import { Brand, Introducer, Specie } from "../domain";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Loader2,
  Plus,
  Save,
  Search,
  Tag,
  ToggleLeftIcon,
  ToggleRightIcon,
  UserPlus,
  Users,
  ArrowRight,
  ArrowLeftRight,
  Settings2,
  Info,
  X,
} from "lucide-react";
import { Form } from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@radix-ui/react-label";
import { Input } from "@/components/ui/input";
import {
  createBrandService,
  getIntroducersService,
  updateBrandService,
  reassignBrandService,
} from "../server/db/security.queries";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { updateBrandsStatus } from "@/features/brand/server/db/brand.service";

export type UpdateBrandsForm = {
  name: string;
  description: string;
};

const defaultValues: UpdateBrandsForm = {
  name: "",
  description: "",
};

type NewIntroductorProps = {
  species: Specie[];
  introductor: Introducer;
  onRefresh: () => void;
};

// Función para formatear errores de validación de la API
const formatValidationErrors = (errors: Record<string, string>): string => {
  const errorMessages = Object.values(errors);
  if (errorMessages.length === 1) {
    return errorMessages[0];
  }
  return errorMessages.map((msg, idx) => `${idx + 1}. ${msg}`).join('\n');
};

export function UpdateBrands({
  species,
  introductor,
  onRefresh,
}: NewIntroductorProps) {
  const form = useForm<UpdateBrandsForm>();
  const [open, setOpen] = useState(false);
  const [activeView, setActiveView] = useState<'status' | 'assign'>('status');
  
  // States for Assign View (Reassignment)
  const [selectedBrandToReassign, setSelectedBrandToReassign] = useState<Brand | null>(null);
  const [targetIntroducerSearch, setTargetIntroducerSearch] = useState('');
  const [foundTargetIntroducers, setFoundTargetIntroducers] = useState<Introducer[]>([]);
  const [isSearchingTarget, setIsSearchingTarget] = useState(false);
  const [isConfirmingTransfer, setIsConfirmingTransfer] = useState(false);
  const [targetIntroToAssign, setTargetIntroToAssign] = useState<Introducer | null>(null);
  
  const [brandToToggle, setBrandToToggle] = useState<number | null>(null);
  const [isActive, setIsActive] = useState<Record<number, boolean>>({});
  const [selectedSpecies, setSelectedSpecies] = useState<
    Record<number, Specie[]>
  >(() =>
    introductor.brands.reduce((acc, brand) => {
      acc[brand.id] = brand.species.map((s: any) => {
        if (typeof s === "string") {
          const foundSpecie = species.find((specie) => specie.name === s);
          return foundSpecie || { id: 0, name: s };
        }
        return s;
      });
      return acc;
    }, {} as Record<number, Specie[]>)
  );
  const [newBrandSpecies, setNewBrandSpecies] = useState<Specie[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showNewBrandCard, setShowNewBrandCard] = useState(false);
  const [brandNames, setBrandNames] = useState<Record<number, string>>(() =>
    introductor.brands.reduce((acc, brand) => {
      acc[brand.id] = brand.name;
      return acc;
    }, {} as Record<number, string>)
  );

  useEffect(() => {
    if (open) {
      (async () => {
        form.reset({
          ...defaultValues,
        });
      })();
    }
  }, [open, form]);

  function handleCheckboxChange(
    brandId: number,
    specie: Specie,
    checked: boolean
  ) {
    setSelectedSpecies((prev) => {
      const current = prev[brandId] || [];
      return {
        ...prev,
        [brandId]: checked
          ? [...current, specie]
          : current.filter((s) => s.id !== specie.id),
      };
    });
  }

  function handleBrandNameChange(brandId: number, newName: string) {
    setBrandNames((prev) => ({
      ...prev,
      [brandId]: newName,
    }));
  }

  function handleNewBrandCheckboxChange(specie: Specie, checked: boolean) {
    setNewBrandSpecies((prev) =>
      checked ? [...prev, specie] : prev.filter((s) => s.id !== specie.id)
    );
  }

  const handleSaveBrands = async () => {
    const description = form.getValues("description");
    if (!description || description.trim() === "") {
      return toast.warning("El nombre de la marca es requerido");
    }

    if (newBrandSpecies.length === 0) {
      return toast.warning("Debe seleccionar al menos una especie");
    }

    setIsSubmitting(true);

    try {
      const brand = await createBrandService({
        introducerId: introductor.id,
        description: description.trim(),
        name: description.trim(),
        speciesIds: newBrandSpecies.map((specie) => specie.id),
      });

      toast.success("Marca creada exitosamente");
      form.reset({ description: "" });
      setNewBrandSpecies([]);
      handleCloseModal();
    } catch (error: any) {
      console.error("Error al crear la marca:", error);
      
      // Intentar obtener el mensaje de error del backend
      if (error.response) {
        try {
          const errorData = await error.response.json();
          console.error("Error data:", errorData);
          
          // Si hay errores de validación, formatearlos elegantemente
          if (errorData.errors && typeof errorData.errors === 'object') {
            const formattedErrors = formatValidationErrors(errorData.errors);
            toast.error(formattedErrors, {
              duration: 5000,
              style: { whiteSpace: 'pre-line' }
            });
          } else {
            toast.error(errorData.message || "Error al crear la marca");
          }
        } catch {
          toast.error("Error al crear la marca. Verifica los datos.");
        }
      } else {
        toast.error("Error al crear la marca");
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleUpdateBrand = async (brandId: number) => {
    const brandName = brandNames[brandId];
    const brandSpecies = selectedSpecies[brandId] || [];

    if (!brandName || brandName.trim() === "") {
      return toast.warning("El nombre de la marca es requerido");
    }

    if (brandSpecies.length === 0) {
      return toast.warning(
        "Debe seleccionar al menos una especie para la marca"
      );
    }

    setIsSubmitting(true);

    try {
      const payload = {
        name: brandName.trim(),
        description: brandName.trim(),
        species: species.map((s) => ({
          id: s.id,
          status: (selectedSpecies[brandId] || []).some((selected) => selected.id === s.id)
        })),
      };

      console.log("Payload enviado:", payload);

      const updatedBrand = await updateBrandService(brandId, payload);

      toast.success(`Marca "${brandName}" actualizada exitosamente`);
      handleCloseModal();
    } catch (error: any) {
      console.error("Error al actualizar la marca:", error);
      
      // Intentar obtener el mensaje de error del backend
      if (error.response) {
        try {
          const errorData = await error.response.json();
          console.error("Error data:", errorData);
          
          // Si hay errores de validación, formatearlos elegantemente
          if (errorData.errors && typeof errorData.errors === 'object') {
            const formattedErrors = formatValidationErrors(errorData.errors);
            toast.error(formattedErrors, {
              duration: 5000,
              style: { whiteSpace: 'pre-line' }
            });
          } else {
            toast.error(errorData.message || "Error al actualizar la marca");
          }
        } catch {
          toast.error("Error al actualizar la marca. Verifica los datos.");
        }
      } else {
        toast.error("Error al actualizar la marca");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setBrandNames({});
    setOpen(false);
    onRefresh();
  };

  const confirmToggleStatus = async () => {
    if (brandToToggle === null) return;
    
    // Determine the new status based on current status
    const currentStatus = isActive[brandToToggle];
    const newStatus = !currentStatus;

    // Proceed with status change
    await changeBrandStatus(brandToToggle, newStatus);
    setBrandToToggle(null);
  };

  const changeBrandStatus = async (brandId: number, newStatus: boolean) => {
    // Optimistic update
    setIsActive((prev) => ({
      ...prev,
      [brandId]: newStatus,
    }));

    try {
      await updateBrandsStatus(brandId, newStatus);
      toast.success(
        newStatus
          ? "Marca activada exitosamente."
          : "Marca inactivada exitosamente."
      );
      handleCloseModal();
    } catch (error) {
      // Revert optimization
      setIsActive((prev) => ({
        ...prev,
        [brandId]: !newStatus,
      }));

      toast.error("No se pudo actualizar el estado de la marca.");
      console.error(error);
    }
  };

  const handleToggleStatus = (brandId: number) => {
    // Always ask for confirmation for both activation and inactivation
    setBrandToToggle(brandId);
  };

  const handleResetAssignView = () => {
    setSelectedBrandToReassign(null);
    setTargetIntroducerSearch('');
    setFoundTargetIntroducers([]);
    setTargetIntroToAssign(null);
    setIsConfirmingTransfer(false);
  };

  useEffect(() => {
    if (introductor?.brands?.length) {
      const initialStatus = introductor.brands.reduce((acc, brand) => {
        acc[brand.id] = brand.status;
        return acc;
      }, {} as Record<number, boolean>);
      setIsActive(initialStatus);
    }
  }, [introductor]);

  const handleSearchTargetIntroducers = async (text: string) => {
    setTargetIntroducerSearch(text);
    if (text.length < 3) {
      setFoundTargetIntroducers([]);
      return;
    }
    
    setIsSearchingTarget(true);
    try {
      const response = await getIntroducersService({
        fullName: text,
        page: 1,
        limit: 10,
        status: true
      });
      // Filter out current introducer
      const filtered = (response.data.items || []).filter(i => i.id !== introductor.id);
      setFoundTargetIntroducers(filtered);
    } catch (error) {
      console.error("Error searching target introducers:", error);
    } finally {
      setIsSearchingTarget(false);
    }
  };

  const handleReassignBrand = async () => {
    if (!selectedBrandToReassign || !targetIntroToAssign) return;

    setIsSubmitting(true);
    try {
      await reassignBrandService(selectedBrandToReassign.id, targetIntroToAssign.id);

      toast.success(`Marca "${selectedBrandToReassign.name}" reasignada a ${targetIntroToAssign.fullName}`);
      setIsConfirmingTransfer(false);
      setTargetIntroToAssign(null);
      handleResetAssignView();
      onRefresh();
    } catch (error) {
      toast.error("Error al reasignar la marca");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen: boolean) => {
        setOpen(isOpen);
        if (!isOpen) {
          setBrandNames({});
          setActiveView('status');
          handleResetAssignView();
          onRefresh();
        }
      }}
    >
      <Tooltip>
        <TooltipTrigger asChild>
          <DialogTrigger asChild>
            <Button variant={"outline"}>
              <Tag />
            </Button>
          </DialogTrigger>
        </TooltipTrigger>
        <TooltipContent
          side="top"
          align="center"
          sideOffset={5}
          avoidCollisions
        >
          Editar Marcas
        </TooltipContent>
      </Tooltip>

      <DialogContent className="w-[95vw] max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">
            {`${"Gestionar Marcas"} - ${introductor.fullName}`}
          </DialogTitle>
          <DialogDescription className="text-sm">
            Edita las marcas existentes y agrega nuevas marcas para este
            introductor.
          </DialogDescription>
        </DialogHeader>

        <div style={{
          position: 'relative',
          display: 'flex',
          padding: '4px',
          backgroundColor: 'white',
          borderRadius: '9999px',
          marginBottom: '24px',
          border: '1px solid #e5e7eb',
          width: '100%',
          maxWidth: '280px',
          marginLeft: 'auto',
          marginRight: 'auto',
          height: '44px',
          overflow: 'hidden',
          userSelect: 'none',
          isolation: 'isolate',
          boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
        }}>
          {/* Green Sliding Pill - Absolute positioning with inline styles */}
          <div style={{
            position: 'absolute',
            top: '4px',
            bottom: '4px',
            left: '4px',
            width: 'calc(50% - 4px)',
            backgroundColor: '#0ea38d',
            borderRadius: '9999px',
            transition: 'transform 300ms ease-in-out',
            transform: activeView === 'status' ? 'translateX(0)' : 'translateX(100%)',
            zIndex: 0,
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }} />
          
          <button
            type="button"
            onClick={() => setActiveView('status')}
            style={{
              position: 'relative',
              zIndex: 10,
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              height: '100%',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              outline: 'none',
              color: activeView === 'status' ? 'white' : 'black',
              fontWeight: activeView === 'status' ? 'bold' : 'normal',
              transition: 'color 300ms'
            }}
          >
            <Settings2 style={{ width: '16px', height: '16px' }} />
            <span style={{ fontSize: '14px' }}>Estado</span>
          </button>
          
          <button
            type="button"
            onClick={() => setActiveView('assign')}
            style={{
              position: 'relative',
              zIndex: 10,
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              height: '100%',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              outline: 'none',
              color: activeView === 'assign' ? 'white' : 'black',
              fontWeight: activeView === 'assign' ? 'bold' : 'normal',
              transition: 'color 300ms'
            }}
          >
            <ArrowLeftRight style={{ width: '16px', height: '16px' }} />
            <span style={{ fontSize: '14px' }}>Asignar</span>
          </button>
        </div>

        {activeView === 'status' ? (
          <Form {...form}>
            <form className="space-y-8">
            
            {/* Botón y Card de Nueva Marca - Movido al inicio */}
            <div className="space-y-6">
              {!showNewBrandCard && (
                <Button
                  onClick={() => setShowNewBrandCard(true)}
                  variant="outline"
                  className="flex items-center gap-2"
                  disabled={isSubmitting}
                >
                  <Plus size={16} />
                  Nueva Marca
                </Button>
              )}

              {showNewBrandCard && (
                <Card className="w-full animate-fade-in">
                  <CardHeader className="flex justify-between items-center">
                    <div>
                      <CardTitle className="flex gap-2 items-center">
                        <Plus />
                        Nueva Marca
                      </CardTitle>
                      <CardDescription>
                        Ingresa el nombre de la marca y selecciona las especies
                      </CardDescription>
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowNewBrandCard(false)}
                      disabled={isSubmitting}
                    >
                      <X size={18} />
                    </Button>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div>
                      <label className="font-semibold block mb-2 text-sm sm:text-base">
                        Nombre de la Marca *
                      </label>
                      <Input
                        type="text"
                        placeholder="Ej: Finca San José, Marca ABC, etc."
                        className="w-full border border-gray-300 rounded-md shadow-sm bg-gray-100 text-sm sm:text-base"
                        value={form.watch("description") ?? ""}
                        onChange={(e) =>
                          form.setValue("description", e.target.value, {
                            shouldValidate: true,
                          })
                        }
                        disabled={isSubmitting}
                      />
                    </div>

                    <div>
                      <label className="font-semibold block mb-2 text-sm sm:text-base">
                        Especies *
                      </label>
                      <div className="flex flex-wrap gap-3 sm:gap-4">
                        {species.map((specie) => (
                          <Label
                            key={specie.id}
                            className={`flex items-center gap-x-2 cursor-pointer text-sm sm:text-base ${
                              isSubmitting
                                ? "opacity-60 cursor-not-allowed"
                                : ""
                            }`}
                          >
                            <Checkbox
                              checked={newBrandSpecies.some(
                                (s) => s.id === specie.id
                              )}
                              onCheckedChange={(checked: boolean) =>
                                handleNewBrandCheckboxChange(specie, checked)
                              }
                              disabled={isSubmitting}
                            />
                            {specie.name}
                          </Label>
                        ))}
                      </div>
                    </div>

                    {newBrandSpecies.length > 0 && (
                      <div className="p-3 bg-gray-50 rounded-lg border text-sm sm:text-base">
                        <span className="font-bold">Nueva marca:</span>
                        <span className="ml-2">
                          [
                          {newBrandSpecies
                            .map((s) => (s.name ?? "").toUpperCase())
                            .join(", ")}
                          ]
                        </span>
                      </div>
                    )}

                    <Button
                      type="button"
                      onClick={handleSaveBrands}
                      className="w-full font-bold"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Creando...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Crear Marca
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="space-y-4">
              <label className="font-semibold">Marcas Existentes:</label>

              {introductor.brands?.length > 0 ? (
                <div className="space-y-4">
                  {introductor.brands.map((brand) => {
                    const brandIsActive = isActive[brand.id];

                    return (
                      <Card
                        key={brand.id}
                        className={`w-full transition-all border-l-4 ${
                          brandIsActive ? "border-l-primary shadow-sm" : "bg-gray-50 border-l-gray-300"
                        }`}
                      >
                        <CardHeader className="p-4 sm:p-5 bg-gray-50/50">
                          <CardTitle>
                            <span className="text-base sm:text-lg font-bold text-gray-800">Marca: {brand.name}</span>
                          </CardTitle>
                        </CardHeader>

                        <CardContent className="space-y-4 p-4 sm:p-6 pb-4">
                          <Input
                            type="text"
                            value={
                              brandNames.hasOwnProperty(brand.id)
                                ? brandNames[brand.id]
                                : brand.name
                            }
                            className="w-full border border-gray-300 rounded-md shadow-sm bg-gray-100 text-sm sm:text-base"
                            onChange={(e) =>
                              handleBrandNameChange(brand.id, e.target.value)
                            }
                            disabled={!brandIsActive || isSubmitting}
                          />

                          <div>
                            <label className="font-semibold block mb-2 text-sm sm:text-base">
                              Especies *
                            </label>
                            <div className="flex flex-wrap gap-3 sm:gap-4">
                              {species.map((specie) => (
                                <Label
                                  key={specie.id}
                                  className={`flex items-center gap-x-2 cursor-pointer text-sm sm:text-base ${
                                    !brandIsActive
                                      ? "cursor-not-allowed opacity-70"
                                      : ""
                                  }`}
                                >
                                  <Checkbox
                                    checked={selectedSpecies[brand.id]?.some(
                                      (s) => s.id === specie.id
                                    )}
                                    onCheckedChange={(checked: boolean) =>
                                      handleCheckboxChange(
                                        brand.id,
                                        specie,
                                        checked
                                      )
                                    }
                                    disabled={!brandIsActive || isSubmitting}
                                  />
                                  {specie.name}
                                </Label>
                              ))}
                            </div>
                          </div>

                          {selectedSpecies[brand.id] &&
                            selectedSpecies[brand.id].length > 0 && (
                              <div className="p-3 bg-gray-50 rounded-lg border text-sm sm:text-base">
                                <span className="font-bold">
                                  {brandNames[brand.id] || brand.name}:
                                </span>
                                <span className="ml-2">
                                  [
                                  {selectedSpecies[brand.id]
                                    .map((s) => (s.name ?? "").toUpperCase())
                                    .join(", ")}
                                  ]
                                </span>
                              </div>
                            )}

                          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-100">
                            {/* Botón Actualizar */}
                            <Button
                              type="button"
                              className="flex items-center gap-2 flex-1 font-bold h-10"
                              onClick={() => handleUpdateBrand(brand.id)}
                              disabled={isSubmitting || !brandIsActive}
                            >
                              <Save size={16} />
                              <span className="text-sm">Actualizar</span>
                            </Button>

                            <Button
                              type="button"
                              onClick={() => handleToggleStatus(brand.id)}
                              variant={
                                brandIsActive ? "default" : "outline"
                              }
                              disabled={isSubmitting}
                              className={`flex items-center gap-2 flex-1 h-10 transition-colors ${
                                !brandIsActive 
                                  ? "bg-red-50 hover:bg-red-100 border-red-200 text-red-700" 
                                  : "bg-primary hover:bg-primary/90 text-white border-transparent"
                              }`}
                            >
                              <span className="text-sm font-bold">
                                {brandIsActive ? "Activo" : "Inactivo"}
                              </span>
                              {brandIsActive ? (
                                <ToggleRightIcon className="w-8 h-8 text-white" />
                              ) : (
                                <ToggleLeftIcon className="w-8 h-8 text-red-500" />
                              )}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <p className="text-gray-500">No hay marcas registradas</p>
              )}
            </div>

            </form>
          </Form>
        ) : (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {!selectedBrandToReassign ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-primary/10 border border-primary/20 rounded-lg text-primary text-sm font-medium">
                  <Info className="h-5 w-5 flex-shrink-0 text-primary" />
                  <p>Selecciona una marca del introductor actual para transferirla a otro introductor.</p>
                </div>
                
                <Label className="font-semibold text-gray-700">Tus Marcas Disponibles:</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {introductor.brands && introductor.brands.length > 0 ? (
                    introductor.brands.map((brand) => (
                      <div key={brand.id} className="flex items-center justify-between p-3 bg-white border rounded-lg hover:shadow-md transition-all group">
                        <div className="space-y-1">
                          <p className="text-sm font-bold text-gray-800">{brand.name}</p>
                          <div className="flex flex-wrap gap-1">
                            {brand.species.map((s, idx) => (
                              <span key={idx} className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded uppercase">
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          className="hover:bg-primary hover:text-white transition-colors"
                          onClick={() => setSelectedBrandToReassign(brand)}
                        >
                          <ArrowRight className="h-4 w-4 mr-1" />
                          <span className="text-xs">Transferir</span>
                        </Button>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 italic col-span-2 py-4">No tienes marcas para reasignar.</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between p-3 bg-primary/5 border border-primary/20 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-full">
                      <Tag className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-primary/60 font-semibold uppercase tracking-wider">Marca Seleccionada</p>
                      <p className="text-sm font-bold text-primary">{selectedBrandToReassign.name}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedBrandToReassign(null)}>
                    Cambiar
                  </Button>
                </div>

                <div className="space-y-4">
                  <Label className="font-semibold text-gray-700">Buscar Introductor Destino:</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <Input
                      placeholder="Buscar por nombre (mínimo 3 caracteres)..."
                      value={targetIntroducerSearch}
                      onChange={(e) => handleSearchTargetIntroducers(e.target.value)}
                      className="pl-10 h-11"
                    />
                    {isSearchingTarget && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                  {foundTargetIntroducers.length > 0 ? (
                    foundTargetIntroducers.map((foundIntro) => (
                      <Card key={foundIntro.id} className="border-gray-200 hover:border-primary/50 transition-colors">
                        <CardHeader className="p-4 bg-gray-50/50">
                          <CardTitle className="text-base flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4 text-primary" />
                              <span>{foundIntro.fullName}</span>
                            </div>
                            <Button
                              size="sm"
                              className="bg-primary text-white"
                              onClick={() => {
                                setTargetIntroToAssign(foundIntro);
                                setIsConfirmingTransfer(true);
                              }}
                              disabled={isSubmitting}
                            >
                              <UserPlus className="h-4 w-4 mr-1" />
                              <span className="text-xs">Confirmar Reasignación</span>
                            </Button>
                          </CardTitle>
                        </CardHeader>
                      </Card>
                    ))
                  ) : targetIntroducerSearch.length >= 3 ? (
                    <div className="text-center py-10 text-gray-500">
                      <Search className="h-10 w-10 mx-auto mb-2 opacity-20" />
                      <p>No se encontraron introductores destino</p>
                    </div>
                  ) : (
                    <div className="text-center py-10 text-gray-400 border-2 border-dashed rounded-xl">
                      <Search className="h-10 w-10 mx-auto mb-2 opacity-20" />
                      <p className="text-sm">Ingresa el nombre del introductor receptor</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-4 border-t gap-2">
              {selectedBrandToReassign && (
                 <Button
                 type="button"
                 variant="ghost"
                 onClick={() => handleResetAssignView()}
               >
                 Cancelar
               </Button>
              )}
              <Button
                type="button"
                variant="outline"
                onClick={() => handleCloseModal()}
              >
                Cerrar
              </Button>
            </div>
          </div>
        )}

        <AlertDialog open={isConfirmingTransfer} onOpenChange={setIsConfirmingTransfer}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Confirmar transferencia de marca?</AlertDialogTitle>
              <AlertDialogDescription>
                Estás a punto de transferir la marca <span className="font-bold text-gray-900">"{selectedBrandToReassign?.name}"</span> 
                al introductor <span className="font-bold text-gray-900">"{targetIntroToAssign?.fullName}"</span>. 
                Esta acción moverá la propiedad de la marca y ya no aparecerá bajo el introductor actual.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isSubmitting}>Cancelar</AlertDialogCancel>
              <AlertDialogAction 
                onClick={(e) => {
                  e.preventDefault();
                  handleReassignBrand();
                }}
                className="bg-primary hover:bg-primary/90"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Transfiriendo..." : "Sí, transferir marca"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <AlertDialog open={!!brandToToggle} onOpenChange={(open) => !open && setBrandToToggle(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {brandToToggle && isActive[brandToToggle] 
                  ? "¿Está seguro que desea inactivar esta marca?" 
                  : "¿Está seguro que desea activar esta marca?"}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {brandToToggle && isActive[brandToToggle] 
                  ? "Al inactivar la marca, esta dejará de estar disponible para las operaciones. Podrá volver a activarla en cualquier momento." 
                  : "Al activar la marca, esta volverá a estar disponible para todas las operaciones del sistema."}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={confirmToggleStatus}>Continuar</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DialogContent>
    </Dialog>
  );
}
