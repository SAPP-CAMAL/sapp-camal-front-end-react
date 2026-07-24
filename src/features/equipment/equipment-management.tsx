"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { HardHatIcon, ShirtIcon, Activity, Settings } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import {
  getEquipmentTypesService,
  getEquipmentsService,
} from "./server/db/equipment.service";
import { NewEquipmentType } from "./components/new-equipment-type";
import { UpdateEquipmentType } from "./components/update-equipment-type";
import { DeleteEquipmentType } from "./components/delete-equipment-type";
import { TableEquipmentTypes } from "./components/table-equipment-types";
import { NewEquipment } from "./components/new-equipment";
import { UpdateEquipment } from "./components/update-equipment";
import { DeleteEquipment } from "./components/delete-equipment";
import { TableEquipments } from "./components/table-equipments";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  EQUIPMENT_TYPES_TAG,
  EQUIPMENTS_TAG,
} from "./constants/equipment.constants";

export function EquipmentManagement() {
  const [typeFilter, setTypeFilter] = useState<string>("*");

  const typesQuery = useQuery({
    queryKey: [EQUIPMENT_TYPES_TAG],
    queryFn: getEquipmentTypesService,
  });

  const equipmentsQuery = useQuery({
    queryKey: [EQUIPMENTS_TAG],
    queryFn: getEquipmentsService,
  });

  const types = typesQuery.data?.data ?? [];

  const filteredEquipments = useMemo(() => {
    const items = equipmentsQuery.data?.data ?? [];

    return items.filter((item) =>
      typeFilter !== "*" ? String(item.idEquipmentType) === typeFilter : true
    );
  }, [equipmentsQuery.data, typeFilter]);

  return (
    <div className="space-y-6">
      <section>
        <h1 className="flex items-center gap-x-2 font-semibold text-xl">
          <HardHatIcon />
          Tipos de Equipo y Equipos de Bioseguridad
        </h1>
        <p className="text-gray-600 text-sm mt-1">
          Administra los tipos de equipo de bioseguridad (lavamanos, arcos
          sanitarios, etc.) y los equipos individuales de cada tipo.
        </p>
      </section>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-2">
            <div>
              <CardTitle className="flex items-center gap-2">
                <HardHatIcon className="h-4 w-4" />
                Tipos de Equipo
              </CardTitle>
              <CardDescription>Catálogo de tipos de equipo</CardDescription>
            </div>
            <NewEquipmentType />
          </div>
        </CardHeader>
        <CardContent>
          <TableEquipmentTypes
            columns={[
              {
                accessorKey: "description",
                header: () => "Descripción",
                cell: ({ row }) => row.original.description,
              },
              {
                accessorKey: "status",
                header: () => (
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    Estado
                  </div>
                ),
                cell: ({ row }) => (
                  <Badge>{row.original.status ? "Activo" : "Inactivo"}</Badge>
                ),
              },
              {
                id: "actions",
                header: () => (
                  <div className="flex items-center justify-center gap-2">
                    <Settings className="h-4 w-4" />
                    Acciones
                  </div>
                ),
                cell: ({ row }) => (
                  <div className="flex justify-center gap-x-2">
                    <UpdateEquipmentType equipmentType={row.original} />
                    <DeleteEquipmentType equipmentType={row.original} />
                  </div>
                ),
              },
            ]}
            data={types}
            isLoading={typesQuery.isLoading}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-2">
            <div>
              <CardTitle className="flex items-center gap-2">
                <ShirtIcon className="h-4 w-4" />
                Equipos
              </CardTitle>
              <CardDescription>
                Equipos individuales dentro de cada tipo
              </CardDescription>
            </div>
            <NewEquipment />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="max-w-xs">
            <label className="mb-1 text-sm font-medium text-gray-700 block">
              Filtrar por tipo
            </label>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="h-10 w-full border border-gray-300 rounded-md shadow-sm">
                <SelectValue placeholder="Seleccione un tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="*">Todos</SelectItem>
                {types.map((type) => (
                  <SelectItem key={type.id} value={String(type.id)}>
                    {type.description}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <TableEquipments
            columns={[
              {
                accessorKey: "description",
                header: () => "Descripción",
                cell: ({ row }) => row.original.description,
              },
              {
                accessorKey: "equipmentType",
                header: () => "Tipo",
                cell: ({ row }) =>
                  row.original.equipmentType?.description ??
                  types.find((t) => t.id === row.original.idEquipmentType)
                    ?.description ??
                  "—",
              },
              {
                accessorKey: "status",
                header: () => (
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    Estado
                  </div>
                ),
                cell: ({ row }) => (
                  <Badge>{row.original.status ? "Activo" : "Inactivo"}</Badge>
                ),
              },
              {
                id: "actions",
                header: () => (
                  <div className="flex items-center justify-center gap-2">
                    <Settings className="h-4 w-4" />
                    Acciones
                  </div>
                ),
                cell: ({ row }) => (
                  <div className="flex justify-center gap-x-2">
                    <UpdateEquipment equipment={row.original} />
                    <DeleteEquipment equipment={row.original} />
                  </div>
                ),
              },
            ]}
            data={filteredEquipments}
            isLoading={equipmentsQuery.isLoading}
          />
        </CardContent>
      </Card>
    </div>
  );
}
