"use client";

import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { LayoutGridIcon, Hash, Activity, Settings } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getSettingSignsBodyService } from "./server/db/setting-signs-body.service";
import { NewSettingSignsBody } from "./components/new-setting-signs-body";
import { UpdateSettingSignsBody } from "./components/update-setting-signs-body";
import { DeleteSettingSignsBody } from "./components/delete-setting-signs-body";
import { TableSettingSignsBody } from "./components/table-setting-signs-body";
import { SETTING_SIGNS_BODY_TAG } from "./constants/setting-signs-body.constants";

export function SettingSignsBodyManagement({
  idClinicalSigns,
}: {
  idClinicalSigns: number;
}) {
  const query = useQuery({
    queryKey: [SETTING_SIGNS_BODY_TAG],
    queryFn: getSettingSignsBodyService,
  });

  const filteredData = useMemo(() => {
    const items = query.data?.data ?? [];
    return items.filter((item) => item.idClinicalSigns === idClinicalSigns);
  }, [query.data, idClinicalSigns]);

  return (
    <div>
      <div className="flex justify-end mb-4">
        <NewSettingSignsBody idClinicalSigns={idClinicalSigns} />
      </div>

      <TableSettingSignsBody
        columns={[
          {
            accessorKey: "bodyParts",
            header: () => (
              <div className="flex items-center gap-2">
                <Hash className="h-4 w-4" />
                Código
              </div>
            ),
            cell: ({ row }) => <span>{row.original.bodyParts?.code ?? "-"}</span>,
          },
          {
            id: "bodyPartsDescription",
            header: () => (
              <div className="flex items-center gap-2">
                <LayoutGridIcon className="h-4 w-4" />
                Parte del Cuerpo
              </div>
            ),
            cell: ({ row }) => (
              <span>{row.original.bodyParts?.description ?? "-"}</span>
            ),
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
                <UpdateSettingSignsBody settingSignsBody={row.original} />
                <DeleteSettingSignsBody settingSignsBody={row.original} />
              </div>
            ),
          },
        ]}
        data={filteredData}
        isLoading={query.isLoading}
      />
    </div>
  );
}
