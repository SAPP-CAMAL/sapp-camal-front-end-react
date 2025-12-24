import { useFormContext } from "react-hook-form";
import { useState } from "react";
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
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { CircleCheckBig, User, X } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { SelectCompany } from "../visitor-log-management";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/components/ui/date-picker";
import { Checkbox } from "@/components/ui/checkbox";
import { getPeopleByFilterService } from "@/features/people/server/db/people.service";
import { Person } from "@/features/people/domain";
import { useDebouncedCallback } from "use-debounce";

export function VisitorLogFormFields() {
  const form = useFormContext();
  const selectedPerson = form.watch("savedPerson");
  const [activeField, setActiveField] = useState<
    "name" | "identification" | null
  >(null);
  const [name, setName] = useState("");
  const [identification, setIdentification] = useState("");

  const debouncedName = useDebouncedCallback((value: string) => {
    setName(value);
  }, 500);

  const debouncedIdentification = useDebouncedCallback((value: string) => {
    setIdentification(value);
  }, 500);

  const peopleData = useQuery({
    queryKey: ["people-search-visitor", name, identification, activeField],
    queryFn: () =>
      getPeopleByFilterService({
        page: 1,
        limit: 10,
        status: true,
        fullName: activeField === "name" && name.length > 2 ? name : "",
        identificacion: activeField === "identification" && identification.length > 2 ? identification : "",
      }),
    enabled: (activeField === "name" && name.length > 2) || (activeField === "identification" && identification.length > 2),
  });

  const handleSelectPerson = (person: Person) => {
    setActiveField(null);
    form.setValue("personId", person?.id?.toString());
    form.setValue("savedPerson", person);
  };

  const handleRemovePerson = () => {
    form.setValue("savedPerson", null);
    form.setValue("name", "");
    form.setValue("identification", "");
    setName("");
    setIdentification("");
    setActiveField(null);
  };

  return (
    <div className="space-y-4">
      <Card className="">
        <CardHeader>
          <CardTitle className="flex gap-2 items-center">
            <div className="flex justify-between items-center w-full">
              <div className="flex flex-col gap-1">
                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm">
                  1
                </div>
                <span className="">Buscar Persona</span>
              </div>
            </div>
          </CardTitle>
          <CardDescription>
            Busca y selecciona la persona que será registrada como Visitante
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
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
                              debouncedName(e.target.value);
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
                        data={peopleData?.data?.data?.items ?? []}
                        activeField={activeField}
                        onSelectPerson={handleSelectPerson}
                        isLoading={peopleData.isLoading}
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-1">
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
                              debouncedIdentification(e.target.value);
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
                          data={peopleData?.data?.data?.items ?? []}
                          activeField={activeField}
                          onSelectPerson={handleSelectPerson}
                          isLoading={peopleData.isLoading}
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
                showEmail={false}
              />
            </>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="idCompany"
          rules={{
            required: {
              value: true,
              message: "El campo empresa es requerido",
            },
          }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Empresa *</FormLabel>
              <FormControl>
                <SelectCompany
                  value={field.value}
                  onChangeValue={(idCompany) => {
                    field.onChange(idCompany ?? "");
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="visitPurpose"
          rules={{
            required: {
              value: true,
              message: "El campo motivo de visita es requerido",
            },
          }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Motivo de Visita *</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="entryTime"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Hora de Entrada</FormLabel>
                <FormControl>
                  <DatePicker
                    inputClassName="bg-secondary h-10 flex items-center"
                    iconClassName="mt-1"
                    selected={field.value ? new Date(field.value) : null}
                    onChange={(date: Date | null) => {
                      if (!date) {
                        field.onChange(null);
                        return;
                      }
                      field.onChange(date.toISOString());
                    }}
                    showTimeSelect
                    timeCaption="Hora"
                    timeFormat="hh:mm aa"
                    timeIntervals={1}
                    dateFormat="dd/MM/yyyy hh:mm aa"
                    placeholderText="dd/mm/yyyy, hh:mm AM/PM"
                    popperClassName="!z-[10000]"
                    popperPlacement="bottom-start"

                  />
                </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="exitTime"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Hora de Salida</FormLabel>
              <FormControl>
                  <DatePicker
                    inputClassName="bg-secondary h-10 flex items-center"
                    iconClassName="mt-1"
                    selected={field.value ? new Date(field.value) : null}
                    onChange={(date: Date | null) => {
                      if (!date) {
                        field.onChange(null);
                        return;
                      }
                      field.onChange(date.toISOString());
                    }}
                    showTimeSelect
                    timeCaption="Hora"
                    timeFormat="hh:mm aa"
                    timeIntervals={1}
                    dateFormat="dd/MM/yyyy hh:mm aa"
                    placeholderText="dd/mm/yyyy, hh:mm AM/PM"
                    popperClassName="!z-[10000]"
                    popperPlacement="bottom-start"

                  />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="hasVehicle"
          render={({ field }) => (
            <FormItem>
              <FormLabel>¿Tiene Vehículo?</FormLabel>
              <FormControl>
                <div className="flex items-center gap-4">
                  <Checkbox
                    checked={field.value === true}
                    onCheckedChange={(checked) => field.onChange(checked ? true : null)}
                    className="h-5 w-5 text-primary"
                    id="hasVehicle-yes"
                  />
                  <label htmlFor="hasVehicle-yes" className="ml-2 cursor-pointer">
                    Sí
                  </label>
                  <Checkbox
                    checked={field.value === false}
                    onCheckedChange={(checked) => field.onChange(checked ? false : null)}
                    className="h-5 w-5 text-primary"
                    id="hasVehicle-no"
                  />
                  <label htmlFor="hasVehicle-no" className="ml-2 cursor-pointer">
                    No
                  </label>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="observation"
          render={({ field }) => (
            <FormItem className="col-span-2">
              <FormLabel>Observación</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}

interface PersonSearchProps {
  data: Person[];
  activeField: "name" | "identification" | null;
  onSelectPerson: (person: Person) => void;
  isLoading?: boolean;
}

export function PersonSearch({
  data,
  activeField,
  onSelectPerson,
  isLoading,
}: PersonSearchProps) {
  if (!activeField) return null;

  return (
    <Command className="rounded-lg border shadow-md w-full ">
      {" "}
      <CommandList>
        <CommandGroup
          heading={
            activeField === "name"
              ? "Resultados por nombre"
              : "Resultados por identificación"
          }
        >
          {isLoading && (
            <CommandItem disabled>Buscando...</CommandItem>
          )}
          {!isLoading && data.length === 0 && (
            <CommandItem disabled>No se encontraron resultados</CommandItem>
          )}
          {!isLoading && data.map((person, idx) => (
            <CommandItem
              key={idx}
              value={person.fullName}
              onSelect={() => onSelectPerson(person)}
              className="cursor-pointer hover:bg-gray-50"
            >
              <div className="flex flex-col">
                <span className="font-medium">{person.fullName}</span>
                <span className="text-xs text-gray-500">{person.identification}</span>
              </div>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  );
}

interface SelectedPersonCardProps {
  person: Person;
  onRemove: () => void;
  showEmail?: boolean;
}

export function SelectedPersonCard({
  person,
  onRemove,
  showEmail = true,
}: SelectedPersonCardProps) {
  return (
    <div className="w-full">
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
      {showEmail && person.mobileNumber && (
        <>
          <Separator />
          <div>
            <label className="font-semibold text-sm">
              Teléfono
            </label>
            <div className="rounded-xl px-3 py-2 bg-muted border mt-2">
              <p className="text-sm text-muted-foreground truncate">
                {person.mobileNumber}
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

interface SuccessViewProps {
  person: Person | null;
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
          {getInitials(person.fullName ?? "")}
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-green-800">{person.fullName}</h4>
          <div className="text-sm text-green-600 space-y-1">
            <p>{person.mobileNumber || person.identification}</p>
          </div>
        </div>
      </div>
    </CardContent>
  );
}
