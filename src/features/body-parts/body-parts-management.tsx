"use client";

import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Hash, FileText, Activity, Settings } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getBodyPartsService } from "./server/db/body-parts.service";
import { NewBodyParts } from "./components/new-body-parts";
import { UpdateBodyParts } from "./components/update-body-parts";
import { DeleteBodyParts } from "./components/delete-body-parts";
import { TableBodyParts } from "./components/table-body-parts";
import { BODY_PARTS_TAG } from "./constants/body-parts.constants";

export function BodyPartsManagement({ idPartType }: { idPartType: number }) {
  const query = useQuery({
    queryKey: [BODY_PARTS_TAG],
    queryFn: getBodyPartsService,
  });

  const filteredData = useMemo(() => {
    const items = query.data?.data ?? [];
    return items.filter((item) => item.idPartType === idPartType);
  }, [query.data, idPartType]);

  return (
    <div>
      <div className="flex justify-end mb-4">
        <NewBodyParts idPartType={idPartType} />
      </div>

      <TableBodyParts
        columns={[
          {
            accessorKey: "code",
            header: () => (
              <div className="flex items-center gap-2">
                <Hash className="h-4 w-4" />
                Código
              </div>
            ),
            cell: ({ row }) => <span>{row.original.code}</span>,
          },
          {
            accessorKey: "description",
            header: () => (
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Descripción
              </div>
            ),
            cell: ({ row }) => <span>{row.original.description}</span>,
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
                <UpdateBodyParts bodyParts={row.original} />
                <DeleteBodyParts bodyParts={row.original} />
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
