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
import {
  Car,
  Check,
  Loader2,
  MapPin,
  SearchIcon,
  ToggleLeftIcon,
  ToggleRightIcon,
  User,
  Settings2,
  ArrowLeftRight,
  Tag,
  Info,
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
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
import { DialogDescription } from "@radix-ui/react-dialog";
import { Textarea } from "@/components/ui/textarea";
import { ResponseProvinces } from "@/features/provinces/server/provinces.service";
import { useParishesByCantonId } from "@/features/provinces/hooks/use-parishes";
import { useCantonsByProvinceId } from "@/features/provinces/hooks/use-cantons";
import { Person, ResponsePeopleByFilter } from "@/features/people/domain";
import {
  createAdresseesService,
  updateAdresseesService,
  assignBrandToAddresseeService,
} from "../server/addressees.service";
import { getPeopleByFilterService } from "@/features/people/server/db/people.service";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Addressees } from "../domain";
import { useDebouncedCallback } from "use-debounce";
import { getBrandsByName } from "@/features/brand/server/db/brand.service";

// Type for the brand with introducer info
type BrandWithIntroducer = {
  id: number;
  name: string;
  description: string | null;
  introducerId: number;
  status: boolean;
  introducer: {
    id: number;
    user: {
      id: number;
      person: {
        identification: string;
        fullName: string;
      };
    };
  };
};

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
  const [provinceId, setProvinceId] = useState<string>("*");
  const [cantonId, setCantonId] = useState<string>("*");
  const [parishId, setParishId] = useState<string>("*");
  const [address, setAddress] = useState("");
  const [personData, setPersonData] = useState<Person[]>([]);
  const [isActive, setIsActive] = useState(addresseeData?.status);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [debouncedFullName, setDebouncedFullName] = useState("");
  const [debouncedIdentification, setDebouncedIdentification] = useState("");
  
  // New states for Estado/Asignar views
  const [activeView, setActiveView] = useState<'status' | 'assign'>('status');
  const [brandSearchText, setBrandSearchText] = useState("");
  const [debouncedBrandSearch, setDebouncedBrandSearch] = useState("");
  const [foundBrands, setFoundBrands] = useState<BrandWithIntroducer[]>([]);
  const [isSearchingBrands, setIsSearchingBrands] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<BrandWithIntroducer | null>(null);
  const [showBrandSearch, setShowBrandSearch] = useState(false);
  const [currentBrandName, setCurrentBrandName] = useState<string>("");
  const [showRemoveBrandDialog, setShowRemoveBrandDialog] = useState(false);

  const { data: cantons, isLoading: cantonsLoading } = useCantonsByProvinceId(
    Number(provinceId)
  );
  const { data: parishes, isLoading: parishesLoading } = useParishesByCantonId(
    Number(cantonId)
  );

  // Initialize form when dialog opens in edit mode
  useEffect(() => {
    if (open && isUpdate && addresseeData) {
      initializeFormWithData(addresseeData);
      
      // Initialize current brand if available
      if (addresseeData.brand) {
        setCurrentBrandName(addresseeData.brand);
        setShowBrandSearch(false);
      } else {
        setCurrentBrandName("");
        setShowBrandSearch(true);
      }
      
      // Initialize province immediately if available
      if (addresseeData.addresses && provinces) {
        const currentAddress = addresseeData.addresses;
        const province = provinces.find(
          (p) => p.name.toUpperCase() === currentAddress.province.toUpperCase()
        );
        if (province) {
          setProvinceId(String(province.id));
        }
      }
    }
  }, [open, isUpdate, addresseeData, provinces]);

  // Load canton when province is set and cantons are available
  useEffect(() => {
    if (!isUpdate || !addresseeData?.addresses) return;
    if (!cantons?.data || cantons.data.length === 0) return;
    if (provinceId === "*") return;

    const currentAddress = addresseeData.addresses;
    const canton = cantons.data.find(
      (c: any) => c.name.toUpperCase() === currentAddress.canton.toUpperCase()
    );

    if (canton) {
      setCantonId(String(canton.id));
    }
  }, [isUpdate, addresseeData, cantons?.data, provinceId]);

  // Load parish when canton is set and parishes are available
  useEffect(() => {
    if (!isUpdate || !addresseeData?.addresses) return;
    if (!parishes?.data || parishes.data.length === 0) return;
    if (cantonId === "*") return;

    const currentAddress = addresseeData.addresses;
    const parish = parishes.data.find(
      (p: any) => p.name.toUpperCase() === currentAddress.parish.toUpperCase()
    );

    if (parish) {
      setParishId(String(parish.id));
    }
  }, [isUpdate, addresseeData, parishes?.data, cantonId]);

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
    setAddress(data.addresses?.firstStree || "");
  };

  const updateDebouncedFullName = useDebouncedCallback((value: string) => {
    setDebouncedFullName(value);
  }, 500);

  const updateDebouncedIdentification = useDebouncedCallback(
    (value: string) => {
      setDebouncedIdentification(value);
    },
    500
  );

  const updateDebouncedBrandSearch = useDebouncedCallback(
    (value: string) => {
      setDebouncedBrandSearch(value);
    },
    500
  );

  const query = useQuery<ResponsePeopleByFilter>({
    queryKey: ["people", debouncedFullName, debouncedIdentification],
    queryFn: () =>
      getPeopleByFilterService({
        ...(debouncedIdentification.trim() !== "" && {
          identificacion: debouncedIdentification,
        }),
        ...(debouncedFullName.trim().length >= 2 && {
          fullName: debouncedFullName,
        }),
      }),
    enabled:
      debouncedFullName.trim().length >= 2 ||
      debouncedIdentification.trim().length >= 3,
  });

  useEffect(() => {
    if (query?.data?.data?.items !== undefined) {
      setPersonData(query.data.data.items);
    }
  }, [query?.data?.data?.items]);

  useEffect(() => {
    if (
      debouncedFullName.trim().length < 2 &&
      debouncedIdentification.trim().length < 3
    ) {
      setPersonData([]);
      setSelectedPerson(null);
      return;
    }

    if (query?.data?.data?.items !== undefined) {
      setPersonData(query.data.data.items);
    }
  }, [query?.data?.data?.items, debouncedFullName, debouncedIdentification]);

  useEffect(() => {
    updateDebouncedFullName(filterFullName);
  }, [filterFullName]);

  useEffect(() => {
    updateDebouncedIdentification(filterIdentification);
  }, [filterIdentification]);

  // Brand search effect
  useEffect(() => {
    if (debouncedBrandSearch.length < 1) {
      setFoundBrands([]);
      return;
    }

    const searchBrands = async () => {
      setIsSearchingBrands(true);
      try {
        const response = await getBrandsByName(debouncedBrandSearch);
        setFoundBrands(response.data || []);
      } catch (error: any) {
        setFoundBrands([]);
        
        // Mostrar mensaje de error del backend
        if (error.response) {
          try {
            const errorData = await error.response.json();
            toast.error(errorData.data || errorData.message || "Error al buscar marcas");
          } catch {
            toast.error("Error al buscar marcas");
          }
        } else {
          toast.error("Error al buscar marcas");
        }
      } finally {
        setIsSearchingBrands(false);
      }
    };

    searchBrands();
  }, [debouncedBrandSearch]);

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
          addressId: addresseeData?.addresses?.id || 1,
          firstStreet: address,
          status: isActive ?? true,
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
    setProvinceId("*");
    setCantonId("*");
    setParishId("*");
    setAddress("");
    setSelectedPerson(null);
    setPersonData([]);
    setDebouncedFullName("");
    setDebouncedIdentification("");
    setIsActive(true);
    setActiveView('status');
    setBrandSearchText("");
    setDebouncedBrandSearch("");
    setFoundBrands([]);
    setSelectedBrand(null);
    setShowBrandSearch(false);
    setCurrentBrandName("");
  };

  const handleToggleStatus = () => {
    setIsActive(!isActive);
  };

  const handleRemoveBrand = async () => {
    if (!selectedPerson) {
      toast.error("No hay destinatario seleccionado");
      return;
    }

    setIsSubmitting(true);

    try {
      await assignBrandToAddresseeService(selectedPerson.id, null);
      toast.success("Marca eliminada exitosamente");
      
      // Clear current brand
      setCurrentBrandName("");
      setShowBrandSearch(true);
      setShowRemoveBrandDialog(false);
      
      onSuccess?.();
    } catch (error: any) {
      console.error("Error al eliminar marca:", error);
      toast.error("Error al eliminar la marca");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAssignBrand = async () => {
    if (!selectedBrand) {
      toast.error("Debe seleccionar una marca");
      return;
    }

    if (!selectedPerson) {
      toast.error("No hay destinatario seleccionado");
      return;
    }

    setIsSubmitting(true);

    try {
      await assignBrandToAddresseeService(selectedPerson.id, selectedBrand.id);
      toast.success(`Marca "${selectedBrand.name}" asignada exitosamente`);
      
      // Update current brand name and hide search
      setCurrentBrandName(selectedBrand.name);
      setShowBrandSearch(false);
      setSelectedBrand(null);
      setBrandSearchText("");
      setDebouncedBrandSearch("");
      setFoundBrands([]);
      
      onSuccess?.();
    } catch (error: any) {
      console.error("Error al asignar marca:", error);
      toast.error("Error al asignar la marca");
    } finally {
      setIsSubmitting(false);
    }
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

      <DialogContent className="w-[95vw] md:max-w-5xl max-h-[95vh] overflow-y-auto">
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

        {isUpdate && (
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
            {/* Green Sliding Pill */}
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
        )}

        {activeView === 'status' ? (
          <>
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full mt-4">
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
                      setPersonData([]);
                      updateDebouncedFullName(e.target.value);
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
                      setPersonData([]);
                      updateDebouncedIdentification(e.target.value);
                    }}
                    disabled={isUpdate}
                  />
                </div>
              </div>
            </div>

            {/* Mostrar mensajes o resultados solo si hay búsqueda activa */}
            {!selectedPerson && (filterFullName.trim().length >= 2 || filterIdentification.trim().length >= 3) && (
              <>
                {/* Mostrar "Buscando..." mientras se espera el debounce o se carga */}
                {(filterFullName !== debouncedFullName || filterIdentification !== debouncedIdentification || query.isFetching) && (!personData || personData?.length === 0) && (
                  <div className="mt-4 p-4 border border-gray-200 rounded-md text-center text-sm text-gray-500 bg-muted/20">
                    Buscando...
                  </div>
                )}

                {/* Mostrar "No se encontraron" solo cuando terminó la búsqueda */}
                {filterFullName === debouncedFullName && filterIdentification === debouncedIdentification && !query.isFetching && (!personData || personData?.length === 0) && (
                  <div className="mt-4 p-4 border border-gray-200 rounded-md text-center text-sm text-gray-500 bg-muted/20">
                    No se encontraron resultados para la búsqueda.
                  </div>
                )}

                {/* Lista de personas */}
                {personData && personData?.length > 0 && (
                  <div className="w-full mt-4 h-64 overflow-y-auto border border-gray-300 rounded-md p-4">
                    <div className="flex flex-col gap-2">
                      {personData?.map((person: Person) => {
                        return (
                          <div
                            key={person.id}
                            onClick={() => setSelectedPerson(person)}
                            style={{ cursor: 'pointer' }}
                            className="rounded-xl px-3 py-2 transition-colors flex justify-between items-center hover:bg-muted"
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
              </>
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
            {isUpdate && (
              <div className="w-full mb-4">
                <Label className="text-sm font-medium">Estado</Label>
                <div className="rounded-xl px-3 py-2 bg-muted border mt-2">
                  <button
                    type="button"
                    onClick={handleToggleStatus}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors w-full justify-between"
                  >
                    <span className={isActive ? "font-bold" : "text-gray-400"}>
                      {isActive ? "Activo" : "Inactivo"}
                    </span>
                    {isActive ? (
                      <ToggleRightIcon className="w-8 h-8 text-primary" />
                    ) : (
                      <ToggleLeftIcon className="w-8 h-8 text-gray-500" />
                    )}
                  </button>
                </div>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
              <div className="flex flex-col w-full">
                <label className="mb-1 text-sm font-medium text-gray-700">
                  Provincia
                </label>
                <Select
                  onValueChange={(value) => setProvinceId(value)}
                  value={provinceId || "*"}
                  disabled={isUpdate && !isActive}
                >
                  <SelectTrigger className="h-10 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <SelectValue placeholder="Seleccione la provincia" />
                  </SelectTrigger>
                  <SelectContent className="w-full">
                    <SelectItem value="*">Todas las provincias</SelectItem>
                    {provinces?.map((province, index) => (
                      <SelectItem key={index} value={String(province.id)}>
                        {province.name.toUpperCase()}
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
                  disabled={(isUpdate && !isActive) || provinceId === "*" || cantonsLoading}
                >
                  <SelectTrigger className="h-10 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <SelectValue placeholder={cantonsLoading ? "Cargando cantones..." : "Seleccione el cantón"} />
                  </SelectTrigger>
                  <SelectContent className="w-full">
                    <SelectItem value="*">Todos los cantones</SelectItem>
                    {cantons?.data?.map((canton, index) => (
                      <SelectItem key={index} value={String(canton.id)}>
                        {canton.name.toUpperCase()}
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
                  disabled={(isUpdate && !isActive) || cantonId === "*" || parishesLoading}
                >
                  <SelectTrigger className="h-10 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <SelectValue placeholder={parishesLoading ? "Cargando parroquias..." : "Seleccione la parroquia"} />
                  </SelectTrigger>
                  <SelectContent className="w-full">
                    <SelectItem value="*">Todas las parroquias</SelectItem>
                    {parishes?.data?.map((parish, index) => (
                      <SelectItem key={index} value={String(parish.id)}>
                        {parish.name.toUpperCase()}
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
                disabled={isSubmitting || (isUpdate && !isActive)}
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
            className="bg-primary hover:bg-gray-800"
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
          </>
        ) : (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center gap-3 p-3 bg-primary/10 border border-primary/20 rounded-lg text-primary text-sm font-medium">
              <Info className="h-5 w-5 shrink-0 text-primary" />
              <p>Busca y asigna marcas al destinatario actual.</p>
            </div>

            {/* Show current brand if exists and search is not active */}
            {!showBrandSearch && currentBrandName ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Tag className="h-5 w-5 text-gray-700" />
                    Marca Seleccionada
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-full">
                          <Tag className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-xs text-primary/60 font-semibold uppercase tracking-wider">Marca Actual</p>
                          <p className="text-sm font-bold text-primary">{currentBrandName}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => setShowBrandSearch(true)}
                          disabled={isSubmitting}
                        >
                          Cambiar
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setShowRemoveBrandDialog(true)}
                          disabled={isSubmitting}
                        >
                          ✕
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Tag className="h-5 w-5 text-gray-700" />
                    Buscar Marca
                  </CardTitle>
                  <CardDescription>
                    Ingrese el nombre de la marca para buscar
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="relative">
                    <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <Input
                      placeholder="Buscar marca por nombre..."
                      value={brandSearchText}
                      onChange={(e) => {
                        setBrandSearchText(e.target.value);
                        updateDebouncedBrandSearch(e.target.value);
                      }}
                      className="pl-10 h-11"
                    />
                    {isSearchingBrands && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                      </div>
                    )}
                  </div>

                  {selectedBrand && (
                    <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-primary/10 rounded-full">
                            <Tag className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="text-xs text-primary/60 font-semibold uppercase tracking-wider">Marca Seleccionada</p>
                            <p className="text-sm font-bold text-primary">{selectedBrand.name}</p>
                            {selectedBrand.description && (
                              <p className="text-xs text-gray-600">{selectedBrand.description}</p>
                            )}
                            <p className="text-xs text-gray-500 mt-1">
                              Introductor: {selectedBrand.introducer.user.person.fullName}
                            </p>
                          </div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => setSelectedBrand(null)}
                        >
                          Cambiar
                        </Button>
                      </div>
                    </div>
                  )}

                  <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-2">
                    {foundBrands.length > 0 && !selectedBrand ? (
                      foundBrands.map((brand) => (
                        <Card 
                          key={brand.id} 
                          className="border-gray-200 hover:border-primary/50 transition-colors cursor-pointer"
                          onClick={() => setSelectedBrand(brand)}
                        >
                          <CardHeader className="p-4 bg-gray-50/50">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 flex-1">
                                <Tag className="h-4 w-4 text-primary" />
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold">{brand.name}</span>
                                  <Badge variant={brand.status ? 'default' : 'secondary'}>
                                    {brand.status ? 'Activa' : 'Inactiva'}
                                  </Badge>
                                </div>
                                {brand.description && (
                                  <p className="text-xs text-gray-600 mt-1">{brand.description}</p>
                                )}
                                <p className="text-xs text-gray-500 mt-1">
                                  Introductor: <span className="font-medium">{brand.introducer.user.person.fullName}</span>
                                </p>
                                <p className="text-xs text-gray-400">
                                  CI: {brand.introducer.user.person.identification}
                                </p>
                              </div>
                            </div>
                          </div>
                        </CardHeader>
                      </Card>
                    ))
                  ) : brandSearchText.length >= 1 && !isSearchingBrands && !selectedBrand ? (
                    <div className="text-center py-10 text-gray-500">
                      <SearchIcon className="h-10 w-10 mx-auto mb-2 opacity-20" />
                      <p>No se encontraron marcas</p>
                    </div>
                  ) : !selectedBrand ? (
                    <div className="text-center py-10 text-gray-400 border-2 border-dashed rounded-xl">
                      <SearchIcon className="h-10 w-10 mx-auto mb-2 opacity-20" />
                      <p className="text-sm">Ingresa el nombre de la marca para buscar</p>
                    </div>
                  ) : null}
                </div>

                {selectedBrand && (
                  <Button
                    onClick={handleAssignBrand}
                    className="w-full bg-primary hover:bg-primary/90"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                        Asignando...
                      </>
                    ) : (
                      <>
                        <Check className="mr-1 h-4 w-4" />
                        Asignar Marca
                      </>
                    )}
                  </Button>
                )}
              </CardContent>
            </Card>
            )}

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setActiveView('status');
                  setSelectedBrand(null);
                  setBrandSearchText("");
                  setDebouncedBrandSearch("");
                  setFoundBrands([]);
                  setShowBrandSearch(false);
                }}
              >
                Volver a Estado
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  resetForm();
                  setOpen(false);
                }}
              >
                Cerrar
              </Button>
            </div>
          </div>
        )}

        <AlertDialog open={showRemoveBrandDialog} onOpenChange={setShowRemoveBrandDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Está seguro de eliminar la marca?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción eliminará la marca <span className="font-bold text-gray-900">"{currentBrandName}"</span> del destinatario. 
                Podrá asignar una nueva marca en cualquier momento.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isSubmitting}>Cancelar</AlertDialogCancel>
              <AlertDialogAction 
                onClick={(e) => {
                  e.preventDefault();
                  handleRemoveBrand();
                }}
                className="bg-destructive hover:bg-destructive/90"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Eliminando...
                  </>
                ) : (
                  "Sí, eliminar marca"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DialogContent>
    </Dialog>
  );
}
