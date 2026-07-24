"use client";

import { Badge } from "@/components/ui/badge";
import { ShieldCheckIcon } from "lucide-react";
import { TableSettingHygiene } from "./table-setting-hygiene";
import { useQuery } from "@tanstack/react-query";
import { getSettingHygieneAdminService } from "./server/db/setting-hygiene-admin.service";
import { NewSettingHygiene } from "./components/new-setting-hygiene";
import { UpdateSettingHygiene } from "./components/update-setting-hygiene";

export function SettingHygieneManagement() {
  const query = useQuery({
    queryKey: ["setting-hygiene-admin"],
    queryFn: getSettingHygieneAdminService,
  });

  const rows = query.data?.data ?? [];
  const activeEquipmentIds = rows.filter((r) => r.status).map((r) => r.idEquipment);

  return (
    <div>
      <section className="mb-4 flex flex-col sm:flex-row sm:justify-between gap-2">
        <div>
          <h1 className="flex items-center gap-x-2 font-semibold text-xl">
            <ShieldCheckIcon />
            Configuración de Higiene por Equipo
          </h1>
          <p className="text-gray-600 text-sm mt-1">
            Define qué equipos requieren control de higiene, usado en los registros de Control de Higiene.
          </p>
        </div>
        <div className="flex gap-x-2">
          <NewSettingHygiene excludeEquipmentIds={activeEquipmentIds} />
        </div>
      </section>

      <TableSettingHygiene
        columns={[
          {
            accessorKey: "equipment",
            header: () => (
              <div className="flex items-center gap-2">
                <ShieldCheckIcon className="h-4 w-4" />
                Equipo
              </div>
            ),
            cell: ({ row }) => <span className="font-medium">{row.original.equipment?.description ?? "-"}</span>,
          },
          {
            accessorKey: "equipmentType",
            header: () => <div>Tipo de equipo</div>,
            cell: ({ row }) => <span>{row.original.equipment?.equipmentType?.description ?? "-"}</span>,
          },
          {
            accessorKey: "status",
            header: () => <div>Estado</div>,
            cell: ({ row }) => <Badge>{row.original.status ? "Activo" : "Inactivo"}</Badge>,
          },
          {
            id: "actions",
            header: () => <div className="flex items-center justify-center">Acciones</div>,
            cell: ({ row }) => (
              <div className="flex justify-center">
                <UpdateSettingHygiene
                  settingHygiene={row.original}
                  excludeEquipmentIds={activeEquipmentIds.filter((id) => id !== row.original.idEquipment)}
                />
              </div>
            ),
          },
        ]}
        data={rows}
        isLoading={query.isLoading}
      />
    </div>
  );
}
