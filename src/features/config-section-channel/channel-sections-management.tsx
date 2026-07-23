"use client";

import { Badge } from "@/components/ui/badge";
import { Hash, ListOrdered, FileText, Activity, Settings } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getConfigSectionChannelsByChannelTypeService } from "./server/db/config-section-channel.service";
import { NewConfigSectionChannel } from "./components/new-config-section-channel";
import { UpdateConfigSectionChannel } from "./components/update-config-section-channel";
import { DeleteConfigSectionChannel } from "./components/delete-config-section-channel";
import { TableConfigSectionChannel } from "./components/table-config-section-channel";
import { CONFIG_SECTION_CHANNEL_TAG } from "./constants/config-section-channel.constants";

export function ChannelSectionsManagement({
  idChannelType,
}: {
  idChannelType: number;
}) {
  const query = useQuery({
    queryKey: [CONFIG_SECTION_CHANNEL_TAG, idChannelType],
    queryFn: () => getConfigSectionChannelsByChannelTypeService(idChannelType),
  });

  return (
    <div>
      <div className="flex justify-end mb-4">
        <NewConfigSectionChannel idChannelType={idChannelType} />
      </div>

      <TableConfigSectionChannel
        columns={[
          {
            accessorKey: "sectionCode",
            header: () => (
              <div className="flex items-center gap-2">
                <Hash className="h-4 w-4" />
                Código
              </div>
            ),
            cell: ({ row }) => <span>{row.original.sectionCode}</span>,
          },
          {
            accessorKey: "orderNumber",
            header: () => (
              <div className="flex items-center gap-2">
                <ListOrdered className="h-4 w-4" />
                Orden
              </div>
            ),
            cell: ({ row }) => <span>{row.original.orderNumber}</span>,
          },
          {
            accessorKey: "description",
            header: () => (
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Descripción
              </div>
            ),
            cell: ({ row }) => <span>{row.original.description ?? ""}</span>,
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
                <UpdateConfigSectionChannel
                  configSectionChannel={row.original}
                  idChannelType={idChannelType}
                />
                <DeleteConfigSectionChannel
                  configSectionChannel={row.original}
                  idChannelType={idChannelType}
                />
              </div>
            ),
          },
        ]}
        data={query.data?.data ?? []}
        isLoading={query.isLoading}
      />
    </div>
  );
}
