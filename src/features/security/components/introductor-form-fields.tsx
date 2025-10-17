import { useFormContext } from "react-hook-form";
import { NewIntroductorForm } from "./new-introductor";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { CircleCheckBig, Plus, Save, User, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ResponseUserPersonSearchService, Specie, UserPerson } from "../domain";
import { Label } from "@radix-ui/react-label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  createBrandService,
  getIntroducersService,
  getUserPersonByFilterService,
  updateUserService,
} from "../server/db/security.queries";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";

export type BrandCreating = {
  id: number;
  name: string;
  species: string[];
};
export function IntroductorFormFields({
  species,
  introducerRolId,
}: {
  species: Specie[];
  introducerRolId?: number;
}) {
  const form = useFormContext<NewIntroductorForm>();
  const [selectedPerson, setSelectedPerson] = useState<UserPerson | null>(null);
  const [activeField, setActiveField] = useState<
    "name" | "identification" | null
  >(null);
  const [name, setName] = useState("");
  const [identification, setIdentification] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [savedPerson, setSavedPerson] = useState<UserPerson | null>(null);
  const [selectedSpecies, setSelectedSpecies] = useState<Specie[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdBrands, setCreatedBrands] = useState<BrandCreating[]>([]);
  const [introducerId, setIntroducerId] = useState<number>();
  const peopleData = useQuery<ResponseUserPersonSearchService>({
    queryKey: ["people", name, identification],
    queryFn: () =>
      getUserPersonByFilterService({
        ...(name.length > 2 && { fullName: name }),
        identification: identification,
      }),
    enabled: !!name || !!identification,
  });
  const isFormComplete = useMemo(() => {
    const description = form?.watch("description");
    return !!description?.trim() && !!selectedSpecies?.length;
  }, [form?.watch("description"), selectedSpecies]);

  const handleSelectPerson = (person: UserPerson) => {
    setSelectedPerson(person);
    setSavedPerson(person);
    setActiveField(null);
  };

  const handleRemovePerson = () => {
    setSelectedPerson(null);
    form.setValue("name", "");
    form.setValue("identification", "");
    setName("");
    setIdentification("");
    setActiveField(null);
  };
  const handleSaveIntroductor = async () => {
    if (!selectedPerson) return;

    try {
      const create = await updateUserService(selectedPerson.id, {
        roles: [
          {
            id: introducerRolId,
            status: true,
          },
        ],
      });
      setSavedPerson(selectedPerson);
      toast.success("Introductor creado exitosamente");
      const introductor = await getIntroducersService({
        fullName: selectedPerson.fullName,
      });
      setIntroducerId(introductor.data.items[0].id);
      setIsSuccess(true);
    } catch (error: any) {
      console.error("Error al crear introductor:", error);
      if (error.response) {
        try {
          const { data } = await error.response.json();
          toast.error(data || "Error al crear el introductor");
        } catch {
          toast.error("Error al crear el introductor");
        }
      } else {
        toast.error("Error de conexión. Por favor, intente nuevamente.");
      }
    }
  };
  const handleSaveBrands = async () => {
    if (!savedPerson) return;

    const description = form.getValues("description");
    if (!description || description.trim() === "") {
      return toast.warning("La descripción es requerida");
    }

    if (!selectedSpecies || selectedSpecies.length === 0) {
      return toast.warning("Debe seleccionar al menos una especie");
    }

    setIsSubmitting(true);
    if (!introducerId) return toast.error("No se a podido crear la marca");
    try {
      const brand = await createBrandService({
        introducerId: introducerId,
        description: description.trim(),
        name: description.trim(),
        speciesIds: selectedSpecies.map((specie) => specie.id),
      });
      const newBrand: BrandCreating = {
        id: brand.data.id,
        name: brand.data.description,
        species: brand.data.species.map((s) => s.name),
      };
      setCreatedBrands((prev) => [...prev, newBrand]);
      toast.success("Marca creada exitosamente");

      form.reset({ description: "" });
      setSelectedSpecies([]);
    } catch (error) {
      toast.error("Error al crear la Marca");
    } finally {
      setIsSubmitting(false);
    }
  };

  function handleCheckboxChange(specie: Specie, checked: boolean) {
    if (checked) {
      setSelectedSpecies((prev) => [...prev, specie]);
    } else {
      setSelectedSpecies((prev) => prev.filter((s) => s.id !== specie.id));
    }
  }

  return (
    <div className="space-y-4">
      {!isSuccess ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex gap-2 items-center">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm">
                1
              </div>
              Crear Introductor
            </CardTitle>
            <CardDescription>
              Busca y selecciona la persona que será registrada como Introductor
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!selectedPerson ? (
              <>
                <label className="font-semibold">Buscar Persona</label>

                <div className="grid grid-cols-2 gap-x-2 w-full">
                  <div className="space-y-2">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              type="text"
                              placeholder="Buscar por nombre"
                              className="w-full border border-gray-300 rounded-md shadow-sm"
                              {...field}
                              onChange={(e) => {
                                field.onChange(e);
                                setName(e.target.value);
                                setActiveField("name");
                                form.setValue("identification", "");
                                setIdentification("");
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {name.length > 2 && activeField === "name" && (
                      <div className="w-full">
                        <PersonSearch
                          data={peopleData?.data?.data ?? []}
                          activeField={activeField}
                          onSelectPerson={handleSelectPerson}
                        />
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <FormField
                      control={form.control}
                      name="identification"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              type="text"
                              placeholder="Número de Identificación"
                              className="w-full border border-gray-300 rounded-md shadow-sm"
                              {...field}
                              onChange={(e) => {
                                field.onChange(e);
                                setIdentification(e.target.value);
                                setActiveField("identification");
                                form.setValue("name", "");
                                setName("");
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {identification.length > 2 &&
                      activeField === "identification" && (
                        <div className="w-full">
                          <PersonSearch
                            data={peopleData?.data?.data ?? []}
                            activeField={activeField}
                            onSelectPerson={handleSelectPerson}
                          />
                        </div>
                      )}
                  </div>
                </div>
              </>
            ) : (
              <>
                <SelectedPersonCard
                  person={selectedPerson}
                  onRemove={handleRemovePerson}
                />
                <Button
                  type="button"
                  className="w-full mt-4"
                  onClick={handleSaveIntroductor}
                >
                  {isSubmitting ? (
                    "Guardando..."
                  ) : (
                    <>
                      <Save />
                      Guardar Introductor
                    </>
                  )}
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-green-50 border-green-200">
          <SuccessView person={savedPerson} />
        </Card>
      )}

      <Card>
        <CardHeader className={!isSuccess ? "opacity-50" : ""}>
          <CardTitle className="flex gap-2 items-center">
            <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm">
              2
            </div>
            Gestionar Marcas del Introductor
          </CardTitle>
          {}
          <CardDescription>
            Asigna una o más marcas al introductor seleccionado. Las marcas
            deben ser únicas por persona.
          </CardDescription>
        </CardHeader>
        {isSuccess && (
          <CardContent>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus />
                  Agregar Nueva Marca
                </CardTitle>
                <CardDescription>
                  Ingresa el nombre de la marca y selecciona las especies
                </CardDescription>
              </CardHeader>
              <CardContent>
                <label className="font-semibold">Nombre de la Marca *</label>
                <Input
                  type="text"
                  placeholder="Ej: Finca San Jóse, Marca ABC, etc."
                  className="w-full border border-gray-300 rounded-md shadow-sm bg-gray-100"
                  value={form.watch("description") ?? ""}
                  onChange={(e) => {
                    form.setValue("description", e.target.value, {
                      shouldValidate: true,
                    });
                  }}
                />

                <label className="font-semibold">Especies *</label>
                <div className="flex items-center gap-x-6">
                  {species.map((specie, index) => (
                    <Label
                      key={index}
                      className="flex items-center gap-x-2 cursor-pointer"
                    >
                      <Checkbox
                        checked={selectedSpecies.some(
                          (s) => s.id === specie.id
                        )}
                        onCheckedChange={(checked: boolean) => {
                          handleCheckboxChange(specie, checked);
                        }}
                      />
                      {specie.name}
                    </Label>
                  ))}
                </div>
                <Button
                  className="w-full mt-4"
                  onClick={() => handleSaveBrands()}
                  disabled={isSubmitting || !isFormComplete}
                >
                  {isSubmitting ? (
                    "Guardando..."
                  ) : (
                    <>
                      <Save />
                      Guardar Marca
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
            {createdBrands.length > 0 && (
              <div className="mt-6 space-y-3">
                <label className="font-semibold">Marcas del Introductor:</label>
                <div className="space-y-2">
                  {" "}
                  {createdBrands.map((brand) => (
                    <div
                      key={brand.id}
                      className="p-3 bg-gray-50 rounded-lg border min-h-[60px]"
                    >
                      <div className="text-sm">
                        <span className="font-bold">{brand.name}</span>[
                        {brand.species.join(", ").toUpperCase()}]
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        )}
      </Card>
    </div>
  );
}

interface PersonSearchProps {
  data: UserPerson[];
  activeField: "name" | "identification" | null;
  onSelectPerson: (person: UserPerson) => void;
}

export function PersonSearch({
  data,
  activeField,
  onSelectPerson,
}: PersonSearchProps) {
  if (!activeField) return null;

  return (
    <Command className="rounded-lg border shadow-md w-full mt-2">
      {" "}
      <CommandList>
        <CommandGroup
          heading={
            activeField === "name"
              ? "Resultados por nombre"
              : "Resultados por identificación"
          }
        >
          {data.length === 0 && (
            <CommandItem disabled>No se encontraron resultados</CommandItem>
          )}
          {data.map((person, idx) => (
            <CommandItem
              key={idx}
              value={person.fullName}
              onSelect={() => onSelectPerson(person)}
              className="cursor-pointer hover:bg-gray-50"
            >
              <div className="flex flex-col">
                <span className="font-medium">{person.fullName}</span>
                <span className="text-xs text-gray-500">{person.email}</span>
              </div>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  );
}

interface SelectedPersonCardProps {
  person: UserPerson;
  onRemove: () => void;
  showEmail?: boolean;
}

export function SelectedPersonCard({
  person,
  onRemove,
  showEmail = true,
}: SelectedPersonCardProps) {
  return (
    <div className="w-full mt-4 space-y-4">
      <div>
        <label className="font-semibold text-sm">Persona Seleccionada</label>
        <div className="rounded-xl px-3 py-2 bg-muted border mt-2 flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
              <User size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold truncate">{person.fullName}</p>
              <p className="text-sm text-muted-foreground truncate">
                {person.identification}
              </p>
            </div>
          </div>

          <button
            onClick={onRemove}
            className="p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full transition-colors"
            aria-label="Remover persona seleccionada"
          >
            <X size={16} />
          </button>
        </div>
      </div>
      {showEmail && (
        <>
          <Separator />
          <div>
            <label className="font-semibold text-sm">
              Correo Electrónico *
            </label>
            <div className="rounded-xl px-3 py-2 bg-muted border mt-2">
              <p className="text-sm text-muted-foreground truncate">
                {person.email}
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

interface SuccessViewProps {
  person: UserPerson | null;
}

export function SuccessView({ person }: SuccessViewProps) {
  if (!person) return null;

  const getInitials = (fullName: string) => {
    return fullName
      .split(" ")
      .map((name) => name.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 3);
  };

  return (
    <CardContent className="space-y-4 py-8">
      <div className="flex items-center gap-2 text-green-600">
        <CircleCheckBig size={20} className="text-green-600" />
        <h3 className="font-semibold text-lg">Crear Introductor</h3>
      </div>

      <p className="text-gray-600">Introductor creado exitosamente</p>

      <div className="bg-green-50 border border-green-300 rounded-lg p-4 flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-gray-300 text-gray-700 flex items-center justify-center text-sm font-medium">
          {getInitials(person.fullName)}
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-green-800">{person.fullName}</h4>
          <div className="text-sm text-green-600 space-y-1">
            <p>{person.email || "anamaria.gonzalez@empresa.com"}</p>
          </div>
        </div>
      </div>
    </CardContent>
  );
}
