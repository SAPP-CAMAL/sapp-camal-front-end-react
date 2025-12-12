import { useQuery } from "@tanstack/react-query";
import { getAllEquipmentHygieneControlService } from "../server/db/hygiene-control.service";
import { GroupedEquipmentHygiene } from "../domain/equipment-hygiene-control.types";

export const useAllEquipmentHygieneControl = (enabled = true) => {
  return useQuery({
    queryKey: ["equipment-hygiene-control-all"],
    queryFn: async (): Promise<GroupedEquipmentHygiene[]> => {
      const response = await getAllEquipmentHygieneControlService();

      if (!response?.data) return [];

      const grouped = response.data.reduce<Record<number, GroupedEquipmentHygiene>>(
        (acc, item) => {
          const eqType = item.equipmentType;
          if (!eqType) return acc;

          if (!acc[eqType.id]) {
            acc[eqType.id] = {
              equipmentTypeId: eqType.id,
              equipmentTypeDescription: eqType.description,
              items: [],
            };
          }

          acc[eqType.id].items.push(item);
          return acc;
        },
        {}
      );

      return Object.values(grouped);
    },
    staleTime: 1000 * 60 * 5, 
    enabled,
  });
};


