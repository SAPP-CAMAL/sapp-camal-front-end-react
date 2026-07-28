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

const NO_TYPE_GROUP = "SIN TIPO";

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

  const groupedEquipments = Object.entries(
    equipments.reduce<Record<string, typeof equipments>>((groups, item) => {
      const groupName = item.equipment?.equipmentType?.description ?? NO_TYPE_GROUP;
      (groups[groupName] ??= []).push(item);
      return groups;
    }, {})
  )
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([type, items]) => ({ type, items }));

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
          <div className="space-y-3">
            {groupedEquipments.map((group) => (
              <div key={group.type}>
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  {group.type}
                </span>
                <ul className="divide-y border rounded-md mt-1">
                  {group.items.map((item) => (
                    <li
                      key={item.id}
                      className="flex items-center justify-between px-3 py-2"
                    >
                      <span className="text-sm break-words min-w-0">
                        {item.equipment?.description}
                      </span>
                      <DeleteSettingEquipmentLine
                        id={item.id}
                        idBiosecurityLine={biosecurityLine.id}
                      />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
