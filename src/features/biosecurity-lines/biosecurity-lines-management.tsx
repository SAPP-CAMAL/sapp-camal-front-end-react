"use client";

import { ShieldCheckIcon, SearchIcon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { parseAsInteger, parseAsString, useQueryStates } from "nuqs";
import { useDebouncedCallback } from "use-debounce";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PaginationFooter } from "@/components/ui/pagination-footer";
import { getActiveLinesService } from "@/features/postmortem/server/db/line.service";
import { getBiosecurityLinesPaginatedService } from "./server/db/biosecurity-lines.service";
import { BIOSECURITY_LINES_TAG } from "./constants/biosecurity-lines.constants";
import { NewBiosecurityLine } from "./components/new-biosecurity-line";
import { BiosecurityLineCard } from "./components/biosecurity-line-card";

export function BiosecurityLinesManagement() {
  const [searchParams, setSearchParams] = useQueryStates(
    {
      page: parseAsInteger.withDefault(1),
      limit: parseAsInteger.withDefault(10),
      idLine: parseAsInteger,
      name: parseAsString.withDefault(""),
    },
    {
      history: "push",
    }
  );

  const linesQuery = useQuery({
    queryKey: ["active-lines"],
    queryFn: getActiveLinesService,
  });

  const biosecurityLinesQuery = useQuery({
    queryKey: [BIOSECURITY_LINES_TAG, searchParams],
    queryFn: () =>
      getBiosecurityLinesPaginatedService({
        page: searchParams.page,
        limit: searchParams.limit,
        idLine: searchParams.idLine as number,
        ...(searchParams.name && { name: searchParams.name }),
      }),
    enabled: !!searchParams.idLine,
  });

  const debounceName = useDebouncedCallback(
    (text: string) => setSearchParams({ name: text, page: 1 }),
    500
  );

  const items = biosecurityLinesQuery.data?.data.items ?? [];

  return (
    <div>
      <section className="mb-4 flex flex-col sm:flex-row sm:justify-between gap-2">
        <div>
          <h1 className="flex items-center gap-x-2 font-semibold text-xl">
            <ShieldCheckIcon />
            Líneas de Bioseguridad y Equipos por Línea
          </h1>
          <p className="text-gray-600 text-sm mt-1">
            Configura qué línea de producción tiene bioseguridad activa y qué
            equipos de bioseguridad están asignados a cada línea.
          </p>
        </div>
        {searchParams.idLine && (
          <div className="flex gap-x-2">
            <NewBiosecurityLine idLine={searchParams.idLine} />
          </div>
        )}
      </section>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Filtros de Búsqueda</CardTitle>
          <CardDescription>
            Selecciona una línea para ver y configurar sus perfiles de
            bioseguridad, y filtra por nombre si hace falta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col w-full">
              <label className="mb-1 text-sm font-medium text-gray-700">
                Línea de Producción
              </label>
              <Select
                onValueChange={(value) =>
                  setSearchParams({ idLine: Number(value), page: 1 })
                }
                value={searchParams.idLine ? String(searchParams.idLine) : undefined}
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

            <div className="flex flex-col w-full">
              <label className="mb-1 text-sm font-medium text-gray-700">
                Buscar por nombre
              </label>
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 z-10 h-5 w-5" />
                <Input
                  type="text"
                  placeholder="Buscar por nombre..."
                  className="pl-10 pr-3 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2"
                  defaultValue={searchParams.name}
                  onChange={(e) => debounceName(e.target.value)}
                  disabled={!searchParams.idLine}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {!searchParams.idLine ? (
        <div className="py-16 text-center text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed">
          <SearchIcon className="h-8 w-8 mx-auto mb-2 opacity-20" />
          <p>Selecciona una línea de producción para ver sus perfiles</p>
        </div>
      ) : biosecurityLinesQuery.isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <Card key={i} className="animate-pulse h-40" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="py-16 text-center text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed">
          <ShieldCheckIcon className="h-8 w-8 mx-auto mb-2 opacity-20" />
          <p>Esta línea no tiene perfiles de bioseguridad todavía</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {items.map((biosecurityLine) => (
              <BiosecurityLineCard
                key={biosecurityLine.id}
                biosecurityLine={biosecurityLine}
              />
            ))}
          </div>

          <div className="bg-white border rounded-lg mt-4">
            <PaginationFooter
              meta={{
                ...biosecurityLinesQuery.data?.data.meta,
                onChangePage: (page) => setSearchParams({ page }),
                setSearchParams,
              }}
              isLoading={biosecurityLinesQuery.isLoading}
              hasData={!!items.length}
              onPreviousPage={() => setSearchParams({ page: searchParams.page - 1 })}
              onNextPage={() => setSearchParams({ page: searchParams.page + 1 })}
              disabledPreviousPage={searchParams.page <= 1}
              disabledNextPage={
                searchParams.page >= (biosecurityLinesQuery.data?.data.meta.totalPages ?? 0)
              }
              itemLabel="perfiles"
            />
          </div>
        </>
      )}
    </div>
  );
}
