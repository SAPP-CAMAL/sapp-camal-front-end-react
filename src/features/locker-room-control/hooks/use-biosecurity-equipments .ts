// hooks/useBiosecurityEquipments.ts
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getSettingEquipmentsByBiosecurityLineService } from "../server/db/biosecurity-line.service";
import { BiosecurityLineApiResponse } from "../domain/biosecurityLines.types";

export function useBiosecurityEquipments(idBiosecurityLine: number) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["setting-equipments", idBiosecurityLine],
    queryFn: () => getSettingEquipmentsByBiosecurityLineService(idBiosecurityLine),
    enabled: !!idBiosecurityLine, // evita llamar si es undefined o 0
  });

  // Agrupamos los datos una vez cargados
  const groupedData = useMemo(() => {
     if (!Array.isArray(data?.data)) return [];

    return data?.data.reduce((acc:any, item:any) => {
      const category = item.equipment.equipmentType.description.toUpperCase(); 
      if (!acc[category]) acc[category] = [];
      acc[category].push(item);
      return acc;
    }, {} as Record<string, BiosecurityLineApiResponse[]>);
  }, [data]);

  return {
    isLoading,
    isError,
    groupedData,
  };
};
