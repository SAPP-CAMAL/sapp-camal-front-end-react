"use client";

import { ShieldCheckIcon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BiosecurityLine } from "../domain/biosecurity-lines.domain";
import { getSettingEquipmentLinesByBiosecurityLineService } from "../server/db/biosecurity-lines.service";
import { SETTING_EQUIPMENT_LINES_TAG } from "../constants/biosecurity-lines.constants";
import { NewSettingEquipmentLine } from "./new-setting-equipment-line";
import { DeleteSettingEquipmentLine } from "./delete-setting-equipment-line";
import { DeleteBiosecurityLine } from "./delete-biosecurity-line";

export function BiosecurityLineCard({
  biosecurityLine,
}: {
  biosecurityLine: BiosecurityLine;
}) {
  const equipmentsQuery = useQuery({
    queryKey: [SETTING_EQUIPMENT_LINES_TAG, biosecurityLine.id],
    queryFn: () =>
      getSettingEquipmentLinesByBiosecurityLineService(biosecurityLine.id),
  });

  const equipments = equipmentsQuery.data?.data ?? [];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <CardTitle className="flex items-center gap-2 break-words">
              <ShieldCheckIcon className="h-4 w-4 shrink-0" />
              {biosecurityLine.name}
            </CardTitle>
            <CardDescription>
              <Badge>
                {biosecurityLine.status ? "Activo" : "Inactivo"}
              </Badge>
            </CardDescription>
          </div>
          <DeleteBiosecurityLine id={biosecurityLine.id} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Equipos</span>
          <NewSettingEquipmentLine
            idBiosecurityLine={biosecurityLine.id}
            existingEquipments={equipments}
          />
        </div>

        {equipmentsQuery.isLoading ? (
          <p className="text-sm text-gray-400 py-4 text-center">
            Cargando equipos...
          </p>
        ) : equipments.length === 0 ? (
          <p className="text-sm text-gray-500 py-4 text-center border-2 border-dashed rounded-md">
            No hay equipos asignados a esta línea
          </p>
        ) : (
          <ul className="divide-y border rounded-md">
            {equipments.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between px-3 py-2"
              >
                <div className="flex items-center gap-2 min-w-0 flex-wrap">
                  <span className="text-sm break-words">{item.equipment?.description}</span>
                  {item.equipment?.equipmentType && (
                    <Badge variant="secondary">
                      {item.equipment.equipmentType.description}
                    </Badge>
                  )}
                </div>
                <DeleteSettingEquipmentLine
                  id={item.id}
                  idBiosecurityLine={biosecurityLine.id}
                />
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
