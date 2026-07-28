"use client";

import { Building2Icon } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CleaningAreaGrouped } from "../domain/cleaning-area.domain";
import { NewCleaningAreaStructure } from "./new-cleaning-area-structure";
import { DeleteCleaningAreaStructure } from "./delete-cleaning-area-structure";
import { DeleteCleaningArea } from "./delete-cleaning-area";

export function CleaningAreaCard({
  area,
  idLine,
}: {
  area: CleaningAreaGrouped;
  idLine: number;
}) {
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
          <ul className="divide-y border rounded-md">
            {area.structures.map((structure) => (
              <li
                key={structure.id}
                className="flex items-center justify-between px-3 py-2"
              >
                <div className="flex items-center gap-2 min-w-0 flex-wrap">
                  <span className="text-sm break-words">{structure.catalogName}</span>
                  {structure.catalogType && (
                    <Badge variant="secondary">{structure.catalogType}</Badge>
                  )}
                </div>
                <DeleteCleaningAreaStructure
                  idStructure={structure.id}
                  idLine={idLine}
                />
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
