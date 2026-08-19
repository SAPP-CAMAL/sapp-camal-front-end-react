"use client";

import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { PawPrintIcon, Activity, Settings } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getSpeciesDiseasesService } from "./server/db/species-disease.service";
import { NewSpeciesDisease } from "./components/new-species-disease";
import { UpdateSpeciesDisease } from "./components/update-species-disease";
import { DeleteSpeciesDisease } from "./components/delete-species-disease";
import { TableSpeciesDisease } from "./components/table-species-disease";
import { SPECIES_DISEASE_TAG } from "./constants/species-disease.constants";

export function SpeciesDiseaseManagement({
  idProductDisease,
}: {
  idProductDisease: number;
}) {
  const query = useQuery({
    queryKey: [SPECIES_DISEASE_TAG],
    queryFn: getSpeciesDiseasesService,
  });

  const filteredData = useMemo(() => {
    const items = query.data?.data ?? [];
    return items.filter(
      (item) => item.productDisease?.id === idProductDisease
    );
  }, [query.data, idProductDisease]);

  return (
    <div>
      <div className="flex justify-end mb-4">
        <NewSpeciesDisease idProductDisease={idProductDisease} />
      </div>

      <TableSpeciesDisease
        columns={[
          {
            id: "specie",
            header: () => (
              <div className="flex items-center gap-2">
                <PawPrintIcon className="h-4 w-4" />
                Especie
              </div>
            ),
            cell: ({ row }) => <span>{row.original.specie?.name ?? "-"}</span>,
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
                <UpdateSpeciesDisease speciesDisease={row.original} />
                <DeleteSpeciesDisease speciesDisease={row.original} />
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
