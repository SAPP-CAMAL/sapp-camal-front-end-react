import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Car, Check, Loader2, MapPin, SearchIcon, User } from "lucide-react";
import { toast } from "sonner";
import {
  createVehicleService,
  updateVehicleService,
} from "@/features/vehicles/server/db/vehicle.service";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DialogDescription } from "@radix-ui/react-dialog";
import { Textarea } from "@/components/ui/textarea";
import { ResponseProvinces } from "@/features/provinces/server/provinces.service";
import { capitalizeText } from "@/lib/utils";
import { useParishesByCantonId } from "@/features/provinces/hooks/use-parishes";
import { useCantonsByProvinceId } from "@/features/provinces/hooks/use-cantons";
import { Person, ResponsePeopleByFilter } from "@/features/people/domain";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import {
  createAdresseesService,
  updateAdresseesService,
} from "../server/addressees.service";
import { getPeopleByFilterService } from "@/features/people/server/db/people.service";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Addressees } from "../domain";

interface NewAddresseesFormProps {
  provinces: ResponseProvinces[];
  trigger: React.ReactNode;
  isUpdate?: boolean;
  addresseeData?: Addressees & { id?: number };
  onSuccess?: () => void;
}

export default function NewAddresseesForm({
  trigger,
  isUpdate = false,
  onSuccess,
  provinces,
  addresseeData,
}: NewAddresseesFormProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filterFullName, setFilterFullName] = useState("");
  const [filterIdentification, setFilterIdentification] = useState("");
  const [provinceId, setProvinceId] = useState<string | undefined>();
  const [cantonId, setCantonId] = useState<string | undefined>();
  const [parishId, setParishId] = useState<string | undefined>();
  const [address, setAddress] = useState("");
  const [personData, setPersonData] = useState<Person[]>([]);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);

  const { data: cantons, isLoading: cantonsLoading } = useCantonsByProvinceId(
    Number(provinceId)
  );
  const { data: parishes, isLoading: parishesLoading } = useParishesByCantonId(
    Number(cantonId)
  );

  useEffect(() => {
    if (open && isUpdate && addresseeData) {
      initializeFormWithData(addresseeData);
    }
  }, [open, isUpdate, addresseeData]);

  useEffect(() => {
    if (open && isUpdate && addresseeData) {
      initializeFormWithData(addresseeData);
    }
  }, [open, isUpdate, addresseeData]);

  useEffect(() => {
    if (!addresseeData?.addresses?.[0]) return;

    const currentAddress = addresseeData.addresses[0];
    const province = provinces?.find(
      (p) => p.name.toUpperCase() === currentAddress.province.toUpperCase()
    );

    if (province) {
      setProvinceId(String(province.id));
    }
  }, [addresseeData, provinces]);

  useEffect(() => {
    if (
      !addresseeData?.addresses?.[0] ||
      !cantons?.data ||
      cantons.data.length === 0
    )
      return;

    const currentAddress = addresseeData.addresses[0];
    const canton = cantons.data.find(
      (c: any) => c.name.toUpperCase() === currentAddress.canton.toUpperCase()
    );

    if (canton) {
      setCantonId(String(canton.id));
    }
  }, [addresseeData, cantons?.data]);

  useEffect(() => {
    if (
      !addresseeData?.addresses?.[0] ||
      !parishes?.data ||
      parishes.data.length === 0
    )
      return;

    const currentAddress = addresseeData.addresses[0];
    const parish = parishes.data.find(
      (p: any) => p.name.toUpperCase() === currentAddress.parish.toUpperCase()
    );

    if (parish) {
      setParishId(String(parish.id));
    }
  }, [addresseeData, parishes?.data]);

  const initializeFormWithData = (data: any) => {
    const person: Person = {
      id: data.id,
      fullName: data.fullName,
      identification: data.identification,
      email: data.email,
      mobileNumber: data.mobileNumber || "",
    };

    setSelectedPerson(person);
    setFilterFullName(data.fullName);
    setFilterIdentification(data.identification);
    setAddress(data.addresses?.[0]?.firstStree || "");
  };

  const query = useQuery<ResponsePeopleByFilter>({
    queryKey: ["people"],
    queryFn: () =>
      getPeopleByFilterService({
        ...(filterIdentification != "" && {
          identificacion: filterIdentification,
        }),
        ...(filterFullName.length > 2 && {
          fullName: filterFullName,
        }),
      }),
    enabled: false,
  });

  useEffect(() => {
    if (query?.data?.data?.items) {
      setPersonData(query.data.data.items);
    }
  }, [query?.data?.data?.items]);

  useEffect(() => {
    if (isUpdate && selectedPerson) {
      return;
    }

    const hasSearch =
      filterFullName.trim() !== "" || filterIdentification.trim() !== "";
    if (hasSearch) {
      query.refetch();
    } else {
      setSelectedPerson(null);
    }
  }, [filterFullName, filterIdentification]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedPerson) {
      toast.error("Debe seleccionar una persona");
      return;
    }

    if (!parishId || parishId === "*") {
      toast.error("Debe seleccionar una parroquia");
      return;
    }

    if (!address.trim()) {
      toast.error("Debe ingresar la dirección");
      return;
    }

    setIsSubmitting(true);

    try {
      if (isUpdate) {
        await updateAdresseesService(selectedPerson.id, {
          parishId: Number(parishId),
          addressId: addresseeData?.addresses?.[0]?.id || 1,
          firstStreet: address,
          status: true,
        });
        toast.success("Destinatario actualizado correctamente");
      } else {
        await createAdresseesService({
          parishId: Number(parishId),
          firstStreet: address,
          personId: selectedPerson.id,
        });
        toast.success("Destinatario creado exitosamente");
      }

      resetForm();
      onSuccess?.();
      setOpen(false);
    } catch (error: any) {
      const errorMessage =
        error?.response?.status === 404
          ? "La persona ya se encuentra registrada como destinatario."
          : "Error al guardar el destinatario";

      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFilterFullName("");
    setFilterIdentification("");
    setProvinceId(undefined);
    setCantonId(undefined);
    setParishId(undefined);
    setAddress("");
    setSelectedPerson(null);
    setPersonData([]);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        if (!newOpen) {
          resetForm();
        }
        setOpen(newOpen);
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>

      <DialogContent className="min-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isUpdate ? "Editar Destinatario" : "Nuevo Destinatario"}
          </DialogTitle>
          <DialogDescription>
            {isUpdate
              ? "Modifique la información del destinatario."
              : "Complete el formulario para registrar un nuevo destinatario."}
          </DialogDescription>
        </DialogHeader>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-gray-700" />
              Información del Destinatario
            </CardTitle>
            <CardDescription>
              {isUpdate
                ? "La persona está bloqueada en modo edición."
                : "Busque y seleccione la persona que actuará como destinatario."}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Label htmlFor="" className="font-semibold">
              Buscar Persona
            </Label>

            <div className="grid grid-cols-2 gap-x-4 w-full mt-4">
              <div className="flex flex-col w-full">
                <div className="relative">
                  <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 z-10 h-5 w-5" />
                  <Input
                    type="text"
                    placeholder="Buscar por nombre..."
                    className="pl-10 pr-3 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 h-10"
                    value={filterFullName}
                    onChange={(e) => {
                      setFilterFullName(e.target.value);
                    }}
                    disabled={isUpdate}
                  />
                </div>
              </div>

              <div className="flex flex-col w-full">
                <div className="relative">
                  <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 z-10 h-5 w-5" />
                  <Input
                    type="text"
                    placeholder="Número de Identificación..."
                    className="pl-10 pr-3 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 h-10"
                    value={filterIdentification}
                    onChange={(e) => {
                      setFilterIdentification(e.target.value);
                    }}
                    disabled={isUpdate}
                  />
                </div>
              </div>
            </div>

            {!selectedPerson && personData && personData?.length > 0 && (
              <div className="w-full mt-4 h-64 overflow-y-auto border border-gray-300 rounded-md p-4">
                <div className="flex flex-col gap-2">
                  {personData?.map((person: Person) => {
                    return (
                      <div
                        key={person.id}
                        onClick={() => setSelectedPerson(person)}
                        className="cursor-pointer rounded-xl px-3 py-2 transition-colors flex justify-between items-center hover:bg-muted"
                      >
                        <div>
                          <p className="font-semibold">{person.fullName}</p>
                          <p className="text-sm text-muted-foreground">
                            {person.identification} • {person.mobileNumber}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {selectedPerson && (
              <div className="w-full mt-4">
                <div className="rounded-xl px-3 py-2 transition-colors flex justify-between items-center bg-muted border">
                  <div>
                    <p className="font-semibold">{selectedPerson.fullName}</p>
                    <p className="text-sm text-foreground">
                      {selectedPerson.identification} • {selectedPerson.email}
                      {selectedPerson.mobileNumber}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="default">Seleccionada</Badge>
                    {!isUpdate && (
                      <button
                        onClick={() => setSelectedPerson(null)}
                        className="text-xs text-muted-foreground hover:text-foreground"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-gray-700" />
              Dirección del Destinatario
            </CardTitle>
            <CardDescription>
              Seleccione la ubicación y detalle la dirección del destinatario.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
              <div className="flex flex-col w-full">
                <label className="mb-1 text-sm font-medium text-gray-700">
                  Provincia
                </label>
                <Select
                  onValueChange={(value) => setProvinceId(value)}
                  value={provinceId || "*"}
                >
                  <SelectTrigger className="h-10 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <SelectValue placeholder="Seleccione la provincia" />
                  </SelectTrigger>
                  <SelectContent className="w-full">
                    <SelectItem value="*">Todas las provincias</SelectItem>
                    {provinces?.map((province, index) => (
                      <SelectItem key={index} value={String(province.id)}>
                        {capitalizeText(province.name)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col w-full">
                <label className="mb-1 text-sm font-medium text-gray-700">
                  Cantón
                </label>
                <Select
                  onValueChange={(value) => setCantonId(value)}
                  value={cantonId || "*"}
                >
                  <SelectTrigger className="h-10 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <SelectValue placeholder="Seleccione el cantón" />
                  </SelectTrigger>
                  <SelectContent className="w-full">
                    <SelectItem value="*">Todos los cantones</SelectItem>
                    {cantons?.data?.map((canton, index) => (
                      <SelectItem key={index} value={String(canton.id)}>
                        {capitalizeText(canton.name)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col w-full">
                <label className="mb-1 text-sm font-medium text-gray-700">
                  Parroquia
                </label>
                <Select
                  onValueChange={(value) => setParishId(value)}
                  value={parishId || "*"}
                >
                  <SelectTrigger className="h-10 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <SelectValue placeholder="Seleccione la parroquia" />
                  </SelectTrigger>
                  <SelectContent className="w-full">
                    <SelectItem value="*">Todas las parroquias</SelectItem>
                    {parishes?.data?.map((parish, index) => (
                      <SelectItem key={index} value={String(parish.id)}>
                        {capitalizeText(parish.name)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="mt-6">
              <Label className="mb-2 block font-semibold text-gray-700">
                Dirección Completa <span className="text-red-500">*</span>
              </Label>
              <Textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Calle, número, referencias, etc."
                disabled={isSubmitting}
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                Incluya detalles específicos como número de casa, edificio,
                referencias, etc.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
          <Button
            variant="outline"
            type="button"
            onClick={() => {
              resetForm();
              setOpen(false);
            }}
          >
            Cancelar
          </Button>

          <Button
            onClick={handleSubmit}
            className="bg-black hover:bg-gray-800"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                {isUpdate ? "Actualizando..." : "Creando..."}
              </>
            ) : isUpdate ? (
              "Actualizar Destinatario"
            ) : (
              "Crear Destinatario"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
