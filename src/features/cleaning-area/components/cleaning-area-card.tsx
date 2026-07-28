"use client";

import { Building2Icon } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CleaningAreaGrouped } from "../domain/cleaning-area.domain";
import { NewCleaningAreaStructure } from "./new-cleaning-area-structure";
import { DeleteCleaningAreaStructure } from "./delete-cleaning-area-structure";
import { DeleteCleaningArea } from "./delete-cleaning-area";
import { CLEANING_CATALOG_TYPES } from "@/features/cleaning-catalog/domain/cleaning-catalog.domain";

const normalizedType = (type?: string | null) => (type ?? "").toUpperCase().trim();

export function CleaningAreaCard({
  area,
  idLine,
}: {
  area: CleaningAreaGrouped;
  idLine: number;
}) {
  const groupedStructures = [...CLEANING_CATALOG_TYPES, "OTROS" as const]
    .map((type) => ({
      type,
      items: area.structures.filter((structure) =>
        type === "OTROS"
          ? !CLEANING_CATALOG_TYPES.includes(
              normalizedType(structure.catalogType) as (typeof CLEANING_CATALOG_TYPES)[number]
            )
          : normalizedType(structure.catalogType) === type
      ),
    }))
    .filter((group) => group.items.length > 0);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <CardTitle className="flex items-center gap-2 break-words">
              <Building2Icon className="h-4 w-4 shrink-0" />
              {area.areaCatalogName}
            </CardTitle>
            {area.areaCatalogDescription && (
              <CardDescription>{area.areaCatalogDescription}</CardDescription>
            )}
          </div>
          <DeleteCleaningArea idArea={area.idArea} idLine={idLine} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            Estructuras y materiales
          </span>
          <NewCleaningAreaStructure
            idArea={area.idArea}
            idLine={idLine}
            existingStructures={area.structures}
          />
        </div>

        {area.structures.length === 0 ? (
          <p className="text-sm text-gray-500 py-4 text-center border-2 border-dashed rounded-md">
            No hay estructuras/materiales asignados a esta área
          </p>
        ) : (
          <div className="space-y-3">
            {groupedStructures.map((group) => (
              <div key={group.type}>
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  {group.type}
                </span>
                <ul className="divide-y border rounded-md mt-1">
                  {group.items.map((structure) => (
                    <li
                      key={structure.id}
                      className="flex items-center justify-between px-3 py-2"
                    >
                      <span className="text-sm break-words min-w-0">
                        {structure.catalogName}
                      </span>
                      <DeleteCleaningAreaStructure
                        idStructure={structure.id}
                        idLine={idLine}
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
