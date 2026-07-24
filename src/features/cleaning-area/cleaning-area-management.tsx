"use client";

import { useMemo } from "react";
import { Building2Icon, SearchIcon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { parseAsInteger, useQueryStates } from "nuqs";
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
import { getActiveLinesService } from "@/features/postmortem/server/db/line.service";
import { getCleaningAreasByLineService } from "./server/db/cleaning-area.service";
import { CLEANING_AREA_BY_LINE_TAG } from "./constants/cleaning-area.constants";
import { NewCleaningArea } from "./components/new-cleaning-area";
import { CleaningAreaCard } from "./components/cleaning-area-card";

export function CleaningAreaManagement() {
  const [searchParams, setSearchParams] = useQueryStates(
    {
      idLine: parseAsInteger,
    },
    {
      history: "push",
    }
  );

  const linesQuery = useQuery({
    queryKey: ["active-lines"],
    queryFn: getActiveLinesService,
  });

  const areasQuery = useQuery({
    queryKey: [CLEANING_AREA_BY_LINE_TAG, searchParams.idLine],
    queryFn: () => getCleaningAreasByLineService(searchParams.idLine as number),
    enabled: !!searchParams.idLine,
  });

  const areas = useMemo(
    () =>
      (areasQuery.data?.data ?? []).sort(
        (a, b) => (a.areaOrderIndex ?? 0) - (b.areaOrderIndex ?? 0)
      ),
    [areasQuery.data]
  );

  return (
    <div>
      <section className="mb-4 flex flex-col sm:flex-row sm:justify-between gap-2">
        <div>
          <h1 className="flex items-center gap-x-2 font-semibold text-xl">
            <Building2Icon />
            Áreas por Línea y su Estructura
          </h1>
          <p className="text-gray-600 text-sm mt-1">
            Configura qué áreas de limpieza tiene cada línea de producción y
            qué estructuras/materiales hay en cada área.
          </p>
        </div>
        {searchParams.idLine && (
          <div className="flex gap-x-2">
            <NewCleaningArea idLine={searchParams.idLine} existingAreas={areas} />
          </div>
        )}
      </section>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Línea de Producción</CardTitle>
          <CardDescription>
            Selecciona una línea para ver y configurar sus áreas de limpieza
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="max-w-sm">
            <Select
              onValueChange={(value) => setSearchParams({ idLine: Number(value) })}
              defaultValue={searchParams.idLine ? String(searchParams.idLine) : undefined}
            >
              <SelectTrigger className="h-10 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <SelectValue placeholder="Seleccione una línea" />
              </SelectTrigger>
              <SelectContent>
                {(linesQuery.data ?? []).map((line) => (
                  <SelectItem key={line.id} value={String(line.id)}>
                    {line.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {!searchParams.idLine ? (
        <div className="py-16 text-center text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed">
          <SearchIcon className="h-8 w-8 mx-auto mb-2 opacity-20" />
          <p>Selecciona una línea de producción para ver sus áreas</p>
        </div>
      ) : areasQuery.isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <Card key={i} className="animate-pulse h-40" />
          ))}
        </div>
      ) : areas.length === 0 ? (
        <div className="py-16 text-center text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed">
          <Building2Icon className="h-8 w-8 mx-auto mb-2 opacity-20" />
          <p>Esta línea no tiene áreas de limpieza asignadas todavía</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {areas.map((area) => (
            <CleaningAreaCard
              key={area.idArea}
              area={area}
              idLine={searchParams.idLine as number}
            />
          ))}
        </div>
      )}
    </div>
  );
}
