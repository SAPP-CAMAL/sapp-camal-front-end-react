"use client";

import { Button } from "@/components/ui/button";
import { Introducer, Specie } from "../domain";
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
  Plus,
  Save,
  Tag,
  ToggleLeftIcon,
  ToggleRightIcon,
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
  updateBrandService,
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

export function UpdateBrands({
  species,
  introductor,
  onRefresh,
}: NewIntroductorProps) {
  const form = useForm<UpdateBrandsForm>();
  const [open, setOpen] = useState(false);
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
    } catch (error) {
      toast.error("Error al crear la Marca");
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
      const updatedBrand = await updateBrandService(brandId, {
        description: brandName.trim(),
        name: brandName.trim(),
        species: brandSpecies.map((specie) => ({
          id: specie.id,
          status: true,
        })),
      });

      toast.success(`Marca "${brandName}" actualizada exitosamente`);
      handleCloseModal();
    } catch (error) {
      toast.error("Error al actualizar la marca");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setBrandNames({});
    setOpen(false);
    onRefresh();
  };

  const handleToggleStatus = async (brandId: number) => {
    const newStatus = !isActive[brandId];

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
      setIsActive((prev) => ({
        ...prev,
        [brandId]: !newStatus,
      }));

      toast.error("No se pudo actualizar el estado de la marca.");
      console.error(error);
    }
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

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) {
          setBrandNames({});
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

      <DialogContent className="min-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{`${"Gestionar Marcas"} - ${
            introductor.fullName
          } `}</DialogTitle>
          <DialogDescription>
            Edita las marcas existentes y agrega nuevas marcas para este
            introductor.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form className="space-y-8">
            <div className="space-y-4">
              <label className="font-semibold">Marcas Existentes:</label>

              {introductor.brands?.length > 0 ? (
                <div className="space-y-4">
                  {introductor.brands.map((brand) => {
                    const brandIsActive = isActive[brand.id];

                    return (
                      <Card
                        key={brand.id}
                        className={`w-full transition-all ${
                          !brandIsActive ? "opacity-60 pointer-events-none" : ""
                        }`}
                      >
                        <CardHeader>
                          <CardTitle className="flex items-center justify-between">
                            Nombre de la Marca
                            <div className="flex gap-2">
                              {/* Botón Guardar */}
                              <Button
                                type="button"
                                size="sm"
                                className="flex items-center gap-2"
                                onClick={() => handleUpdateBrand(brand.id)}
                                disabled={isSubmitting || !brandIsActive}
                              >
                                <Save size={16} />
                                Guardar
                              </Button>

                              <Button
                                type="button"
                                onClick={() => handleToggleStatus(brand.id)}
                                variant={
                                  brandIsActive ? "outline" : "secondary"
                                }
                                disabled={isSubmitting}
                              >
                                <span
                                  className={
                                    brandIsActive
                                      ? "font-bold"
                                      : "text-gray-400"
                                  }
                                >
                                  {brandIsActive ? "Activo" : "Inactivo"}
                                </span>
                                {brandIsActive ? (
                                  <ToggleRightIcon className="w-8 h-8 text-primary" />
                                ) : (
                                  <ToggleLeftIcon className="w-8 h-8 text-gray-500" />
                                )}
                              </Button>
                            </div>
                          </CardTitle>
                        </CardHeader>

                        <CardContent className="space-y-4">
                          <Input
                            type="text"
                            value={
                              brandNames.hasOwnProperty(brand.id)
                                ? brandNames[brand.id]
                                : brand.name
                            }
                            className="w-full border border-gray-300 rounded-md shadow-sm bg-gray-100"
                            onChange={(e) =>
                              handleBrandNameChange(brand.id, e.target.value)
                            }
                            disabled={!brandIsActive || isSubmitting}
                          />

                          <div>
                            <label className="font-semibold block mb-2">
                              Especies *
                            </label>
                            <div className="flex flex-wrap gap-4">
                              {species.map((specie) => (
                                <Label
                                  key={specie.id}
                                  className={`flex items-center gap-x-2 cursor-pointer ${
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
                              <div className="p-3 bg-gray-50 rounded-lg border">
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
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <p className="text-gray-500">No hay marcas registradas</p>
              )}
            </div>

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
                      <label className="font-semibold block mb-2">
                        Nombre de la Marca *
                      </label>
                      <Input
                        type="text"
                        placeholder="Ej: Finca San José, Marca ABC, etc."
                        className="w-full border border-gray-300 rounded-md shadow-sm bg-gray-100"
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
                      <label className="font-semibold block mb-2">
                        Especies *
                      </label>
                      <div className="flex flex-wrap gap-4">
                        {species.map((specie) => (
                          <Label
                            key={specie.id}
                            className={`flex items-center gap-x-2 cursor-pointer ${
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
                      <div className="p-3 bg-gray-50 rounded-lg border">
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
                      className="w-full mt-4"
                      onClick={() => handleSaveBrands()}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        "Guardando..."
                      ) : (
                        <>
                          <Save size={16} className="mr-2" />
                          Guardar Marca
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="flex justify-end gap-x-2">
              <Button
                type="button"
                variant={"outline"}
                disabled={form.formState.isSubmitting}
                onClick={() => handleCloseModal()}
              >
                Cerrar
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
