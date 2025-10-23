"use client";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useFormContext } from "react-hook-form";
import { CardContent } from "@/components/ui/card";
import { UserPerson } from "@/features/security/domain";
import { useState } from "react";
import {
  PersonSearch,
  SelectedPersonCard,
} from "@/features/security/components/introductor-form-fields";
import { useQuery } from "@tanstack/react-query";
import { MultiSelect } from "@/components/ui/multi-select";
import { getPersonByIdentificationOrFullNameService } from "@/features/people/server/db/people.service";
import { getUserRolesService } from "@/features/roles/server/db/roles.service";

export function NewUserFields({ isUpdate = false }: { isUpdate?: boolean }) {
  const [selectedPerson, setSelectedPerson] = useState<UserPerson | null>(null);
  const [activeField, setActiveField] = useState<
    "name" | "identification" | null
  >(null);
  const [fullName, setFullName] = useState("");
  const [identification, setIdentification] = useState("");

  const peopleData = useQuery({
    queryKey: ["people", fullName, identification],
    queryFn: () =>
      getPersonByIdentificationOrFullNameService({
        identification: identification,
        ...(fullName.length > 2 && { fullName: fullName }),
      }),
    enabled: !!fullName || !!identification,
  });

  const query = useQuery({
    queryKey: ["user-roles"],
    queryFn: () => getUserRolesService(),
  });

  const form = useFormContext();

  const handleSelectPerson = (person: UserPerson) => {
    form.setValue("personId", person?.id?.toString() ?? "");
    setSelectedPerson(person);
    setActiveField(null);
  };

  const handleRemovePerson = () => {
    setSelectedPerson(null);
    form.setValue("name", "");
    form.setValue("identification", "");
    setFullName("");
    setIdentification("");
    setActiveField(null);
  };

  return (
    <>
      <CardContent className="space-y-4 col-span-2 mx-0 px-0 pb-6 border-b">
        {isUpdate ? null : !selectedPerson ? (
          <>
            <label className="font-semibold text-sm">Buscar Persona</label>

            <div className="grid grid-cols-2 gap-4 w-full">
              <div className="space-y-2 relative">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs text-muted-foreground">
                        Buscar por nombre
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="Nombre completo..."
                          className="w-full"
                          {...field}
                          value={field.value ?? ""}
                          onChange={(e) => {
                            field.onChange(e.target.value);
                            setFullName(e.target.value);
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

                {fullName.length > 2 && activeField === "name" && (
                  <div className="absolute z-50 w-full top-full mt-1">
                    <PersonSearch
                      // @ts-ignore
                      data={peopleData?.data?.data ?? []}
                      activeField={activeField}
                      onSelectPerson={handleSelectPerson}
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2 relative">
                <FormField
                  control={form.control}
                  name="identification"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs text-muted-foreground">
                        Buscar por identificación
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="Número de identificación..."
                          className="w-full"
                          {...field}
                          value={field.value ?? ""}
                          onChange={(e) => {
                            field.onChange(e.target.value);
                            setIdentification(e.target.value);
                            setActiveField("identification");
                            form.setValue("name", "");
                            setFullName("");
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {identification.length > 2 &&
                  activeField === "identification" && (
                    <div className="absolute z-50 w-full top-full mt-1">
                      <PersonSearch
                        // @ts-ignore
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
              showEmail={false}
            />
          </>
        )}
      </CardContent>

      <FormField
        control={form.control}
        name="email"
        rules={{
          required: {
            value: true,
            message: "El correo electrónico es requerido",
          },
        }}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Correo Electrónico *</FormLabel>
            <FormControl>
              <Input 
                type="email" 
                {...field} 
                value={field.value ?? ""} 
                onChange={(e) => field.onChange(e.target.value)}
                className="border-gray-200" 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="userName"
        rules={{
          required: {
            value: true,
            message: "El nombre de usuario es requerido",
          },
        }}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nombre de Usuario *</FormLabel>
            <FormControl>
              <Input 
                {...field} 
                value={field.value ?? ""} 
                onChange={(e) => field.onChange(e.target.value)}
                className="border-gray-200" 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      {isUpdate ? null : (
        <>
          <FormField
            control={form.control}
            name="password"
            rules={{
              required: {
                value: true,
                message: "El campo de contraseña es requerido",
              },
            }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contraseña *</FormLabel>
                <FormControl>
                  <Input 
                    type="password"
                    {...field} 
                    value={field.value ?? ""} 
                    onChange={(e) => field.onChange(e.target.value)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="passwordConfirm"
            rules={{
              required: {
                value: true,
                message: "La confirmación de contraseña es requerida",
              },
              validate: {
                matches: (value) =>
                  value === form.watch("password")
                    ? true
                    : "Las contraseñas no coinciden",
              },
            }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirmar Contraseña *</FormLabel>
                <FormControl>
                  <Input 
                    type="password"
                    {...field} 
                    value={field.value ?? ""} 
                    onChange={(e) => field.onChange(e.target.value)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </>
      )}
      <FormField
        control={form.control}
        name="roles"
        rules={{
          required: {
            value: true,
            message: "Debes seleccionar mínimo un rol",
          },
        }}
        render={({ field }) => (
          <FormItem className="col-span-2">
            <FormLabel>Roles *</FormLabel>
            <FormControl>
              <MultiSelect
                options={
                  query.data?.data?.map((role) => ({
                    value: role.id.toString(),
                    label: role.name,
                  })) ?? []
                }
                defaultValue={field.value || []}
                onValueChange={field.onChange}
                placeholder="Seleccionar Roles..."
                maxCount={2}
                singleLine={false}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}
