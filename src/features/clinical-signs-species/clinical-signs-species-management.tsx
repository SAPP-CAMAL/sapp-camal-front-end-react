"use client";

import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { PawPrintIcon, FileText, Activity, Settings } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getClinicalSignsSpeciesService } from "./server/db/clinical-signs-species.service";
import { NewClinicalSignsSpecies } from "./components/new-clinical-signs-species";
import { UpdateClinicalSignsSpecies } from "./components/update-clinical-signs-species";
import { DeleteClinicalSignsSpecies } from "./components/delete-clinical-signs-species";
import { TableClinicalSignsSpecies } from "./components/table-clinical-signs-species";
import { CLINICAL_SIGNS_SPECIES_TAG } from "./constants/clinical-signs-species.constants";

export function ClinicalSignsSpeciesManagement({
  idClinicalSigns,
}: {
  idClinicalSigns: number;
}) {
  const query = useQuery({
    queryKey: [CLINICAL_SIGNS_SPECIES_TAG],
    queryFn: getClinicalSignsSpeciesService,
  });

  const filteredData = useMemo(() => {
    const items = query.data?.data ?? [];
    return items.filter((item) => item.idClinicalSigns === idClinicalSigns);
  }, [query.data, idClinicalSigns]);

  return (
    <div>
      <div className="flex justify-end mb-4">
        <NewClinicalSignsSpecies idClinicalSigns={idClinicalSigns} />
      </div>

      <TableClinicalSignsSpecies
        columns={[
          {
            accessorKey: "species",
            header: () => (
              <div className="flex items-center gap-2">
                <PawPrintIcon className="h-4 w-4" />
                Especie
              </div>
            ),
            cell: ({ row }) => <span>{row.original.species?.name ?? "-"}</span>,
          },
          {
            accessorKey: "details",
            header: () => (
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Detalles
              </div>
            ),
            cell: ({ row }) => <span>{row.original.details ?? ""}</span>,
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
                <UpdateClinicalSignsSpecies clinicalSignsSpecies={row.original} />
                <DeleteClinicalSignsSpecies clinicalSignsSpecies={row.original} />
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
