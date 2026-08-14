"use client";

import { Badge } from "@/components/ui/badge";
import { ScaleIcon, Activity, Settings } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { parseAsInteger, parseAsString, useQueryStates } from "nuqs";
import {
  getSettingWeighingStagesPaginatedService,
  getSettingWeighingStagesService,
} from "./server/db/setting-weighing-stage.service";
import { NewSettingWeighingStage } from "./components/new-setting-weighing-stage";
import { UpdateSettingWeighingStage } from "./components/update-setting-weighing-stage";
import { DeleteSettingWeighingStage } from "./components/delete-setting-weighing-stage";
import { TableSettingWeighingStages } from "./components/table-setting-weighing-stages";
import { SETTING_WEIGHING_STAGES_TAG } from "./constants/setting-weighing-stage.constants";
import {
  Card,
  CardContent,
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

export function SettingWeighingStageManagement() {
  const [searchParams, setSearchParams] = useQueryStates(
    {
      page: parseAsInteger.withDefault(1),
      limit: parseAsInteger.withDefault(10),
      status: parseAsString.withDefault("*"),
    },
    {
      history: "push",
    }
  );

  const allQuery = useQuery({
    queryKey: [SETTING_WEIGHING_STAGES_TAG, "all"],
    queryFn: getSettingWeighingStagesService,
  });

  const query = useQuery({
    queryKey: [SETTING_WEIGHING_STAGES_TAG, searchParams],
    queryFn: () =>
      getSettingWeighingStagesPaginatedService({
        page: searchParams.page,
        limit: searchParams.limit,
        ...(searchParams.status !== "*" && {
          status: searchParams.status === "true",
        }),
      }),
  });

  const existingSettings = allQuery.data?.data ?? [];

  return (
    <div>
      <section className="mb-4 flex flex-col sm:flex-row sm:justify-between gap-2">
        <div>
          <h1 className="flex items-center gap-x-2 font-semibold text-xl">
            <ScaleIcon />
            Etapas de Pesaje Habilitadas para Distribución
          </h1>
          <p className="text-gray-600 text-sm mt-1">
            Configura qué etapas de pesaje están habilitadas para el flujo
            de distribución.
          </p>
        </div>
        <div className="flex gap-x-2">
          <NewSettingWeighingStage existingSettings={existingSettings} />
        </div>
      </section>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="flex gap-2 items-center">
            Filtros de Búsqueda
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex flex-col w-full">
              <label className="mb-1 text-sm font-medium text-gray-700">
                Estado
              </label>
              <Select
                onValueChange={(value) =>
                  setSearchParams({ status: value, page: 1 })
                }
                value={searchParams.status}
              >
                <SelectTrigger className="h-10 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <SelectValue placeholder="Seleccione un estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="*">Todos</SelectItem>
                  <SelectItem value="true">Habilitadas</SelectItem>
                  <SelectItem value="false">Deshabilitadas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <TableSettingWeighingStages
        columns={[
          {
            accessorKey: "weighingStage",
            header: () => (
              <div className="flex items-center gap-2">
                <ScaleIcon className="h-4 w-4" />
                Etapa de Pesaje
              </div>
            ),
            cell: ({ row }) =>
              row.original.weighingStage?.name ??
              `Etapa #${row.original.idWeighingStage}`,
          },
          {
            accessorKey: "description",
            header: () => "Descripción",
            cell: ({ row }) => row.original.description || "—",
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
              <Badge>{row.original.status ? "Habilitada" : "Deshabilitada"}</Badge>
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
                <UpdateSettingWeighingStage settingWeighingStage={row.original} />
                <DeleteSettingWeighingStage settingWeighingStage={row.original} />
              </div>
            ),
          },
        ]}
        data={query.data?.data.items ?? []}
        meta={{
          ...query.data?.data.meta,
          onChangePage: (page) => setSearchParams({ page }),
          onNextPage: () => setSearchParams({ page: searchParams.page + 1 }),
          disabledNextPage:
            searchParams.page >= (query.data?.data.meta.totalPages ?? 0),
          onPreviousPage: () =>
            setSearchParams({ page: searchParams.page - 1 }),
          disabledPreviousPage: searchParams.page <= 1,
          setSearchParams,
        }}
        isLoading={query.isLoading}
      />
    </div>
  );
}
