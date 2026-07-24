"use client";

import { Badge } from "@/components/ui/badge";
import { ScaleIcon, Activity, Settings } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getSettingWeighingStagesService } from "./server/db/setting-weighing-stage.service";
import { NewSettingWeighingStage } from "./components/new-setting-weighing-stage";
import { UpdateSettingWeighingStage } from "./components/update-setting-weighing-stage";
import { DeleteSettingWeighingStage } from "./components/delete-setting-weighing-stage";
import { TableSettingWeighingStages } from "./components/table-setting-weighing-stages";
import { SETTING_WEIGHING_STAGES_TAG } from "./constants/setting-weighing-stage.constants";

export function SettingWeighingStageManagement() {
  const query = useQuery({
    queryKey: [SETTING_WEIGHING_STAGES_TAG],
    queryFn: getSettingWeighingStagesService,
  });

  const settings = query.data?.data ?? [];

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
          <NewSettingWeighingStage existingSettings={settings} />
        </div>
      </section>

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
        data={settings}
        isLoading={query.isLoading}
      />
    </div>
  );
}
